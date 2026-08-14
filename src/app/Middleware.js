import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// همون سکرتی که توی lib/auth.js استفاده کردیم
const encodedKey = new TextEncoder().encode(process.env.AUTH_SECRET);
const SESSION_COOKIE_NAME = "session_token";

// مسیرهایی که فقط کاربر لاگین‌کرده اجازه‌ی دیدنشون رو داره
const PROTECTED_ROUTES = ["/profile", "/orders", "/checkout"];

// مسیرهایی که کاربر لاگین‌کرده نباید دوباره ببینتشون (مثلاً صفحه‌ی لاگین)
const AUTH_ROUTES = ["/login"];

async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload; // { userId, iat, exp }
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // اگه کاربر لاگین نیست و می‌خواد بره صفحه‌ی محافظت‌شده -> بفرست به لاگین
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    // آدرس مقصد رو نگه می‌داریم تا بعد از لاگین کاربر رو برگردونیم همونجا
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // اگه کاربر از قبل لاگین کرده و می‌خواد بره صفحه‌ی لاگین -> بفرست به خونه
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// این matcher تعیین می‌کنه middleware روی کدوم مسیرها اجرا بشه
// (فایل‌های استاتیک و API رو مستثنی می‌کنیم تا اجرای غیرلازم نداشته باشیم)
export const config = {
  matcher: ["/profile/:path*", "/orders/:path*", "/checkout/:path*", "/login"],
};