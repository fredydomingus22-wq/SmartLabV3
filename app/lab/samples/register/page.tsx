"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SampleRegistrationForm } from "@/components/lab/samples/SampleRegistrationForm";

export default function RegisterSamplePage() {
    return (
        <AppShell>
            <div className="p-6">
                <SectionHeader
                    title="Sample Registration"
                    description="Register a new sample for laboratory analysis"
                />
                <div className="mt-6">
                    <SampleRegistrationForm />
                </div>
            </div>
        </AppShell>
    );
}
