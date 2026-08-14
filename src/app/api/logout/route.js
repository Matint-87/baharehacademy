import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true, message: "خروج با موفقیت انجام شد." });
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}