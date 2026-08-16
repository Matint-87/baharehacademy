"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/src/store/useCartStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaShoppingBasket, FaPlus, FaMinus } from "react-icons/fa";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?page=${page}`);
        const data = await res.json();

        if (isMounted && data.success) {
          setProducts((prev) => {
            const updatedProducts =
              page === 1 ? data.products : [...prev, ...data.products];

            setQuantities((prevQtys) => {
              const initialQtys = { ...prevQtys };
              data.products.forEach((p) => {
                if (!initialQtys[p.id]) initialQtys[p.id] = 250;
              });
              return initialQtys;
            });

            return updatedProducts;
          });
          setHasMore(data.hasMore);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handleQuantityChange = (id, step, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 250;
      const updated = current + delta * (step || 100);
      return { ...prev, [id]: updated > 0 ? updated : step || 100 };
    });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 250;

    const cartItem = {
      id: product.id, // شناسه‌ی واقعی محصول - نه رشته‌ی ترکیبی
      title: product.title,
      pricePerUnit: product.pricePerUnit,
      unitType: product.unitType,
      step: product.step,
      category: product.category,
      image: product.image,
    };

    const res = addToCart(cartItem, "PRODUCT", qty); // itemType و quantity صریح فرستاده می‌شه
    if (res.success) {
      toast.success(`${product.title} (${qty} گرم) به سبد خرید اضافه شد!`, {
        theme: "dark",
      });
    } else {
      toast.info(res.message, { theme: "dark" });
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-4 py-12 text-white">
      <ToastContainer />
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            محصولات پروتئینی تازه
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            انواع کالباس، سوسیس و ناگت ارگانیک - انتخاب وزن به دلخواه شما
          </p>
        </div>

        {loading && products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            در حال بارگذاری محصولات...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            هنوز محصولی ثبت نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const currentQty = quantities[product.id] || 250;
              const currentPrice = Math.round(
                (product.pricePerUnit / 1000) * currentQty,
              );

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#151516]/80 p-5 backdrop-blur-xl"
                >
                  <div>
                    {/* لینک فقط روی تصویر و عنوان برای رفتن به جزئیات */}
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl bg-gray-800">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-600 font-bold">
                            بدون تصویر
                          </div>
                        )}
                      </div>
                    </Link>

                    <span className="text-xs text-[#CD9F63] bg-[#CD9F63]/10 px-3 py-1 rounded-full">
                      {product.category}
                    </span>

                    <Link href={`/products/${product.id}`} className="block">
                      <h2 className="text-lg font-bold text-white mt-3 hover:text-[#CD9F63] transition-colors">
                        {product.title}
                      </h2>
                    </Link>

                    <p className="mt-2 text-xs text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-4 bg-white/5 p-2 rounded-xl">
                      <span className="text-xs text-gray-300">
                        مقدار (گرم):
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleQuantityChange(product.id, product.step, -1)
                          }
                          className="bg-white/10 p-2 rounded-lg hover:bg-white/25 transition-all text-xs cursor-pointer"
                        >
                          <FaMinus />
                        </button>
                        <span className="text-sm font-bold w-12 text-center">
                          {currentQty} گ
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(product.id, product.step, 1)
                          }
                          className="bg-white/10 p-2 rounded-lg hover:bg-white/25 transition-all text-xs cursor-pointer"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-400">قیمت نهایی:</span>
                      <span className="text-base font-bold text-[#CD9F63]">
                        {currentPrice.toLocaleString()} تومان
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#CD9F63] py-3 text-xs font-bold text-[#111] transition-all hover:bg-white cursor-pointer"
                    >
                      <FaShoppingBasket />
                      <span>افزودن به سبد خرید</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && products.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="rounded-xl border border-[#CD9F63] px-8 py-3 text-sm text-[#CD9F63] transition-all hover:bg-[#CD9F63] hover:text-[#111] cursor-pointer disabled:opacity-50"
            >
              {loading ? "در حال بارگذاری..." : "مشاهده محصولات بیشتر"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
