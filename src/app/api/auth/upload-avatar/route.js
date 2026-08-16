import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 2 * 1024 * 1024; // ۲ مگابایت، هماهنگ با محدودیت سمت فرانت

// آواتارها جدا از uploads عمومی، داخل public/uploads/avatars ذخیره می‌شن
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

// آپلود عکس پروفایل - مخصوص خودِ کاربر (نه ادمین)
export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, error: "فایلی ارسال نشده است" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "فرمت تصویر مجاز نیست" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "حجم تصویر نباید بیشتر از ۲ مگابایت باشد" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extension = file.name.split(".").pop();
    // اسم فایل بر اساس userId ثابته و هر بار بازنویسی می‌شه تا عکس‌های قدیمی انباشته نشن
    const fileName = `${session.userId}.${extension}`;

    await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

    // چون ممکنه فرمت فایل بین دفعات آپلود عوض بشه (مثلاً jpg بعد webp)، یه query string
    // برای شکستن کش مرورگر اضافه می‌کنیم تا عکس جدید فوراً نمایش داده بشه
    return NextResponse.json({ success: true, url: `/uploads/avatars/${fileName}?t=${Date.now()}` });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json({ success: false, error: "خطا در آپلود تصویر" }, { status: 500 });
  }
}