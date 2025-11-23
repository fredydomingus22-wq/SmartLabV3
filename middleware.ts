import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// TEMPORARY: Authentication disabled while Supabase is in maintenance
// Uncomment the code below when Supabase is back
export async function middleware(request: NextRequest) {
    // BYPASS ALL AUTH - TEMPORARY
    return NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    /* RESTORE THIS CODE WHEN SUPABASE IS BACK:
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

    // Auth protection logic
    const publicPaths = ["/login", "/forgot-password", "/auth/callback", "/reset-password"];
    const isPublic = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));
    const isStaticAsset =
        request.nextUrl.pathname.startsWith("/_next") ||
        request.nextUrl.pathname.startsWith("/static") ||
        request.nextUrl.pathname === "/favicon.ico" ||
        request.nextUrl.pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i);

    if (!user && !isPublic && !isStaticAsset) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        if (request.nextUrl.pathname !== "/") {
            redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
        }
        return NextResponse.redirect(redirectUrl);
    }

    return response;
    */
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
