import TanksClient from "./TanksClient";

// Force dynamic rendering - this prevents static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TanksPage() {
    return <TanksClient />;
}
