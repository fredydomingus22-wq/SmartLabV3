// lib/hooks/useDashboardData.ts
"use client";

import { useEffect, useState } from "react";
import {
    getDashboardMetrics,
    getProcessData,
    getProductDistribution,
    getLineActivity,
    getTopAnalysts,
    getReleasedBlockedLots,
    getCapabilityMetrics,
    getInstantAlerts,
    getShiftNotes,
    getAnalysisTotal,
    getPendingSamples,
} from "@/lib/queries/dashboard";

/** Generic hook result shape */
interface HookResult<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

/** Dashboard KPI metrics */
export function useDashboardMetrics(): HookResult<Awaited<ReturnType<typeof getDashboardMetrics>>> {
    const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardMetrics>> | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getDashboardMetrics();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, isLoading, error, refetch: fetch };
}

/** Process data for a given parameter and time range */
export function useProcessData(parameter: string, timeRange: string): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getProcessData(parameter, timeRange);
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [parameter, timeRange]);

    return { data, isLoading, error, refetch: fetch };
}

/** Product distribution */
export function useProductDistribution(): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getProductDistribution();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, isLoading, error, refetch: fetch };
}

/** Line activity */
export function useLineActivity(): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getLineActivity();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, isLoading, error, refetch: fetch };
}

/** Top analysts */
export function useTopAnalysts(): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getTopAnalysts();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, isLoading, error, refetch: fetch };
}

/** Released vs blocked lots */
export function useReleasedBlockedLots(days: number = 5): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getReleasedBlockedLots(days);
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [days]);

    return { data, isLoading, error, refetch: fetch };
}

/** Capability metrics */
export function useCapabilityMetrics(): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getCapabilityMetrics();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, isLoading, error, refetch: fetch };
}

/** Instant alerts */
export function useInstantAlerts(): HookResult<any> {
    const [data, setData] = useState<any | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getInstantAlerts();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, isLoading, error, refetch: fetch };
}

/** Shift notes */
export function useShiftNotes(): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getShiftNotes();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, isLoading, error, refetch: fetch };
}

/** Analysis total count */
export function useAnalysisTotal(period: "daily" | "weekly" | "monthly" = "daily"): HookResult<number> {
    const [data, setData] = useState<number | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAnalysisTotal(period);
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [period]);

    return { data, isLoading, error, refetch: fetch };
}

/** Pending samples for technician dashboard */
export function usePendingSamples(limit: number = 10): HookResult<any[]> {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getPendingSamples(limit);
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [limit]);

    return { data, isLoading, error, refetch: fetch };
}
