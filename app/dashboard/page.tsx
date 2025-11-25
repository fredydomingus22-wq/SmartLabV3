"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getDashboardMetrics } from "@/lib/queries/dashboard";
import { getCurrentUserProfile } from "@/lib/db-helpers";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentRole } from "@/lib/auth/role";

// Dashboards
import { TechDashboard } from "./components/TechDashboard";
import { SupervisorDashboard } from "./components/SupervisorDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

interface DashboardMetrics {
    releasedCount: number;
    ncCount: number;
    pccPrecision: string;
    avgTurnaround: string;
    trainingsCount: number;
    quarantineCount: number;
}

interface UserProfile {
    full_name?: string;
    role?: string;
    email?: string;
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const role = useCurrentRole();

    useEffect(() => {
        loadDashboardData();

        // Update time every minute
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const [metricsData, profileData] = await Promise.all([
                getDashboardMetrics(),
                getCurrentUserProfile()
            ]);

            setMetrics(metricsData);
            setProfile(profileData);
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    const formatTime = () => {
        return currentTime.toLocaleDateString('pt-PT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderDashboardContent = () => {
        if (loading && !role) {
            return <div className="p-10 text-center text-slate-500">Carregando perfil...</div>;
        }

        switch (role) {
            case 'technician':
                return <TechDashboard />;
            case 'supervisor':
                return <SupervisorDashboard />;
            case 'manager':
            case 'admin':
            default:
                return <ManagerDashboard metrics={metrics} loading={loading} />;
        }
    };

    return (
        <AppShell>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-6">
                {/* Header Section with Glassmorphism */}
                <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

                    {/* Header Card */}
                    <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 p-8 overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-full blur-3xl" />

                        <div className="relative flex items-start justify-between">
                            <div className="space-y-2">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                                        SmartLab Enterprise
                                    </span>
                                </div>

                                {/* Greeting */}
                                <h1 className="text-4xl font-bold tracking-tight text-white">
                                    {getGreeting()},{" "}
                                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        {loading ? (
                                            <Skeleton className="inline-block w-32 h-10" />
                                        ) : (
                                            profile?.full_name?.split(' ')[0] || 'Utilizador'
                                        )}
                                    </span>
                                </h1>

                                {/* Subtitle */}
                                <p className="text-slate-400 text-sm">
                                    {formatTime()}
                                </p>
                            </div>

                            {/* Quick Stats Badge */}
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                        Status do Sistema
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-sm font-semibold text-white">Operacional</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role-Based Content */}
                {renderDashboardContent()}

                {/* Floating Action Button (for everyone for now, or filter inside component) */}
                <FloatingActionButton />
            </div>
        </AppShell>
    );
}
