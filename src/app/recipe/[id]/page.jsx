import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowRight, FaClock, FaListUl, FaUtensils } from "react-icons/fa";

export default async function RecipeDetailPage({ params }) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
  });

  if (!recipe) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <Link href="/recipe" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#CD9F63] mb-6 transition-all">
        <FaArrowRight />
        <span>بازگشت به دستور پخت‌ها</span>
      </Link>

      <div className="bg-[#151516] border border-white/10 rounded-3xl overflow-hidden p-6 md:p-8 space-y-6">
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="w-full h-80 object-cover rounded-2xl" />
        )}

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed">{recipe.description}</p>
        </div>

        {recipe.prepTime && (
          <div className="inline-flex items-center gap-2 bg-[#CD9F63]/10 text-[#CD9F63] px-4 py-2 rounded-xl text-sm font-medium">
            <FaClock />
            <span>زمان آماده‌سازی: {recipe.prepTime}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          {/* مواد لازم */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#CD9F63]">
              <FaListUl />
              <span>مواد لازم</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 bg-white/5 p-4 rounded-2xl">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))
              ) : (
                <p className="text-gray-500 text-xs">مواد لازمی ثبت نشده است.</p>
              )}
            </ul>
          </div>

          {/* مراحل پخت */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#CD9F63]">
              <FaUtensils />
              <span>مراحل پخت</span>
            </h2>
            <div className="text-sm text-gray-300 bg-white/5 p-4 rounded-2xl whitespace-pre-line leading-relaxed">
              {recipe.instructions || "دستور پختی ثبت نشده است."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}