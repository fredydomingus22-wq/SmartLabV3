'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NCPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/ncm");
    }, [router]);

    return <div className="p-6 text-slate-200">Redirecting to Non-Conformity Command Center...</div>;
}
