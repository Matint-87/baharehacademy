"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

// داده‌های ثابت برای محصولات
const products = [
  {
    id: 1,
    name: "پیتزا مخصوص",
    description: "پیتزا با ژامبون، قارچ، پنیر و سس مخصوص",
    image:
      "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/09.jpg",
    price: 120000,
    discount: 20,
    final_price: 96000,
  },
  {
    id: 2,
    name: "پیتزا گوشت و پنیر",
    description: "پیتزا با گوشت، پنیر و سبزیجات",
    image:
      "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/09.jpg",
    price: 150000,
    discount: 10,
    final_price: 135000,
  },
  {
    id: 3,
    name: "پیتزا سبزیجات",
    description: "پیتزا با سبزیجات تازه و پنیر",
    image:
      "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/09.jpg",
    price: 110000,
    discount: 0,
    final_price: 110000,
  },
];

function ProductItems() {
  const [productList] = useState(products);

  return (
    <>
      <div className="flex flex-wrap gap-6 justify-center">
        {productList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 flex flex-col overflow-hidden w-65 h-90"
          >
            <div className="relative w-full h-56">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-t-2xl"
              />
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between">
              <p className="text-gray-600 line-clamp-1 text-sm mb-3">
                {item.description}
              </p>

              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col h-10">
                  <span className="font-bold text-lg md:text-xl text-gray-900">
                    {item.final_price.toLocaleString()} تومان
                  </span>
                  {item.discount > 0 && (
                    <span className="text-gray-400 line-through text-sm">
                      {item.price.toLocaleString()} تومان
                    </span>
                  )}
                </div>

                {item.discount > 0 && (
                  <div className="px-2 py-1 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {item.discount}%
                    </span>
                  </div>
                )}
              </div>

              <Link href={`/products/${item.id}`}>
                <button className="bg-[#FE5F55] hover:bg-[#FE4F44] text-white rounded py-2 px-4 w-full transition-all duration-300 shadow-sm hover:shadow-md font-medium">
                  مشاهده محصول
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ProductItems;
