import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      // افزودن دوره به سبد خرید
      addToCart: (course) => {
        const currentCart = get().cart;
        const exists = currentCart.some((item) => item.id === course.id);
        if (!exists) {
          set({ cart: [...currentCart, course] });
          return { success: true, message: "دوره با موفقیت به سبد خرید اضافه شد!" };
        }
        return { success: false, message: "این دوره از قبل در سبد خرید شما موجود است." };
      },
      // حذف دوره از سبد خرید
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },
      // خالی کردن سبد خرید
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cooking-academy-cart", // ذخیره خودکار در localStorage
    }
  )
);