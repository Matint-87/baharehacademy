"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaShoppingBasket, FaPlus, FaMinus } from "react-icons/fa";
import Link from "next/link";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [addingId, setAddingId] = useState(null); // جلوگیری از دابل‌کلیک روی یک محصول

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
                if (!initialQtys[p.id]) initialQtys[p.id] = 1;
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

  const handleQuantityChange = (product, delta) => {
    setQuantities((prev) => {
      const current = prev[product.id] || 1;
      let updated = current + delta;
      if (updated < 1) updated = 1;
      if (updated > product.stock) updated = product.stock;
      return { ...prev, [product.id]: updated };
    });
  };

  const handleAddToCart = async (product) => {
    const qty = quantities[product.id] || 1;

    setAddingId(product.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "PRODUCT", productId: product.id, quantity: qty }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          toast.info("برای افزودن به سبد خرید ابتدا وارد حساب کاربری خود شوید.", { theme: "dark" });
          router.push("/login");
          return;
        }
        throw new Error(data.error || "خطا در افزودن به سبد خرید");
      }

      toast.success(`${product.title} (${qty} عدد) به سبد خرید اضافه شد!`, { theme: "dark" });
      window.dispatchEvent(new Event("cart-changed"));
    } catch (err) {
      toast.error(err.message, { theme: "dark" });
    } finally {
      setAddingId(null);
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
            انواع کالباس، سوسیس و ناگت ارگانیک
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
              const currentQty = quantities[product.id] || 1;
              const currentPrice = product.price * currentQty;
              const outOfStock = product.stock <= 0;
              const isAdding = addingId === product.id;

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
                    {outOfStock ? (
                      <div className="mb-4 text-center text-xs text-red-400 bg-red-500/10 py-2 rounded-xl font-bold">
                        ناموجود
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mb-4 bg-white/5 p-2 rounded-xl">
                        <span className="text-xs text-gray-300">تعداد:</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(product, -1)}
                            disabled={currentQty <= 1}
                            className="bg-white/10 p-2 rounded-lg hover:bg-white/25 transition-all text-xs cursor-pointer disabled:opacity-40"
                          >
                            <FaMinus />
                          </button>
                          <span className="text-sm font-bold w-8 text-center">{currentQty}</span>
                          <button
                            onClick={() => handleQuantityChange(product, 1)}
                            disabled={currentQty >= product.stock}
                            className="bg-white/10 p-2 rounded-lg hover:bg-white/25 transition-all text-xs cursor-pointer disabled:opacity-40"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-400">قیمت نهایی:</span>
                      <span className="text-base font-bold text-[#CD9F63]">
                        {currentPrice.toLocaleString()} تومان
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={outOfStock || isAdding}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#CD9F63] py-3 text-xs font-bold text-[#111] transition-all hover:bg-white cursor-pointer disabled:opacity-50"
                    >
                      <FaShoppingBasket />
                      <span>{isAdding ? "در حال افزودن..." : "افزودن به سبد خرید"}</span>
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