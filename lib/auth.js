import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// این مقدار باید در .env.local ست بشه: AUTH_SECRET=یک-رشته-تصادفی-بلند
const secretKey = process.env.AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // ۷ روز

// ساخت JWT برای کاربر بعد از تایید موفق OTP یا ورود موفق با پسورد
export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // جاوااسکریپت فرانت نمی‌تونه بهش دسترسی داشته باشه (ضد XSS)
    secure: process.env.NODE_ENV === "production", // فقط روی HTTPS در پروداکشن
    sameSite: "lax", // محافظت نسبی در برابر CSRF
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return token;
}

// خوندن و اعتبارسنجی سشن از روی کوکی - در هر route محافظت‌شده صدا زده می‌شه
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload; // شامل { userId, iat, exp }
  } catch (error) {
    // توکن نامعتبر یا منقضی شده
    return null;
  }
}

// پاک کردن سشن هنگام خروج از حساب
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// چک می‌کنه کاربر لاگین‌کرده، ادمینه یا نه (بر اساس فیلد isAdmin تو مدل User)
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "وارد نشده‌اید", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true },
  });

  if (!user) {
    return { ok: false, error: "کاربر یافت نشد", status: 401 };
  }

  if (!user.isAdmin) {
    return { ok: false, error: "دسترسی غیرمجاز", status: 403 };
  }

  return { ok: true, user };
}

// چک می‌کنه کاربر لاگین‌کرده یا نه - برخلاف requireAdmin نیازی به isAdmin نداره
// برای route هایی مثل سبد خرید و /api/auth/me که فقط کافیه کاربر لاگین باشه
export async function requireUser() {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "برای این کار باید وارد حساب کاربری شوید", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true },
  });

  if (!user) {
    return { ok: false, error: "کاربر یافت نشد", status: 401 };
  }

  return { ok: true, user };
}

// --- ابزارهای پسورد ---

// حداقل ۸ کاراکتر + حداقل یک حرف + حداقل یک عدد
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function isPasswordStrong(password) {
  return typeof password === "string" && PASSWORD_REGEX.test(password);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// خروجی امن کاربر برای فرستادن به کلاینت (بدون فیلدهای حساس)
export function toSafeUser(user) {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    address: user.addressDetail,
    postalCode: user.postalCode,
    age: user.age,
    nationalCode: user.nationalCode,
    image: user.image,
    hasPassword: !!user.password,
    isAdmin: user.isAdmin,
  };
}