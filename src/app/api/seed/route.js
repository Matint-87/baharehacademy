import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const prepTimes = ["۳۰ دقیقه", "۴۵ دقیقه", "۱ ساعت", "۱ ساعت و ۳۰ دقیقه", "۲۰ دقیقه"];
  const titles = [
    "پیتزای خانگی با سوسیس پپرونی",
    "ساندویچ ژامبون مرغ و قارچ گریل شده",
    "ناگت مرغ برشته با سس مخصوص",
    "خوراک سوسیس و سیب‌زمینی تنوری",
    "سالاد ماکارونی با کالباس خشک",
    "رول ژامبون و پنیر سوخاری",
    "پاستا آلفردو با ناگت مرغ خرد شده",
    "املت ویژه با تکه‌های سوسیس دودی",
  ];

  const sampleIngredients = [
    ["سوسیس پپرونی: ۲۰۰ گرم", "پنیر موزارلا: ۱۵۰ گرم", "خمیر پیتزا: ۱ عدد", "سس گوجه‌فرنگی: ۳ قاشق غذاخوری"],
    ["ژامبون مرغ: ۶ ورق", "قارچ خرد شده: ۱ فنجان", "پنیر ورقه ای: ۲ عدد", "نان باگت: ۲ عدد"],
    ["ناگت مرغ: ۱۰ عدد", "روغن سرخ‌کردنی: به میزان لازم", "سیب‌زمینی سرخ‌کرده: برای سرو", "سس خردل: ۲ قاشق غذاخوری"],
  ];

  const sampleInstructions = `۱. ابتدا مواد اولیه را به اندازه مناسب آماده و خرد کنید.\n۲. در یک تابه مناسب مقداری روغن ریخته و روی حرارت ملایم قرار دهید.\n۳. مواد را به ترتیب افزوده و تفت دهید تا کاملاً پخته و طلایی شوند.\n۴. در نهایت با چاشنی‌های دلخواه طعم‌دار کرده و سرو نمایید.`;

  const data = Array.from({ length: 30 }).map((_, i) => {
    const randomTitle = titles[i % titles.length];
    const randomPrepTime = prepTimes[i % prepTimes.length];
    const randomIngredients = sampleIngredients[i % sampleIngredients.length];

    return {
      title: `${randomTitle} شماره ${i + 1}`,
      description: "یک دستور پخت خوشمزه، سریع و فوق‌العاده برای مهمانی‌ها و وعده‌های روزانه.",
      ingredients: randomIngredients,
      instructions: sampleInstructions,
      prepTime: randomPrepTime,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60", // تصویر نمونه از Unsplash
    };
  });

  try {
    await prisma.recipe.createMany({ data });
    return NextResponse.json({ success: true, message: "۳۰ دستور پخت جدید با موفقیت اضافه شد!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ایجاد دستور پخت‌ها" }, { status: 500 });
  }
}