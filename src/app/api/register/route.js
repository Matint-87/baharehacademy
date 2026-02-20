import { supabase } from "@/src/lib/supabaseClient";
import { NextResponse } from "next/server";
import { verifyOTP, clearOTP } from "@/src/lib/otpStore";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "secret123"; 

export async function POST(req) {
  try {
    const { phone, full_name, otp } = await req.json();

    if (!phone || !full_name || !otp) 
      return NextResponse.json({ error: "لطفاً تمام فیلدها را وارد کنید" }, { status: 400 });

    // بررسی OTP
    if (!verifyOTP(phone, otp)) 
      return NextResponse.json({ error: "کد تایید اشتباه است" }, { status: 400 });

    // بررسی وجود شماره در جدول users
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single(); // فقط یک رکورد

    if (fetchError && fetchError.code !== "PGRST116") { // کد خطای "no rows found" قابل قبول است
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "این شماره قبلاً ثبت‌نام کرده است" }, { status: 400 });
    }

    // پاک کردن OTP
    clearOTP(phone);

    // ثبت کاربر جدید
    const { data, error } = await supabase
      .from("users")
      .insert([{ phone, full_name }])
      .select();

    if (error) 
      return NextResponse.json({ error: error.message }, { status: 500 });

    // ساخت JWT و ذخیره در کوکی
    const token = jwt.sign(
      { userId: data[0].id, phone: data[0].phone },
      SECRET_KEY,
      { expiresIn: "7d" } 
    );

    const response = NextResponse.json({ message: "ثبت‌نام موفق", user: data[0] });
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,  
      path: "/",
      maxAge: 7 * 24 * 60 * 60, 
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}