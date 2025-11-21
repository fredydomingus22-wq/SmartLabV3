'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    bucket?: string;
    path?: string;
    onUploadComplete: (url: string) => void;
    acceptedFileTypes?: string;
    maxSizeMB?: number;
    className?: string;
    label?: string;
}

export function FileUpload({
    bucket = 'documents',
    path = 'uploads',
    onUploadComplete,
    acceptedFileTypes = '*',
    maxSizeMB = 5,
    className,
    label = 'Upload File'
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Validate size
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setFileUrl(publicUrl);
            onUploadComplete(filePath); // Return the path or publicUrl depending on what backend expects. 
            // Usually path is better if we want to generate signed URLs later, but publicUrl is easier for public buckets.
            // Let's return the path as per the previous implementation which stored 'coa/...'

            toast.success('File uploaded successfully');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Error uploading file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClear = () => {
        setFileUrl(null);
        // creating a way to "clear" the selection from the parent would require more state lifting, 
        // but for now this clears the local view.
    };

    return (
        <div className={cn("w-full", className)}>
            {!fileUrl ? (
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full border-dashed border-2 h-24 flex flex-col gap-2 hover:bg-slate-50"
                    >
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        ) : (
                            <UploadCloud className="w-6 h-6 text-slate-400" />
                        )}
                        <span className="text-sm text-slate-500">
                            {uploading ? 'Uploading...' : label}
                        </span>
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFileTypes}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 border rounded-md bg-green-50 border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-green-900">Upload Complete</p>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline truncate max-w-[200px] block">
                                View File
                            </a>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClear} className="text-green-700 hover:text-green-900 hover:bg-green-100">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
