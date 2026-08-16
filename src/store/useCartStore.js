import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],


      addToCart: (item, itemType = "COURSE", quantity = 1) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex(
          (cartItem) => cartItem.id === item.id && cartItem.itemType === itemType
        );

        if (itemType === "COURSE") {
          if (existingIndex !== -1) {
            return { success: false, message: "این دوره از قبل در سبد خرید شما موجود است." };
          }
          set({ cart: [...currentCart, { ...item, itemType, quantity: 1 }] });
          return { success: true, message: "دوره با موفقیت به سبد خرید اضافه شد!" };
        }

        // itemType === "PRODUCT"
        if (existingIndex !== -1) {
          const updatedCart = [...currentCart];
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + quantity,
          };
          set({ cart: updatedCart });
          return { success: true, message: "تعداد محصول در سبد خرید به‌روزرسانی شد." };
        }

        set({ cart: [...currentCart, { ...item, itemType, quantity }] });
        return { success: true, message: "محصول با موفقیت به سبد خرید اضافه شد!" };
      },

      // تغییر تعداد یک محصول در سبد (برای دوره کاربردی نداره)
      updateQuantity: (id, itemType, newQuantity) => {
        if (newQuantity <= 0) {
          set({ cart: get().cart.filter((item) => !(item.id === id && item.itemType === itemType)) });
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.id === id && item.itemType === itemType ? { ...item, quantity: newQuantity } : item
          ),
        });
      },

      // حذف آیتم از سبد خرید
      removeFromCart: (id, itemType = "COURSE") => {
        set({ cart: get().cart.filter((item) => !(item.id === id && item.itemType === itemType)) });
      },

      // خالی کردن سبد خرید
      clearCart: () => set({ cart: [] }),

      // جمع کل قیمت سبد خرید
      getTotalPrice: () => {
        return get().cart.reduce((acc, item) => {
          const unitPrice = item.itemType === "PRODUCT" ? item.pricePerUnit : item.price;
          return acc + unitPrice * (item.quantity || 1);
        }, 0);
      },
    }),
    {
      name: "cooking-academy-cart",
    }
  )
);