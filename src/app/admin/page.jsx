"use client";

import { useState, useEffect, useCallback } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaChevronDown } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { BiSolidMoviePlay } from "react-icons/bi";
import { LuNotebookText } from "react-icons/lu";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Page() {
  const [activeSection, setActiveSection] = useState("users");
  const [data, setData] = useState({
    users: [],
    products: [],
    courses: [],
    recipe: [],
  });

  // تعداد کل واقعی هر بخش (برای کارت‌های آماری بالای صفحه) - جدا از دیتای صفحه‌بندی‌شده
  const [counts, setCounts] = useState({ users: 0, products: 0, courses: 0, recipe: 0 });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // جلوگیری از دابل ساب‌میت
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // صفحه‌بندی واقعی سمت سرور (به جای برش زدن آرایه‌ی لوکال)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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
    // فیلدهای مخصوص دستور پخت
    ingredientsText: "", // هر خط = یک ماده لازم
    instructions: "",
    prepTime: "",
  });

  const menuItems = [
    { id: "users", title: "کاربران", icon: FaUsers },
    { id: "products", title: "محصولات", icon: AiFillProduct },
    { id: "courses", title: "دوره", icon: BiSolidMoviePlay },
    { id: "recipe", title: "دستور پخت", icon: LuNotebookText },
  ];

  const endpointOf = (section) => `/api/${section}`;
  const resultKeyOf = (section) => section; // users -> json.users, products -> json.products و ...

  // درخواست‌ها با credentials: "include" میره تا کوکی JWT (httpOnly) خودکار فرستاده بشه.
  // اگه توکن رو تو localStorage نگه می‌داری، اینجا باید هدر Authorization اضافه کنی:
  // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  const fetchData = useCallback(async (section, pageNum, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${endpointOf(section)}?page=${pageNum}`, {
        credentials: "include",
      });
      const json = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("نشست شما منقضی شده، دوباره وارد شوید");
        return;
      }

      if (json.success) {
        const key = resultKeyOf(section);
        const list = json[key] || [];
        setData((prev) => ({
          ...prev,
          [section]: append ? [...prev[section], ...list] : list,
        }));
        setHasMore(Boolean(json.hasMore));
        setCounts((prev) => ({ ...prev, [section]: json.totalCount ?? prev[section] }));
      } else {
        toast.error(json.error || "خطا در دریافت اطلاعات");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  // با هر بار تغییر تب، صفحه به ۱ برمی‌گرده و دوباره از سرور می‌گیره
  useEffect(() => {
    setPage(1);
    fetchData(activeSection, 1, false);
  }, [activeSection, fetchData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(activeSection, nextPage, true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.warning("حجم تصویر نباید بیشتر از 2 مگابایت باشد");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        toast.success("تصویر آماده ذخیره است");
      };
      reader.onerror = () => {
        toast.error("خطا در خواندن فایل تصویر");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return; // جلوگیری از دابل کلیک روی دکمه ذخیره
    setSaving(true);

    try {
      const endpoint = endpointOf(activeSection);
      const method = editItem ? "PUT" : "POST";

      // برای دستور پخت، ماده‌های لازم رو از متن چندخطی به آرایه تبدیل می‌کنیم
      let payload = { ...formData };
      if (activeSection === "recipe") {
        const ingredients = formData.ingredientsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        payload = {
          title: formData.title,
          description: formData.description,
          ingredients,
          instructions: formData.instructions,
          prepTime: formData.prepTime,
          image: formData.image,
        };
      }
      if (editItem) payload.id = editItem.id;

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editItem ? "با موفقیت ویرایش شد!" : "با موفقیت افزوده شد!");
        setModalOpen(false);
        setEditItem(null);
        setPage(1);
        fetchData(activeSection, 1, false);
      } else {
        toast.error(json.error || "خطا در انجام عملیات");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطای ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این مورد اطمینان دارید؟")) return;
    try {
      const res = await fetch(`${endpointOf(activeSection)}?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("با موفقیت حذف شد!");
        setPage(1);
        fetchData(activeSection, 1, false);
      } else {
        toast.error(json.error || "خطا در حذف آیتم");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      title: "", category: "", pricePerUnit: "", price: "", duration: "",
      instructor: "", description: "", image: "", email: "", name: "",
      ingredientsText: "", instructions: "", prepTime: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title || "",
      category: item.category || "",
      pricePerUnit: item.pricePerUnit || "",
      price: item.price || "",
      duration: item.duration || "",
      instructor: item.instructor || "",
      description: item.description || "",
      image: item.image || "",
      email: item.email || "",
      name: item.name || "",
      ingredientsText: Array.isArray(item.ingredients) ? item.ingredients.join("\n") : "",
      instructions: item.instructions || "",
      prepTime: item.prepTime || "",
    });
    setModalOpen(true);
  };

  const renderContent = () => {
    const currentList = data[activeSection] || [];

    return (
      <div className="space-y-8 pb-20">
        {/* آمار کلی - حالا از تعداد واقعی سرور (counts) میاد، نه طول آرایه‌ی لود شده */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="border border-white/10 bg-[#151516]/80 p-5 rounded-2xl backdrop-blur-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{item.title}</p>
                  <h3 className="text-2xl font-bold mt-1 text-white">{counts[item.id] ?? 0}</h3>
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
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#CD9F63] text-[#111] px-4 py-2 rounded-xl text-xs font-bold hover:bg-white transition-all cursor-pointer"
          >
            <FaPlus />
            <span>افزودن مورد جدید</span>
          </button>
        </div>

        {/* جدول داده‌ها */}
        <div className="border border-white/10 bg-[#151516]/80 rounded-2xl overflow-hidden backdrop-blur-xl">
          {loading && currentList.length === 0 ? (
            <div className="text-center py-16 text-[#CD9F63] text-sm font-medium animate-pulse">
              در حال بارگذاری اطلاعات...
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">هیچ داده‌ای یافت نشد.</div>
          ) : (
            <>
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
                      <td className="p-4 text-xs text-gray-400">
                        {item.price || item.pricePerUnit
                          ? `${Number(item.price || item.pricePerUnit).toLocaleString()} تومان`
                          : (item.category || item.duration || item.prepTime || "-")}
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
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

              {/* دکمه نمایش بیشتر - حالا صفحه‌ی بعدی رو واقعاً از سرور می‌گیره */}
              {hasMore && (
                <div className="flex justify-center p-4 border-t border-white/10 bg-white/5">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? "در حال بارگذاری..." : "نمایش بیشتر"}</span>
                    <FaChevronDown />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* مدال افزودن / ویرایش */}
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
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">ایمیل</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                  </>
                ) : activeSection === "recipe" ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">عنوان</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">مواد لازم (هر خط یک ماده)</label>
                      <textarea
                        value={formData.ingredientsText}
                        onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]"
                        rows="4"
                        placeholder={"مثال:\n۲ پیمانه آرد\n۱ قاشق چای‌خوری نمک"}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">طرز تهیه</label>
                      <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" rows="4" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">زمان آماده‌سازی (مثلاً ۳۰ دقیقه)</label>
                      <input type="text" value={formData.prepTime} onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">توضیحات</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" rows="2" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">آپلود تصویر</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs cursor-pointer hover:bg-white/20 transition-all">
                          <FaImage />
                          <span>انتخاب فایل</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {formData.image ? (
                          <div className="flex items-center gap-2">
                            <img src={formData.image} alt="Preview" className="w-8 h-8 rounded object-cover border border-white/20" />
                            <span className="text-xs text-[#CD9F63]">آماده ذخیره</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">تصویری انتخاب نشده است</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">عنوان</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>

                    {activeSection === "products" && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">دسته‌بندی</label>
                          <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">قیمت (تومان)</label>
                          <input type="number" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                      </>
                    )}

                    {activeSection === "courses" && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">مدرس</label>
                          <input type="text" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">قیمت دوره (تومان)</label>
                          <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">توضیحات</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" rows="3" />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">آپلود تصویر</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs cursor-pointer hover:bg-white/20 transition-all">
                          <FaImage />
                          <span>انتخاب فایل</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {formData.image ? (
                          <div className="flex items-center gap-2">
                            <img src={formData.image} alt="Preview" className="w-8 h-8 rounded object-cover border border-white/20" />
                            <span className="text-xs text-[#CD9F63]">آماده ذخیره</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">تصویری انتخاب نشده است</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition-all cursor-pointer">انصراف</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-xs bg-[#CD9F63] text-[#111] font-bold hover:bg-white transition-all cursor-pointer disabled:opacity-50">
                    {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
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
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="dark"
      />

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