"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaShoppingBasket,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaTag,
} from "react-icons/fa";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProductDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (data.success && data.product) {
          setProduct(data.product);
          setQuantity(1);
        } else {
          toast.error("محصول مورد نظر یافت نشد.", { theme: "dark" });
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
        toast.error("خطا در بارگذاری اطلاعات محصول", { theme: "dark" });
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetail();
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      let updated = prev + delta;
      if (updated < 1) updated = 1;
      if (product && updated > product.stock) updated = product.stock;
      return updated;
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "PRODUCT", productId: product.id, quantity }),
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

      toast.success(`${product.title} (${quantity} عدد) به سبد خرید اضافه شد!`, { theme: "dark" });
      window.dispatchEvent(new Event("cart-changed"));
    } catch (err) {
      toast.error(err.message, { theme: "dark" });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center text-gray-400 text-sm">
        در حال بارگذاری اطلاعات محصول...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400 text-sm">محصولی پیدا نشد یا حذف شده است.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-[#CD9F63] text-[#111] rounded-xl font-bold text-xs cursor-pointer"
        >
          بازگشت به صفحه قبل
        </button>
      </div>
    );
  }

  const currentPrice = product.price * quantity;
  const outOfStock = product.stock <= 0;

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-4 py-12 text-white">
      <ToastContainer />
      <div className="mx-auto max-w-4xl">
        {/* دکمه بازگشت */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#CD9F63] mb-8 transition-colors text-xs font-medium cursor-pointer"
        >
          <FaArrowRight />
          <span>بازگشت به محصولات</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#151516]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          {/* تصویر محصول */}
          <div className="relative h-72 md:h-full w-full overflow-hidden rounded-2xl bg-gray-800">
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-600 font-bold">
                بدون تصویر
              </div>
            )}
          </div>

          {/* جزئیات و خرید */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#CD9F63] bg-[#CD9F63]/10 px-3 py-1 rounded-full inline-flex items-center gap-1">
                <FaTag />
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-white mt-3">
                {product.title}
              </h1>
              <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              {outOfStock ? (
                <div className="mb-6 text-center text-sm text-red-400 bg-red-500/10 py-3 rounded-xl font-bold">
                  این محصول ناموجود است
                </div>
              ) : (
                <div className="flex items-center justify-between mb-4 bg-white/5 p-3 rounded-xl">
                  <span className="text-xs text-gray-300">تعداد:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="bg-white/10 p-2 rounded-lg hover:bg-white/25 transition-all text-xs cursor-pointer disabled:opacity-40"
                    >
                      <FaMinus />
                    </button>
                    <span className="text-sm font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="bg-white/10 p-2 rounded-lg hover:bg-white/25 transition-all text-xs cursor-pointer disabled:opacity-40"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              )}

              {/* قیمت */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-gray-400">قیمت کل:</span>
                <span className="text-xl font-bold text-[#CD9F63]">
                  {currentPrice.toLocaleString()} تومان
                </span>
              </div>

              {/* دکمه افزودن */}
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || addingToCart}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#CD9F63] py-3 text-xs font-bold text-[#111] transition-all hover:bg-white cursor-pointer disabled:opacity-50"
              >
                <FaShoppingBasket />
                <span>{addingToCart ? "در حال افزودن..." : "افزودن به سبد خرید"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}