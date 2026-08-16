import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXT_BY_TYPE = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده است." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "فقط فرمت‌های JPG، PNG و WebP مجاز است." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "حجم تصویر نباید بیشتر از ۲ مگابایت باشد." }, { status: 400 });
    }

    // اطمینان از وجود پوشه‌ی مقصد (اگه وجود نداشته باشه ساخته می‌شه)
    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = EXT_BY_TYPE[file.type];
    // اسم فایل رندوم و یکتا - جلوگیری از تداخل با فایل‌های هم‌نام و حدس‌زدن آدرس فایل‌های دیگران
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

    // این مسیر مستقیماً از پوشه‌ی public قابل دسترسیه (بدون نیاز به روت جدا برای سرو کردن)
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Error in upload:", error);
    return NextResponse.json({ error: "خطا در آپلود تصویر." }, { status: 500 });
  }
}