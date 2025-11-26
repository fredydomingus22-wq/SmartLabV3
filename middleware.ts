import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Route permissions matrix (Epic 5 - RBAC)
const ROUTE_PERMISSIONS = {
    '/production-lots': ['manager', 'supervisor', 'auditor'], // Technicians cannot manage lots
    '/product-specs': ['manager', 'admin'], // Only managers can edit specs
    '/admin': ['admin'], // Admin only
    '/nc': ['manager', 'supervisor', 'technician', 'auditor'], // All can view
    '/nc/create': ['manager', 'supervisor', 'technician'], // Auditors read-only
    '/lab-tests': ['technician', 'supervisor', 'auditor'], // Lab operations
    '/lab/samples': ['technician', 'supervisor'], // Sample registration
    '/technicians': ['admin', 'manager'], // Technician management
    '/reports': ['manager', 'supervisor', 'auditor'], // Reports access
} as const;

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Public paths that don't require authentication
    const publicPaths = ["/login", "/forgot-password", "/auth/callback", "/reset-password"];
    const isPublic = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));
    const isStaticAsset =
        request.nextUrl.pathname.startsWith("/_next") ||
        request.nextUrl.pathname.startsWith("/static") ||
        request.nextUrl.pathname === "/favicon.ico" ||
        request.nextUrl.pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i);

    // Redirect to login if not authenticated and not accessing public path
    if (!user && !isPublic && !isStaticAsset) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        if (request.nextUrl.pathname !== "/") {
            redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
        }
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users from login page to dashboard
    if (user && request.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect authenticated users from root to dashboard
    if (user && request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users from root to login
    if (!user && request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // RBAC: Check role-based permissions for protected routes
    if (user && !isPublic && !isStaticAsset) {
        // Get user profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const userRole = profile?.role as string;

        // Check if current path requires specific role
        const currentPath = request.nextUrl.pathname;
        const matchedRoute = Object.entries(ROUTE_PERMISSIONS).find(([path]) =>
            currentPath.startsWith(path)
        );
        const requiredRoles = matchedRoute?.[1] as string[] | undefined;

        if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
            // User doesn't have permission for this route
            const deniedUrl = new URL("/dashboard", request.url);
            deniedUrl.searchParams.set("error", "insufficient_permissions");
            deniedUrl.searchParams.set("required", currentPath);
            return NextResponse.redirect(deniedUrl);
        }
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
