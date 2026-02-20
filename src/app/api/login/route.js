import { supabase } from "@/src/lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Export a named function for POST method
export async function POST(req) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!users || users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token });

  } catch (err) {
    console.error("LOGIN CRASH:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional: export GET to prevent 405 if someone calls with GET
export async function GET() {
  return NextResponse.json({ message: "Use POST method" }, { status: 200 });
}