"use client";
import { useState } from "react";
import ProductItems from "@/src/components/ProductItems";
import { FiSearch, FiFilter } from "react-icons/fi";

function Page() {
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");

  const categories = [
    { id: 1, name: "سوسیس", count: 24 },
    { id: 2, name: "کالباس", count: 24 },
    { id: 3, name: "شیرینی ها", count: 18 },
    { id: 4, name: "کیک ها", count: 12 },
  ];

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">محصولات</h1>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="w-5 h-5" />
            <span>فیلتر</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`
            lg:w-80 lg:block
            ${isFilterOpen ? 'block' : 'hidden'}
            fixed lg:relative inset-0 z-50 lg:z-auto
            bg-white lg:bg-transparent
            p-4 lg:p-0
            overflow-y-auto
          `}>
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="font-bold text-lg">فیلترها</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Filter Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <FiFilter className="w-5 h-5" />
                  فیلترها
                </h2>
              </div>

              {/* Categories Filter */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">دسته‌بندی</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="w-4 h-4 text-[#E24257] rounded border-gray-300 focus:ring-[#E24257]"
                        />
                        <span className="text-gray-700 group-hover:text-[#E24257] transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="p-4">
                <button
                  onClick={clearFilters}
                  className="w-full cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar with Sort and Count */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="جستجوی محصولات..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E24257] focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Results Count */}
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  <span className="font-medium text-gray-900">24</span> محصول
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <ProductItems 
                search={search}
                categories={selectedCategories}
                priceRange={priceRange}
                sortBy={sortBy}
              />
            </div>
          </div>
        </div>

        {/* Overlay for Mobile Filter */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Page;