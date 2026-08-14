"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaChevronDown, FaClock } from "react-icons/fa";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecipes() {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipe?page=${page}`);
        const data = await res.json();
        
        if (isMounted && data && data.success) {
          const newRecipes = Array.isArray(data.recipes) ? data.recipes : [];
          setRecipes((prev) => (page === 1 ? newRecipes : [...prev, ...newRecipes]));
          setHasMore(Boolean(data.hasMore));
        }
      } catch (err) {
        console.error("Error loading recipes:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecipes();

    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="p-8 max-w-7xl mx-auto text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">دستورهای پخت آشپزی</h1>

      {loading && recipes.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
          در حال بارگذاری دستورهای پخت...
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
          هنوز دستور پختی ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <Link 
              key={recipe?.id || index} 
              href={`/recipe/${recipe?.id || ""}`}
              className="border border-white/10 bg-[#151516] rounded-2xl overflow-hidden hover:border-[#CD9F63] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {recipe?.image ? (
                  <img src={recipe.image} alt={recipe?.title || "دستور پخت"} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-white/5 flex items-center justify-center text-gray-500 text-sm">بدون تصویر</div>
                )}
                <div className="p-5">
                  <h2 className="font-bold text-xl mb-2">{recipe?.title || "بدون عنوان"}</h2>
                  <p className="text-sm text-gray-400 line-clamp-2">{recipe?.description || ""}</p>
                </div>
              </div>

              <div className="px-5 pb-5 flex items-center justify-between text-xs text-gray-400">
                {recipe?.prepTime ? (
                  <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl text-[#CD9F63]">
                    <FaClock />
                    {recipe.prepTime}
                  </span>
                ) : <span></span>}
                <span className="text-[#CD9F63] font-medium hover:underline">مشاهده دستور پخت &larr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasMore && recipes.length > 0 && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="rounded-xl border border-[#CD9F63] px-8 py-3 text-sm text-[#CD9F63] transition-all hover:bg-[#CD9F63] hover:text-[#111] cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "در حال بارگذاری..." : "نمایش بیشتر"}</span>
          </button>
        </div>
      )}
    </div>
  );
}