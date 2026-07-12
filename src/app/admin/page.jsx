"use client";

import { useState } from "react";
import { FaUsers } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { BiSolidMoviePlay } from "react-icons/bi";
import { LuNotebookText } from "react-icons/lu";

function Page() {
  const [activeSection, setActiveSection] = useState("users");

  const menuItems = [
    { id: "users", title: "کاربران", icon: FaUsers },
    { id: "products", title: "محصولات", icon: AiFillProduct },
    { id: "movies", title: "فیلم‌ها", icon: BiSolidMoviePlay },
    { id: "notes", title: "یادداشت‌ها", icon: LuNotebookText },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return (
          <div>
            <h1 className="text-3xl font-bold">کاربران</h1>
            <p className="mt-3 text-gray-600">
              اطلاعات کاربران در این بخش نمایش داده می‌شود.
            </p>
          </div>
        );

      case "products":
        return (
          <div>
            <h1 className="text-3xl font-bold">محصولات</h1>
            <p className="mt-3 text-gray-600">
              اطلاعات محصولات در این بخش نمایش داده می‌شود.
            </p>
          </div>
        );

      case "movies":
        return (
          <div>
            <h1 className="text-3xl font-bold">فیلم‌ها</h1>
            <p className="mt-3 text-gray-600">
              اطلاعات فیلم‌ها در این بخش نمایش داده می‌شود.
            </p>
          </div>
        );

      case "notes":
        return (
          <div>
            <h1 className="text-3xl font-bold">یادداشت‌ها</h1>
            <p className="mt-3 text-gray-600">
              اطلاعات یادداشت‌ها در این بخش نمایش داده می‌شود.
            </p>
          </div>
        );

      default:
        return <h1>بخشی انتخاب نشده است</h1>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="group w-14 hover:w-56 transition-all duration-300 flex flex-col gap-2 h-full border-l border-gray-200 p-2 bg-white overflow-hidden shadow-sm">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200
                ${
                  activeSection === item.id
                    ? "bg-[#e24257] text-white "
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Icon className="text-2xl min-w-6" />

              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {item.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
}

export default Page;