"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaChevronDown, FaShoppingCart, FaLockOpen, FaKey, FaSearch } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { BiSolidMoviePlay } from "react-icons/bi";
import { LuNotebookText } from "react-icons/lu";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ORDER_STATUS_LABELS = {
  PENDING_PAYMENT: { label: "در انتظار پرداخت", color: "text-gray-400 bg-gray-500/10" },
  PAID: { label: "پرداخت شده", color: "text-blue-400 bg-blue-500/10" },
  PROCESSING: { label: "در حال آماده‌سازی", color: "text-yellow-400 bg-yellow-500/10" },
  SHIPPED: { label: "ارسال شده", color: "text-purple-400 bg-purple-500/10" },
  DELIVERED: { label: "تحویل داده شده", color: "text-green-400 bg-green-500/10" },
  CANCELLED: { label: "لغو شده", color: "text-red-400 bg-red-500/10" },
};

// وضعیت دوره بر اساس تاریخ شروع/پایان محاسبه می‌شه (چون این فیلد مستقیم توی دیتابیس ذخیره نشده)
const getCourseStatus = (course) => {
  const now = new Date();
  const start = course.startDate ? new Date(course.startDate) : null;
  const end = course.endDate ? new Date(course.endDate) : null;

  if (end && end < now) return { label: "پایان یافته", color: "text-red-400 bg-red-500/10" };
  if (start && start > now) return { label: "به‌زودی", color: "text-yellow-400 bg-yellow-500/10" };
  if (start && start <= now && (!end || end >= now)) return { label: "در حال برگزاری", color: "text-green-400 bg-green-500/10" };
  return { label: "نامشخص", color: "text-gray-400 bg-gray-500/10" };
};

export default function Page() {
  const [activeSection, setActiveSection] = useState("users");
  const [data, setData] = useState({ users: [], products: [], courses: [], recipe: [], orders: [] });
  const [counts, setCounts] = useState({ users: 0, products: 0, courses: 0, recipe: 0, orders: 0 });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // برای مدال ادمین (تغییر پسورد کاربر)
  const [newUserPassword, setNewUserPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // برای مدال جزئیات سفارش
  const [orderDetailModal, setOrderDetailModal] = useState(null);

  // جستجوی سریع روی لیست فعلی (سمت کلاینت، روی داده‌های همون صفحه بارگذاری‌شده)
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [formData, setFormData] = useState({
    title: "", category: "", price: "", stock: "", duration: "",
    instructor: "", description: "", image: "",
    startDate: "", endDate: "",
    phoneNumber: "", firstName: "", lastName: "", addressDetail: "", postalCode: "",
    age: "", nationalCode: "",
    isAdmin: false, isVerified: false,
    ingredientsText: "", instructions: "", prepTime: "",
  });

  const menuItems = [
    { id: "orders", title: "سفارشات", icon: FaShoppingCart },
    { id: "users", title: "کاربران", icon: FaUsers },
    { id: "products", title: "محصولات", icon: AiFillProduct },
    { id: "courses", title: "دوره", icon: BiSolidMoviePlay },
    { id: "recipe", title: "دستور پخت", icon: LuNotebookText },
  ];

  const endpointOf = (section) => `/api/${section}`;
  const resultKeyOf = (section) => section;

  const fetchData = useCallback(async (section, pageNum, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${endpointOf(section)}?page=${pageNum}`, { credentials: "include" });
      const json = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("نشست شما منقضی شده، دوباره وارد شوید");
        return;
      }

      if (json.success) {
        const key = resultKeyOf(section);
        const list = json[key] || [];
        setData((prev) => ({ ...prev, [section]: append ? [...prev[section], ...list] : list }));
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

  useEffect(() => {
    setPage(1);
    setSearchTerm("");
    fetchData(activeSection, 1, false);
  }, [activeSection, fetchData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(activeSection, nextPage, true);
  };

  // آپلود واقعی به Supabase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("حجم تصویر نباید بیشتر از 2 مگابایت باشد");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: uploadFormData });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "خطا در آپلود تصویر");

      setFormData((prev) => ({ ...prev, image: json.url }));
      toast.success("تصویر با موفقیت آپلود شد");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    // اعتبارسنجی ساده تاریخ‌های دوره قبل از ارسال
    if (activeSection === "courses" && formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        toast.warning("تاریخ پایان دوره نمی‌تواند قبل از تاریخ شروع باشد");
        return;
      }
    }

    setSaving(true);

    try {
      const endpoint = endpointOf(activeSection);
      const method = editItem ? "PUT" : "POST";
      let payload = { ...formData };

      if (activeSection === "recipe") {
        const ingredients = formData.ingredientsText.split("\n").map((l) => l.trim()).filter(Boolean);
        payload = {
          title: formData.title, description: formData.description, ingredients,
          instructions: formData.instructions, prepTime: formData.prepTime, image: formData.image,
        };
      } else if (activeSection === "users") {
        payload = {
          phoneNumber: formData.phoneNumber, firstName: formData.firstName, lastName: formData.lastName,
          addressDetail: formData.addressDetail, postalCode: formData.postalCode,
          age: formData.age ? Number(formData.age) : null,
          nationalCode: formData.nationalCode || null,
          image: formData.image || null,
          isAdmin: formData.isAdmin, isVerified: formData.isVerified,
        };
      } else if (activeSection === "products") {
        payload = {
          title: formData.title, category: formData.category,
          price: Number(formData.price) || 0, stock: Number(formData.stock) || 0,
          description: formData.description, image: formData.image,
        };
      } else if (activeSection === "courses") {
        payload = {
          title: formData.title, instructor: formData.instructor,
          price: Number(formData.price) || 0, duration: formData.duration,
          description: formData.description, image: formData.image,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        };
      }

      if (editItem) payload.id = editItem.id;

      const res = await fetch(endpoint, {
        method, credentials: "include",
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
      const res = await fetch(`${endpointOf(activeSection)}?id=${id}`, { method: "DELETE", credentials: "include" });
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

  // تغییر وضعیت سفارش توسط ادمین
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("وضعیت سفارش به‌روزرسانی شد.");
        setData((prev) => ({
          ...prev,
          orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        }));
      } else {
        toast.error(json.error || "خطا در تغییر وضعیت");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // بازکردن قفل حساب کاربر
  const handleUnlockUser = async (userId) => {
    setUnlocking(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/unlock`, { method: "PATCH", credentials: "include" });
      const json = await res.json();
      if (json.success) {
        toast.success("قفل حساب باز شد.");
        setEditItem((prev) => (prev ? { ...prev, loginLockedUntil: null, loginAttempts: 0 } : prev));
        fetchData("users", page, false);
      } else {
        toast.error(json.error || "خطا در بازکردن قفل");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUnlocking(false);
    }
  };

  // تنظیم رمز عبور جدید برای کاربر توسط ادمین
  const handleSetUserPassword = async (userId) => {
    if (newUserPassword.length < 8) {
      toast.warning("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    setSettingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/set-password`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newUserPassword }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("رمز عبور کاربر تغییر کرد.");
        setNewUserPassword("");
      } else {
        toast.error(json.error || "خطا در تغییر رمز عبور");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSettingPassword(false);
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      title: "", category: "", price: "", stock: "", duration: "",
      instructor: "", description: "", image: "", startDate: "", endDate: "",
      phoneNumber: "", firstName: "", lastName: "", addressDetail: "", postalCode: "",
      age: "", nationalCode: "",
      isAdmin: false, isVerified: false,
      ingredientsText: "", instructions: "", prepTime: "",
    });
    setModalOpen(true);
  };

  // تاریخ ISO رو برای input type="date" به فرمت yyyy-mm-dd تبدیل می‌کنه
  const toDateInputValue = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setNewUserPassword("");
    setFormData({
      title: item.title || "", category: item.category || "", price: item.price ?? "",
      stock: item.stock ?? "", duration: item.duration || "",
      instructor: item.instructor || "", description: item.description || "", image: item.image || "",
      startDate: toDateInputValue(item.startDate), endDate: toDateInputValue(item.endDate),
      phoneNumber: item.phoneNumber || "", firstName: item.firstName || "", lastName: item.lastName || "",
      addressDetail: item.addressDetail || "", postalCode: item.postalCode || "",
      age: item.age ?? "", nationalCode: item.nationalCode || "",
      isAdmin: Boolean(item.isAdmin), isVerified: Boolean(item.isVerified),
      ingredientsText: Array.isArray(item.ingredients) ? item.ingredients.join("\n") : "",
      instructions: item.instructions || "", prepTime: item.prepTime || "",
    });
    setModalOpen(true);
  };

  const formatToman = (n) => `${Number(n || 0).toLocaleString()} تومان`;
  const formatDate = (d) => new Date(d).toLocaleDateString("fa-IR");

  // فیلتر سمت کلاینت روی داده‌های همون صفحه بارگذاری‌شده (جستجوی سراسری نیازمند پشتیبانی بک‌اند در API هست)
  const filteredCurrentList = useMemo(() => {
    const list = data[activeSection] || [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter((item) => {
      if (activeSection === "users") {
        const fullName = `${item.firstName || ""} ${item.lastName || ""}`.toLowerCase();
        return fullName.includes(term) || (item.phoneNumber || "").includes(term) || (item.nationalCode || "").includes(term);
      }
      return (item.title || "").toLowerCase().includes(term) || (item.category || "").toLowerCase().includes(term);
    });
  }, [data, activeSection, searchTerm]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data.orders;
    return data.orders.filter((order) => {
      const name = (order.recipientName || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`).toLowerCase();
      return name.includes(term) || (order.recipientPhone || "").includes(term) || (order.user?.phoneNumber || "").includes(term);
    });
  }, [data.orders, searchTerm]);

  const StatsRow = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="border border-white/10 bg-[#151516]/80 p-5 rounded-2xl backdrop-blur-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{item.title}</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{counts[item.id] ?? 0}</h3>
            </div>
            <div className="p-3 bg-[#CD9F63]/10 text-[#CD9F63] rounded-xl text-xl"><Icon /></div>
          </div>
        );
      })}
    </div>
  );

  const SearchBar = ({ placeholder }) => (
    <div className="relative w-full max-w-xs">
      <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:border-[#CD9F63]"
      />
    </div>
  );

  // --- بخش سفارشات ---
  const renderOrdersSection = () => (
    <div className="space-y-8 pb-20">
      <StatsRow />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">مدیریت سفارشات</h1>
        <SearchBar placeholder="جستجوی گیرنده یا شماره تماس..." />
      </div>

      <div className="border border-white/10 bg-[#151516]/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        {loading && data.orders.length === 0 ? (
          <div className="text-center py-16 text-[#CD9F63] text-sm font-medium animate-pulse">در حال بارگذاری اطلاعات...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{searchTerm ? "نتیجه‌ای یافت نشد." : "هیچ سفارشی ثبت نشده است."}</div>
        ) : (
          <>
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-400 bg-white/5">
                  <th className="p-4">مشتری</th>
                  <th className="p-4">تعداد اقلام</th>
                  <th className="p-4">مبلغ کل</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-center">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-all">
                    <td className="p-4 font-medium">
                      {order.recipientName || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || order.user?.phoneNumber}
                    </td>
                    <td className="p-4 text-xs text-gray-400">{order.items?.length || 0} قلم</td>
                    <td className="p-4 text-xs text-gray-300">{formatToman(order.totalAmount)}</td>
                    <td className="p-4 text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                        className={`text-xs rounded-lg px-2 py-1.5 border border-white/10 bg-[#0f0f10] outline-none cursor-pointer ${ORDER_STATUS_LABELS[order.status]?.color || ""}`}
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([value, { label }]) => (
                          <option key={value} value={value} className="bg-[#151516] text-white">{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setOrderDetailModal(order)}
                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/25 transition-all cursor-pointer"
                      >
                        مشاهده
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore && !searchTerm && (
              <div className="flex justify-center p-4 border-t border-white/10 bg-white/5">
                <button onClick={handleLoadMore} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50">
                  <span>{loading ? "در حال بارگذاری..." : "نمایش بیشتر"}</span>
                  <FaChevronDown />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* مدال جزئیات سفارش */}
      {orderDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151516] border border-white/10 p-6 rounded-3xl w-full max-w-lg text-white my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold">جزئیات سفارش</h2>
              <button onClick={() => setOrderDetailModal(null)} className="text-gray-400 hover:text-white cursor-pointer"><FaTimes /></button>
            </div>

            <div className="space-y-3 text-sm">
              <p><span className="text-gray-400">گیرنده:</span> {orderDetailModal.recipientName}</p>
              <p><span className="text-gray-400">شماره تماس:</span> {orderDetailModal.recipientPhone}</p>
              <p><span className="text-gray-400">کد پستی:</span> {orderDetailModal.postalCode}</p>
              <p><span className="text-gray-400">آدرس:</span> {orderDetailModal.shippingAddress}</p>
              {orderDetailModal.cancelReason && (
                <p><span className="text-gray-400">دلیل لغو:</span> {orderDetailModal.cancelReason}</p>
              )}

              <div className="border-t border-white/10 pt-3 mt-3">
                <p className="text-gray-400 text-xs mb-2">اقلام سفارش:</p>
                <div className="space-y-2">
                  {orderDetailModal.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-xs">{item.titleSnapshot} × {item.quantity}</span>
                      <span className="text-xs text-[#CD9F63]">{formatToman(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-3 mt-3 font-bold">
                <span>مبلغ کل</span>
                <span className="text-[#CD9F63]">{formatToman(orderDetailModal.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (activeSection === "orders") return renderOrdersSection();

    const currentList = filteredCurrentList;
    const searchPlaceholder =
      activeSection === "users" ? "جستجوی نام، شماره یا کد ملی..." : "جستجوی عنوان یا دسته‌بندی...";

    return (
      <div className="space-y-8 pb-20">
        <StatsRow />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold text-white">مدیریت {menuItems.find((m) => m.id === activeSection)?.title}</h1>
          <div className="flex items-center gap-3">
            <SearchBar placeholder={searchPlaceholder} />
            <button onClick={openAddModal} className="flex items-center gap-2 bg-[#CD9F63] text-[#111] px-4 py-2 rounded-xl text-xs font-bold hover:bg-white transition-all cursor-pointer whitespace-nowrap">
              <FaPlus /><span>افزودن مورد جدید</span>
            </button>
          </div>
        </div>

        <div className="border border-white/10 bg-[#151516]/80 rounded-2xl overflow-hidden backdrop-blur-xl">
          {loading && (data[activeSection] || []).length === 0 ? (
            <div className="text-center py-16 text-[#CD9F63] text-sm font-medium animate-pulse">در حال بارگذاری اطلاعات...</div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">{searchTerm ? "نتیجه‌ای یافت نشد." : "هیچ داده‌ای یافت نشد."}</div>
          ) : (
            <>
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 bg-white/5">
                    <th className="p-4">تصویر</th>
                    <th className="p-4">عنوان / نام کاربر</th>
                    <th className="p-4">جزئیات</th>
                    {activeSection === "products" && <th className="p-4">موجودی</th>}
                    {activeSection === "courses" && <th className="p-4">وضعیت</th>}
                    {activeSection === "users" && <th className="p-4">نقش</th>}
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {currentList.map((item, index) => {
                    console.log("USER DATA:", item);
                    const courseStatus = activeSection === "courses" ? getCourseStatus(item) : null;
                    return (
                      <tr key={`${item.id}-${index}`} className="hover:bg-white/5 transition-all">
                        <td className="p-4">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-500">بدون عکس</div>
                          )}
                        </td>
                        <td className="p-4 font-medium">
                          {activeSection === "users"
                            ? `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.phoneNumber || "بدون نام"
                            : (item.title || "بدون عنوان")}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {activeSection === "users"
                            ? item.phoneNumber
                            : (item.price
                              ? `${Number(item.price).toLocaleString()} تومان`
                              : (item.category || item.duration || item.prepTime || "-"))}
                        </td>
                        {activeSection === "products" && (
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-lg ${item.stock > 0 ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                              {item.stock > 0 ? `${item.stock} عدد` : "ناموجود"}
                            </span>
                          </td>
                        )}
                        {activeSection === "courses" && (
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-lg ${courseStatus.color}`}>{courseStatus.label}</span>
                          </td>
                        )}
                        {activeSection === "users" && (
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-lg ${item.isAdmin ? "text-[#CD9F63] bg-[#CD9F63]/10" : "text-gray-400 bg-gray-500/10"}`}>
                              {item.isAdmin ? "مدیر" : "کاربر عادی"}
                            </span>
                          </td>
                        )}
                        <td className="p-4 flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/25 transition-all cursor-pointer"><FaEdit /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/25 transition-all cursor-pointer"><FaTrash /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {hasMore && !searchTerm && (
                <div className="flex justify-center p-4 border-t border-white/10 bg-white/5">
                  <button onClick={handleLoadMore} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50">
                    <span>{loading ? "در حال بارگذاری..." : "نمایش بیشتر"}</span>
                    <FaChevronDown />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#151516] border border-white/10 p-6 rounded-3xl w-full max-w-lg text-white my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <h2 className="text-lg font-bold">{editItem ? "ویرایش مورد" : "افزودن مورد جدید"}</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><FaTimes /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {activeSection === "users" ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">شماره تلفن</label>
                      <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">نام</label>
                        <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">نام خانوادگی</label>
                        <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">سن</label>
                        <input type="number" min="0" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">کد ملی</label>
                        <input type="text" value={formData.nationalCode} onChange={(e) => setFormData({ ...formData, nationalCode: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">جزئیات آدرس</label>
                      <textarea value={formData.addressDetail} onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" rows="2" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">کد پستی</label>
                      <input type="text" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">تصویر پروفایل</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs cursor-pointer hover:bg-white/20 transition-all">
                          <FaImage /><span>{uploadingImage ? "در حال آپلود..." : "انتخاب فایل"}</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                        </label>
                        {formData.image ? (
                          <img src={formData.image} alt="Preview" className="w-8 h-8 rounded object-cover border border-white/20" />
                        ) : (
                          <span className="text-xs text-gray-400">تصویری انتخاب نشده است</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input type="checkbox" checked={formData.isAdmin} onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })} className="accent-[#CD9F63]" />
                        مدیر سیستم (Admin)
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input type="checkbox" checked={formData.isVerified} onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })} className="accent-[#CD9F63]" />
                        تایید شده (Verified)
                      </label>
                    </div>

                    {/* بخش‌های ادمین‌محور - فقط موقع ویرایش کاربر موجود نشون داده می‌شن */}
                    {editItem && (
                      <div className="border-t border-white/10 pt-4 mt-2 space-y-4">
                        {editItem.loginLockedUntil && (
                          <div className="flex items-center justify-between bg-red-500/10 rounded-xl px-4 py-3">
                            <span className="text-xs text-red-300">این حساب به‌دلیل تلاش‌های ناموفق قفل شده</span>
                            <button
                              type="button"
                              onClick={() => handleUnlockUser(editItem.id)}
                              disabled={unlocking}
                              className="flex items-center gap-1 text-xs bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <FaLockOpen /> {unlocking ? "در حال بازکردن..." : "بازکردن قفل"}
                            </button>
                          </div>
                        )}

                        <div>
                          <label className="text-xs text-gray-400 block mb-1 flex items-center gap-1"><FaKey /> تنظیم رمز عبور جدید</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newUserPassword}
                              onChange={(e) => setNewUserPassword(e.target.value)}
                              placeholder="حداقل ۸ کاراکتر، حرف و عدد"
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSetUserPassword(editItem.id)}
                              disabled={settingPassword}
                              className="px-4 py-2 rounded-xl text-xs bg-[#CD9F63]/20 text-[#CD9F63] hover:bg-[#CD9F63]/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {settingPassword ? "..." : "تنظیم"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : activeSection === "recipe" ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">عنوان</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">مواد لازم (هر خط یک ماده)</label>
                      <textarea value={formData.ingredientsText} onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" rows="4" placeholder={"مثال:\n۲ پیمانه آرد\n۱ قاشق چای‌خوری نمک"} required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">طرز تهیه</label>
                      <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" rows="4" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">زمان آماده‌سازی</label>
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
                          <FaImage /><span>{uploadingImage ? "در حال آپلود..." : "انتخاب فایل"}</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">قیمت (تومان)</label>
                            <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">موجودی انبار</label>
                            <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                          </div>
                        </div>
                      </>
                    )}

                    {activeSection === "courses" && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">مدرس</label>
                          <input type="text" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">قیمت دوره (تومان)</label>
                            <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">مدت زمان</label>
                            <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="مثلا: ۸ ساعت" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63]" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">تاریخ شروع</label>
                            <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63] [color-scheme:dark]" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">تاریخ پایان</label>
                            <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CD9F63] [color-scheme:dark]" />
                          </div>
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
                          <FaImage /><span>{uploadingImage ? "در حال آپلود..." : "انتخاب فایل"}</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
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
      <ToastContainer position="bottom-left" autoClose={2000} hideProgressBar={true} newestOnTop={true} closeOnClick rtl={true} pauseOnFocusLoss={false} draggable={false} pauseOnHover={false} theme="dark" />

      <div className="group w-16 hover:w-56 transition-all duration-300 flex flex-col gap-2 h-full border-l border-white/10 p-3 bg-[#151516]/80 backdrop-blur-xl shadow-sm z-20">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                activeSection === item.id ? "bg-[#CD9F63] text-[#111] font-bold shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="text-xl min-w-6" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm">{item.title}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 p-8 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}