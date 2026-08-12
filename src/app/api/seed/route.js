import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = ["کالباس", "سوسیس", "ناگت"];
  const titles = [
    "ژامبون مرغ و قارچ 90%",
    "کالباس خشک ممتاز",
    "سوسیس هکاتم دودی",
    "سوسیس پپرونی تند",
    "ناگت مرغ ارگانیک",
    "ناگت گوشت ویژه",
    "ژامبون گوشت 95%",
    "سوسیس مرغ مخلوط",
  ];

  const data = Array.from({ length: 30 }).map((_, i) => {
    const randomTitle = titles[i % titles.length];
    const randomCategory = categories[i % categories.length];
    
    return {
      title: `${randomTitle}${i + 1}`,
      category: randomCategory,
      pricePerUnit: 350000, // قیمت پایه برای هر ۱۰۰۰ گرم (یک کیلوگرم)
      unitType: "gram",
      step: 100, // هر بار افزایش ۱۰۰ گرمی
      description: "تولید شده از گوشت تازه و ارگانیک بدون مواد نگهدارنده و با طعم بی‌نظیر.",
    };
  });

  try {
    await prisma.product.createMany({ data });
    return NextResponse.json({ success: true, message: "30 محصول پروتئینی اضافه شد!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ایجاد محصولات" }, { status: 500 });
  }
}