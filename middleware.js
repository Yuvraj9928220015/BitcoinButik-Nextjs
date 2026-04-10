import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if user is trying to access protected Dashboard routes (except login page itself)
    const isProtectedRoute =
        pathname.startsWith('/Dashboard') &&
        pathname !== '/Dashboard/Admin' &&
        pathname !== '/Dashboard/Admin/';

    const isLoggedIn = request.cookies.get('admin_auth')?.value === 'true';

    if (isProtectedRoute && !isLoggedIn) {
        // Redirect to login page
        return NextResponse.redirect(new URL('/Dashboard/Admin', request.url));
    }

    // If already logged in and visiting login page, redirect to ProductList
    if ((pathname === '/Dashboard/Admin' || pathname === '/Dashboard/Admin/') && isLoggedIn) {
        return NextResponse.redirect(new URL('/Dashboard/Admin/ProductList', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/Dashboard/:path*'],
};