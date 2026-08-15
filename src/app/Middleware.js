import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// همون سکرتی که توی lib/auth.js استفاده کردیم
const encodedKey = new TextEncoder().encode(process.env.AUTH_SECRET);
const SESSION_COOKIE_NAME = "session_token";

// مسیرهایی که فقط کاربر لاگین‌کرده (دارای سشن معتبر) اجازه‌ی دیدنشون رو داره
// نکته: "/reset-password" هم اینجاست چون فقط بعد از تایید OTP در مسیر فراموشی رمز
// (که خودش یک سشن می‌سازه) قابل دسترسیه
const PROTECTED_ROUTES = ["/profile", "/reset-password", "/orders", "/checkout"];

// مسیرهایی که کاربر لاگین‌کرده نباید دوباره ببینتشون
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

  // اگه کاربر از قبل سشن معتبر داره و می‌خواد بره صفحه‌ی لاگین -> بفرست به خونه
  // توجه: این فقط یعنی «سشن معتبره»، نه لزوماً «ثبت‌نام کامل شده».
  // اگه کاربری وسط مسیر ثبت‌نام (بعد از OTP، قبل از تکمیل پروفایل) دستی بیاد /login،
  // به "/" فرستاده می‌شه؛ چک تکمیل‌بودن پروفایل باید در صفحه‌ی اصلی/API انجام بشه.
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// این matcher تعیین می‌کنه middleware روی کدوم مسیرها اجرا بشه
// (فایل‌های استاتیک و API رو مستثنی می‌کنیم تا اجرای غیرلازم نداشته باشیم)
export const config = {
  matcher: [
    "/profile/:path*",
    "/reset-password/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/login",
  ],
};