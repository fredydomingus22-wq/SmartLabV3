'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseServerActionOptions<T> {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: Error) => void;
    redirect?: string;
}

/**
 * Hook to execute server actions with standardized loading, error handling, and success feedback
 * 
 * @example
 * const { execute, loading } = useServerAction(createSample, {
 *   successMessage: 'Sample created',
 *   onSuccess: (result) => router.push(`/lab/samples/${result.id}`)
 * });
 * 
 * await execute(formData);
 */
export function useServerAction<T>(
    action: (...args: any[]) => Promise<T>,
    options: UseServerActionOptions<T> = {}
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<T | null>(null);
    const router = useRouter();

    const execute = async (...args: any[]) => {
        setLoading(true);
        setError(null);

        try {
            const result = await action(...args);
            setData(result);

            if (options.successMessage) {
                toast.success(options.successMessage);
            }

            if (options.onSuccess) {
                await options.onSuccess(result);
            }

            if (options.redirect) {
                router.push(options.redirect);
            }

            return result;
        } catch (err: any) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);

            toast.error(error.message || options.errorMessage || 'Operation failed');

            if (options.onError) {
                options.onError(error);
            }

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setLoading(false);
        setError(null);
        setData(null);
    };

    return { execute, loading, error, data, reset };
}
