"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaChevronDown, FaClock } from "react-icons/fa";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async (pageNum, isNewPage = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recipe?page=${pageNum}`);
      const data = await res.json();
      if (data.success) {
        setRecipes((prev) => isNewPage ? [...prev, ...data.recipes] : data.recipes);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage, true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">دستورهای پخت آشپزی</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <Link 
            key={recipe.id || index} 
            href={`/recipes/${recipe.id}`}
            className="border border-white/10 bg-[#151516] rounded-2xl overflow-hidden hover:border-[#CD9F63] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-white/5 flex items-center justify-center text-gray-500 text-sm">بدون تصویر</div>
              )}
              <div className="p-5">
                <h2 className="font-bold text-xl mb-2">{recipe.title}</h2>
                <p className="text-sm text-gray-400 line-clamp-2">{recipe.description}</p>
              </div>
            </div>

            <div className="px-5 pb-5 flex items-center justify-between text-xs text-gray-400">
              {recipe.prepTime && (
                <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl text-[#CD9F63]">
                  <FaClock />
                  {recipe.prepTime}
                </span>
              )}
              <span className="text-[#CD9F63] font-medium hover:underline">مشاهده دستور پخت &larr;</span>
            </div>
          </Link>
        ))}
      </div>

      {/* دکمه نمایش بیشتر (Lazy Loading) */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "در حال بارگذاری..." : "نمایش بیشتر"}</span>
            <FaChevronDown />
          </button>
        </div>
      )}
    </div>
  );
}