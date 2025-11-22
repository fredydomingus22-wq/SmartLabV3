import { createClient } from "@/lib/supabase/client";
import { Training, TrainingAssignment } from "@/types/training";

export async function getTrainings() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("date", { ascending: false });

    if (error) throw error;
    return data as Training[];
}

export async function getTrainingById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Training;
}

export async function createTraining(training: Omit<Training, 'id' | 'created_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("trainings")
        .insert(training)
        .select()
        .single();

    if (error) throw error;
    return data as Training;
}

export async function getTrainingAssignments(userId?: string) {
    const supabase = createClient();
    let query = supabase
        .from("training_assignments")
        .select(`
            *,
            training:trainings(*),
            user:profiles(full_name, email)
        `)
        .order("assigned_date", { ascending: false });

    if (userId) {
        query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as any[];
}

export async function assignTraining(trainingId: string, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("training_assignments")
        .insert({
            training_id: trainingId,
            user_id: userId,
            assigned_date: new Date().toISOString(),
            status: 'assigned'
        })
        .select()
        .single();

    if (error) throw error;
    return data as TrainingAssignment;
}

export async function updateAssignment(id: string, updates: Partial<TrainingAssignment>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("training_assignments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as TrainingAssignment;
}
