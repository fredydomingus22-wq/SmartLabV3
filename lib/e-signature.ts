import { createClient } from '@/lib/supabase/client';
import { getCurrentUserRole } from './rbac';

/**
 * E-Signature Module
 * Implements electronic signatures for 21 CFR Part 11 compliance
 */

export type SignatureMeaning = 'approved' | 'reviewed' | 'witnessed' | 'performed' | 'verified';

export interface ESignature {
    id: string;
    entity_type: string;
    entity_id: string;
    meaning: SignatureMeaning;
    user_id: string;
    user_email: string;
    user_full_name: string;
    user_role: string;
    signature_hash: string;
    signed_at: string;
    ip_address?: string;
    user_agent?: string;
    tenant_id?: string;
    comment?: string;
    created_at: string;
}

export interface SignatureRequirement {
    entity_type: string;
    workflow_status: string;
    required_meaning: SignatureMeaning;
    required_role: string;
    description?: string;
}

/**
 * Capture an electronic signature for an entity
 * Requires password re-verification
 * 
 * @param password - User's password for verification
 * @param meaning - What the signature represents
 * @param entityType - Type of entity being signed
 * @param entityId - ID of entity being signed
 * @param comment - Optional comment about the signature
 * @returns Success status and error message if failed
 */
export async function captureSignature(
    password: string,
    meaning: SignatureMeaning,
    entityType: string,
    entityId: string,
    comment?: string
): Promise<{ success: boolean; error?: string; signatureId?: string }> {
    const supabase = createClient();

    try {
        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // 2. Verify password by attempting to sign in
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: password
        });

        if (authError) {
            return { success: false, error: 'Invalid password - signature rejected' };
        }

        // 3. Get user profile for full name and role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'User profile not found' };
        }

        // 4. Get client IP (best effort)
        const ipAddress = await getClientIP();

        // 5. Create signature hash (user_id:timestamp:entity)
        const signatureData = `${user.id}:${Date.now()}:${entityType}:${entityId}:${meaning}`;
        const signatureHash = await createHash(signatureData);

        // 6. Get tenant_id from current context
        const { data: tenantMember } = await supabase
            .from('tenant_members')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single();

        // 7. Insert signature record
        const { data: signature, error: insertError } = await supabase
            .from('e_signatures')
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                meaning,
                user_id: user.id,
                user_email: user.email,
                user_full_name: profile.full_name || user.email,
                user_role: profile.role,
                signature_hash: signatureHash,
                signed_at: new Date().toISOString(),
                ip_address: ipAddress,
                user_agent: navigator.userAgent,
                tenant_id: tenantMember?.tenant_id,
                comment
            })
            .select()
            .single();

        if (insertError) {
            // Check if signature already exists
            if (insertError.code === '23505') {
                return { success: false, error: 'You have already signed this with the same meaning' };
            }
            return { success: false, error: insertError.message };
        }

        return { success: true, signatureId: signature.id };

    } catch (error) {
        console.error('Signature capture error:', error);
        return { success: false, error: 'Unexpected error during signature capture' };
    }
}

/**
 * Get all signatures for a specific entity
 * 
 * @param entityType - Type of entity
 * @param entityId - ID of entity
 * @returns Array of signatures
 */
export async function getEntitySignatures(
    entityType: string,
    entityId: string
): Promise<ESignature[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('e_signatures')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('signed_at', { ascending: false });

    if (error) {
        console.error('Error fetching signatures:', error);
        return [];
    }

    return data || [];
}

/**
 * Check if an entity has a specific signature
 * 
 * @param entityType - Type of entity
 * @param entityId - ID of entity
 * @param meaning - Signature meaning to check
 * @returns true if signature exists
 */
export async function hasSignature(
    entityType: string,
    entityId: string,
    meaning: SignatureMeaning
): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
        .rpc('has_signature', {
            p_entity_type: entityType,
            p_entity_id: entityId,
            p_meaning: meaning
        });

    if (error) {
        console.error('Error checking signature:', error);
        return false;
    }

    return data === true;
}

/**
 * Get signature requirements for an entity at a specific workflow status
 * 
 * @param entityType - Type of entity
 * @param workflowStatus - Current workflow status
 * @returns Array of required signatures
 */
export async function getSignatureRequirements(
    entityType: string,
    workflowStatus: string
): Promise<SignatureRequirement[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('signature_requirements')
        .select('*')
        .eq('entity_type', entityType)
        .eq('workflow_status', workflowStatus);

    if (error) {
        console.error('Error fetching signature requirements:', error);
        return [];
    }

    return data || [];
}

/**
 * Check if current user can provide a specific signature
 * 
 * @param requiredRole - Role required for signature
 * @returns true if user has required role or higher
 */
export async function canSign(requiredRole: string): Promise<boolean> {
    const userRole = await getCurrentUserRole();

    if (!userRole) return false;

    // Admin can sign anything
    if (userRole === 'admin') return true;

    // Role hierarchy
    const roleHierarchy: Record<string, number> = {
        'technician': 1,
        'supervisor': 2,
        'manager': 3,
        'admin': 4,
        'auditor': 0  // Auditors cannot sign
    };

    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 99);
}

/**
 * Validate all required signatures are present before workflow transition
 * 
 * @param entityType - Type of entity
 * @param entityId - ID of entity
 * @param workflowStatus - Target workflow status
 * @returns Validation result with missing signatures
 */
export async function validateSignatures(
    entityType: string,
    entityId: string,
    workflowStatus: string
): Promise<{
    valid: boolean;
    missing: SignatureRequirement[];
}> {
    const requirements = await getSignatureRequirements(entityType, workflowStatus);
    const missing: SignatureRequirement[] = [];

    for (const req of requirements) {
        const exists = await hasSignature(entityType, entityId, req.required_meaning);
        if (!exists) {
            missing.push(req);
        }
    }

    return {
        valid: missing.length === 0,
        missing
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get client IP address (best effort)
 */
async function getClientIP(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
}

/**
 * Create simple hash of signature data
 * In production, use crypto.subtle.digest for proper cryptographic hash
 */
async function createHash(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback for server-side or browsers without crypto.subtle
    return Buffer.from(data).toString('base64');
}
