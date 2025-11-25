"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SettingsManager } from "./components/SettingsManager";

export default function AdminSettingsPage() {
    return (
        <div className="p-6 space-y-6">
            <SectionHeader
                title="Admin Settings"
                description="Configure global system settings for the SmartLab platform. Manage company info, UI theme, enabled modules and any custom key/value pairs."
            />
            <SettingsManager />
        </div>
    );
}
