"use client";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            className="p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setCount((prev) => (prev > 0 ? prev - 1 : 0))}
          >
            <svg
              className="w-4 h-4 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 12H4"
              ></path>
            </svg>
          </button>
          <span
            id="quantity"
            className="px-4 font-[Number] py-2 text-gray-900 font-medium"
          >
            {count}
          </span>
          <button
            className="p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setCount((prev) => (prev < 99 ? prev + 1 : 99))}
          >
            <svg
              className="w-4 h-4 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </button>
        </div>
        <button className="flex-1 bg-[#FE5F55] border border-transparent rounded-md py-3 px-8 flex items-center justify-center mobile:text-sm tablet:text-base font-medium text-white hover:bg-[#FE4F44] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          افزودن به سبد خرید
        </button>
      </div>
    </div>
  );
}

export default Counter;
