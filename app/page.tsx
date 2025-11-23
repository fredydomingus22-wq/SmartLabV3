import { redirect } from 'next/navigation';

// TEMPORARY: Auto-redirect to dashboard while Supabase is in maintenance
// Remove this and restore login when Supabase is back
export default function Home() {
    redirect('/dashboard');
}
