"use client";

import Image from "next/image";
import { useState } from "react";
import { GoShareAndroid } from "react-icons/go";
import { MdOutlineContentCopy } from "react-icons/md";
import Counter from "./Counter";

export default function ProductDetail({ product }) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/products/${product.id}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("خطا در کپی کردن:", err);
    }
  };

  return (
    <section className="w-full max-w-312.5 mx-auto my-24 2xl:my-38 px-4 ">
      <div className="flex flex-col gap-8 lg:flex-row bg-gray-50 p-5 lg:p-8 rounded-xl shadow-lg ">
        <div className="flex flex-col items-center gap-4 w-full lg:w-1/2">
          <div className="w-75 h-75 relative rounded-xl overflow-hidden cursor-pointer">
            <Image
              src={product.image?.[index] ?? "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover rounded-xl"
              sizes="300px"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto">
            {product.image?.map((imgSrc, i) => (
              <div
                key={i}
                onClick={() => setIndex(i)}
                className={`w-20 h-20 relative rounded-xl cursor-pointer border-2 ${
                  index === i ? "border-[#FE5F55]" : "border-gray-300"
                } hover:shadow-lg transition-shadow duration-200`}
              >
                <Image
                  src={imgSrc}
                  alt={`thumbnail-${i}`}
                  fill
                  className="object-cover rounded-xl"
                  sizes="80px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* جزئیات محصول */}
        <div className="flex flex-col w-full lg:w-1/2 gap-6">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 text-sm leading-6 text-justify">
            {product.description}
          </p>

          {/* مشخصات محصول */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-medium text-gray-900">مشخصات محصول</h3>
            <ul className="mt-3 space-y-2 text-gray-500 text-sm">
              <li className="flex justify-between">
                <span>وزن:</span>
                <span className="font-[Number]">
                  {product.weight} {product.weight_type}
                </span>
              </li>
              <li className="flex justify-between">
                <span>مدت نگهداری:</span>
                <span className="font-[Number]">
                  {product.shelf_life} {product.shelf_life_type}
                </span>
              </li>
              {product.discount > 0 && (
                <li className="flex justify-between">
                  <span>قیمت اصلی:</span>
                  <span className="font-[Number] line-through text-gray-400">
                    {product.price.toLocaleString()} تومان
                  </span>
                </li>
              )}
              <li className="flex justify-between">
                <span>قیمت نهایی:</span>
                <span className="font-[Number] text-lg font-semibold text-gray-900">
                  {/* {product.final_price.toLocaleString()} تومان */}
                </span>
              </li>
            </ul>
          </div>

          <Counter />

          <div className="flex gap-4 mt-4">
            <div className="relative group">
              <button
                onClick={handleCopy}
                className="flex cursor-pointer items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                {copied ? (
                  <MdOutlineContentCopy className="text-xl text-gray-700" />
                ) : (
                  <GoShareAndroid className="text-xl text-gray-700" />
                )}
              </button>

              <span
                className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 text-xs rounded-md bg-gray-900 text-white transition-opacity duration-200 pointer-events-none whitespace-nowrap ${
                  copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {copied ? "کپی شد" : "اشتراک‌گذاری"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
