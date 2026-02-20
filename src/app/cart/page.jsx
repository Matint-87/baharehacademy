"use client";
import Image from "next/image";
import { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";

function Page() {
  const [cart, setCart] = useState([
    {
      id: 1,
      title: "پیتزا مخصوص",
      description: "پیتزا با ژامبون، قارچ، پنیر و سس مخصوص",
      image:
        "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/09.jpg",
      price: 120000,
      discount: 20,
      qty: 1,
    },
    {
      id: 2,
      title: "پیتزا قارچ و پنیر",
      description: "پیتزا با قارچ، پنیر و سس مخصوص",
      image:
        "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/09.jpg",
      price: 110000,
      discount: 15,
      qty: 1,
    },
    {
      id: 3,
      title: "پیتزا گوشت و پنیر",
      description: "پیتزا با گوشت، پنیر و سبزیجات",
      image:
        "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/09.jpg",
      price: 150000,
      discount: 10,
      qty: 3,
    },
  ]);

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce(
      (acc, item) =>
        acc + (item.price - item.price * (item.discount / 100)) * item.qty,
      0
    );
  };

  const getMainPrice = () => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  return (
    <>
      {cart.length === 0 ? (
        <div className="flex flex-col gap-7 items-center justify-center h-[80vh]">
          <div className="font-bold text-xl text-[#23254e] capitalize">
            سبد خرید شما خالی است!
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center mt-10 h-screen">
          <div className="w-[75%] flex justify-between p-5">
            {/* لیست محصولات */}
            <div className="w-[69%] bg-white border border-gray-300 rounded-xl p-5 flex flex-col gap-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="w-full p-3 border-b border-gray-300 flex"
                >
                  <Image
                    src={item.image}
                    width={270}
                    height={180}
                    className="w-67.5 h-45 object-cover rounded-xl"
                    alt={item.title}
                  />
                  <div className="flex flex-col justify-between p-3 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-bold text-lg">{item.title}</h2>
                        <p className="text-sm text-gray-600 mt-2">
                          {item.description}
                        </p>
                      </div>
                      <RiDeleteBin6Line
                        className="text-[#E24257] text-xl cursor-pointer"
                        onClick={() => removeItem(item.id)}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="line-through text-gray-400">
                          {item.price.toLocaleString()} تومان
                        </span>
                        <span className="font-bold text-green-600">
                          {(item.price - item.price * (item.discount / 100)).toLocaleString()} تومان
                        </span>
                        <span className="text-xs text-red-500">
                          {item.discount}% تخفیف
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            className="p-2 text-gray-600 hover:text-gray-900"
                            onClick={() => decreaseQty(item.id)}
                          >
                            -
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-medium">
                            {item.qty}
                          </span>
                          <button
                            className="p-2 text-gray-600 hover:text-gray-900"
                            onClick={() => increaseQty(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* خلاصه سفارش */}
            <div className="w-[30%] rounded-xl p-5 border border-gray-300 h-fit">
              <h1 className="text-xl font-bold text-[#2b2b2b]">خلاصه سفارش</h1>
              <div className="flex flex-col gap-3 mt-5 text-sm">
                <div className="flex justify-between">
                  <span>قیمت اصلی</span>
                  <span>{getMainPrice().toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>تخفیف</span>
                  <span>{(getMainPrice() - getTotal()).toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>هزینه ارسال</span>
                  <span>رایگان</span>
                </div>
              </div>

              <div className="w-full h-0.5 bg-[#e3e3e3] my-5 rounded"></div>

              <div className="flex flex-col gap-3 mt-5 text-sm">
                <div className="flex justify-between font-bold text-lg">
                  <span>قیمت نهایی</span>
                  <span>{getTotal().toLocaleString()} تومان</span>
                </div>
                <button className="border border-[#E24257] bg-white text-[#E24257] rounded p-3 hover:bg-[#E24257] hover:text-white duration-300">
                  تایید و تکمیل سفارش
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Page;