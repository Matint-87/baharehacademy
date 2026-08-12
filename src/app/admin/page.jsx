"use client";

import { useState, useEffect } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaImage, FaTimes } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { BiSolidMoviePlay } from "react-icons/bi";
import { LuNotebookText } from "react-icons/lu";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Page() {
  const [activeSection, setActiveSection] = useState("users");
  const [data, setData] = useState({
    users: [],
    products: [],
    movies: [],
    notes: [],
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // فیلدهای فرم پویا بر اساس نوع بخش
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    pricePerUnit: "",
    price: "",
    duration: "",
    instructor: "",
    description: "",
    image: "",
    email: "",
    name: "",
  });

  const menuItems = [
    { id: "users", title: "کاربران", icon: FaUsers },
    { id: "products", title: "محصولات", icon: AiFillProduct },
    { id: "movies", title: "دوره", icon: BiSolidMoviePlay },
    { id: "notes", title: "یادداشت‌ها", icon: LuNotebookText },
  ];

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (activeSection === "users") endpoint = "/api/users";
      else if (activeSection === "products") endpoint = "/api/products";
      else if (activeSection === "movies") endpoint = "/api/courses";
      else if (activeSection === "notes") endpoint = "/api/notes";

      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success) {
        setData((prev) => ({
          ...prev,
          [activeSection]: json.products || json.users || json.courses || json.notes || [],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // شبیه‌سازی آپلود تصویر (تبدیل به Base64 یا لینک موقت)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let endpoint = "";
      if (activeSection === "users") endpoint = "/api/users";
      else if (activeSection === "products") endpoint = "/api/products";
      else if (activeSection === "movies") endpoint = "/api/courses";
      else if (activeSection === "notes") endpoint = "/api/notes";

      const method = editItem ? "PUT" : "POST";
      const payload = editItem ? { id: editItem.id, ...formData } : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editItem ? "با موفقیت ویرایش شد!" : "با موفقیت افزوده شد!", { theme: "dark" });
        setModalOpen(false);
        setEditItem(null);
        fetchData();
      } else {
        toast.error(json.error || "خطا در انجام عملیات", { theme: "dark" });
      }
    } catch (err) {
      console.error(err);
      toast.error("خطای سرور", { theme: "dark" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این مورد اطمینان دارید؟")) return;
    try {
      let endpoint = "";
      if (activeSection === "users") endpoint = `/api/users?id=${id}`;
      else if (activeSection === "products") endpoint = `/api/products?id=${id}`;
      else if (activeSection === "movies") endpoint = `/api/courses?id=${id}`;
      else if (activeSection === "notes") endpoint = `/api/notes?id=${id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("با موفقیت حذف شد!", { theme: "dark" });
        fetchData();
      } else {
        toast.error("خطا در حذف", { theme: "dark" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    const currentList = data[activeSection] || [];

    return (
      <div className="space-y-8">
        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="border border-white/10 bg-[#151516]/80 p-5 rounded-2xl backdrop-blur-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{item.title}</p>
                  <h3 className="text-2xl font-bold mt-1 text-white">{data[item.id]?.length || 0}</h3>
                </div>
                <div className="p-3 bg-[#CD9F63]/10 text-[#CD9F63] rounded-xl text-xl">
                  <Icon />
                </div>
              </div>
            );
          })}
        </div>

        {/* هدر و دکمه افزودن */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold text-white">
            مدیریت {menuItems.find((m) => m.id === activeSection)?.title}
          </h1>
          <button
            onClick={() => {
              setEditItem(null);
              setFormData({ title: "", category: "", pricePerUnit: "", price: "", duration: "", instructor: "", description: "", image: "", email: "", name: "" });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#CD9F63] text-[#111] px-4 py-2 rounded-xl text-xs font-bold hover:bg-white transition-all cursor-pointer"
          >
            <FaPlus />
            <span>افزودن مورد جدید</span>
          </button>
        </div>

        {/* جدول داده‌ها */}
        <div className="border border-white/10 bg-[#151516]/80 rounded-2xl overflow-hidden backdrop-blur-xl">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">در حال بارگذاری اطلاعات...</div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">هیچ داده‌ای یافت نشد.</div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-400 bg-white/5">
                  <th className="p-4">تصویر</th>
                  <th className="p-4">عنوان / نام</th>
                  <th className="p-4">جزئیات</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {currentList.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-white/5 transition-all">
                    <td className="p-4">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-500">بدون عکس</div>
                      )}
                    </td>
                    <td className="p-4 font-medium">{item.title || item.name || item.email || "بدون عنوان"}</td>
                    <td className="p-4 text-xs text-gray-400">{item.category || item.duration || item.price || item.pricePerUnit ? `${item.price || item.pricePerUnit || 0} تومان` : "-"}</td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setFormData(item);
                          setModalOpen(true);
                        }}
                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/25 transition-all cursor-pointer"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/25 transition-all cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* مدال افزودن / ویرایش پویا */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#151516] border border-white/10 p-6 rounded-3xl w-full max-w-lg text-white my-8">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <h2 className="text-lg font-bold">{editItem ? "ویرایش مورد" : "افزودن مورد جدید"}</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><FaTimes /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {activeSection === "users" ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">نام کاربر</label>
                      <input type="text" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">ایمیل</label>
                      <input type="email" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">عنوان</label>
                      <input type="text" value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>

                    {activeSection === "products" && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">دسته‌بندی (کالباس، سوسیس، ناگت)</label>
                          <input type="text" value={formData.category || ""} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">قیمت پایه به ازای هر کیلو (تومان)</label>
                          <input type="number" value={formData.pricePerUnit || ""} onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                      </>
                    )}

                    {activeSection === "movies" && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">مدرس</label>
                          <input type="text" value={formData.instructor || ""} onChange={(e) => setFormData({...formData, instructor: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">قیمت دوره (تومان)</label>
                          <input type="number" value={formData.price || ""} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">توضیحات</label>
                      <textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" rows="3" />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">آپلود تصویر</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs cursor-pointer hover:bg-white/20 transition-all">
                          <FaImage />
                          <span>انتخاب فایل</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {formData.image && <span className="text-xs text-[#CD9F63]">تصویر انتخاب شد</span>}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition-all cursor-pointer">انصراف</button>
                  <button type="submit" className="px-5 py-2 rounded-xl text-xs bg-[#CD9F63] text-[#111] font-bold hover:bg-white transition-all cursor-pointer">ذخیره تغییرات</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0b0b0c] text-white overflow-hidden">
      <ToastContainer />
      {/* سایدبار */}
      <div className="group w-16 hover:w-56 transition-all duration-300 flex flex-col gap-2 h-full border-l border-white/10 p-3 bg-[#151516]/80 backdrop-blur-xl shadow-sm z-20">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                activeSection === item.id
                  ? "bg-[#CD9F63] text-[#111] font-bold shadow-lg"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="text-xl min-w-6" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm">
                {item.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* محتوا */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default Page;