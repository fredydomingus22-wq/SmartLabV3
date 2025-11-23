import NewLineAnalysisClient from "./NewLineAnalysisClient";

// Force dynamic rendering - this prevents static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NewLineAnalysisPage() {
    return <NewLineAnalysisClient />;
}
