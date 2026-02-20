import { supabase } from "@/src/lib/supabaseClient";
import { NextResponse } from "next/server";
import { setOTP } from "@/src/lib/otpStore";

export async function POST(req) {
  try {
    const { phone, full_name } = await req.json();

    if (!phone || !full_name)
      return NextResponse.json({ error: "فیلدها کامل نیستند" }, { status: 400 });

    // بررسی اینکه شماره تکراری نباشد
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error && error.code !== "PGRST116") {
      // خطای واقعی
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "این شماره قبلاً ثبت‌نام کرده است" }, { status: 400 });
    }

    // تولید OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOTP(phone, otp);

    console.log(`کد OTP برای شماره ${phone}: ${otp}`); // فقط برای تست
    return NextResponse.json({ message: "کد تایید ارسال شد" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}