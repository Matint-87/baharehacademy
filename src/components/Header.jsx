"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  RiBookOpenLine,
  RiShoppingBagLine,
  RiFileListLine,
  RiInformationLine,
  RiShoppingBasketLine,
  RiSearchLine,
  RiUserLine,
  RiLogoutBoxRLine,
  RiCloseLine,
  RiShieldUserLine,
} from "react-icons/ri";

function Header() {
  const pathName = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    courses: [],
    products: [],
    recipe: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // بستن منوی کشویی با کلیک خارج از آن
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // منبع حقیقت وضعیت کاربر همیشه سرور (کوکی httpOnly) هست، نه localStorage
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        localStorage.removeItem("user");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (e) {
      console.error("Error fetching user session:", e);
    }
  }, []);

  // تعداد آیتم‌های سبد خرید همیشه از سرور خونده می‌شه، نه از یک استور لوکال
  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        setCartCount(0); // کاربر لاگین نیست یا خطا -> سبد خالی نشون بده
        return;
      }
      const data = await res.json();
      if (data.success) {
        setCartCount(data.cart.items.length);
      }
    } catch (e) {
      console.error("Error fetching cart count:", e);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // نمایش فوری از کش قدیمی برای جلوگیری از فلش زدن
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }

    // گرفتن تازه‌ترین اطلاعات از سرور
    fetchUser();
    fetchCartCount();

    // هر جای دیگه‌ی سایت که سبد خرید تغییر کنه (افزودن/حذف/ویرایش)،
    // با dispatch کردن این ایونت باید هدر رو مطلع کنه تا badge آپدیت بشه
    window.addEventListener("auth-changed", fetchUser);
    window.addEventListener("cart-changed", fetchCartCount);
    return () => {
      window.removeEventListener("auth-changed", fetchUser);
      window.removeEventListener("cart-changed", fetchCartCount);
    };
  }, [fetchUser, fetchCartCount]);

  // فوکوس خودکار روی اینپوت سرچ وقتی مدال باز میشه
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [searchModalOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ courses: [], products: [], recipe: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        const data = await res.json();
        if (data.success) {
          setSearchResults({
            courses: data.courses || [],
            products: data.products || [],
            recipe: data.recipe || [],
          });
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setDropdownOpen(false);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error during logout:", e);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      setLoggingOut(false);
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { title: "دوره‌ها", href: "/courses", icon: <RiBookOpenLine /> },
    { title: "محصولات", href: "/products", icon: <RiShoppingBagLine /> },
    { title: "دستور پخت", href: "/recipe", icon: <RiFileListLine /> },
    { title: "درباره ما", href: "/about", icon: <RiInformationLine /> },
  ];

  if (pathName !== "/admin") {
    return (
      <>
        <header className="w-full h-17.5 flex justify-center items-center bg-[#101011]/95 backdrop-blur-[14px] sticky top-0 z-50 border-b border-[#1E1E1D]">
          <div className="w-[85%] 2xl:w-[60%] flex items-center h-full justify-between">
            <Link href="/" className="">
              <span className="text-2xl text-[#e24257]">B</span>
              <span className="text-xl text-[#FFDE63]">A</span>
            </Link>

            <nav className="hidden lg:flex gap-6 h-5 px-5 items-center">
              {navLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathName === item.href
                      ? "text-[#CD9F63]"
                      : "text-white hover:text-[#CD9F63]"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="text-2xl text-white cursor-pointer hover:text-[#CD9F63] transition-colors p-1 bg-transparent border-none"
                title="جستجو"
              >
                <RiSearchLine />
              </button>

              <Link href="/cart">
                <div className="relative p-2">
                  {isMounted && cartCount > 0 && (
                    <span className="px-1.5 py-0.5 absolute -top-1 -right-2 text-xs flex items-center justify-center rounded-full bg-[#CD9F63] text-[#101011] font-bold">
                      {cartCount}
                    </span>
                  )}
                  <RiShoppingBasketLine className="text-2xl text-white hover:text-[#CD9F63] transition-colors" />
                </div>
              </Link>

              {isMounted && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#151516] px-3 py-2 text-sm text-white transition-all hover:border-[#CD9F63]/50 cursor-pointer"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#CD9F63]/10 text-[#CD9F63]">
                      <RiUserLine />
                    </div>
                    <span className="hidden sm:inline">
                      {user.firstName
                        ? `${user.firstName} ${user.lastName || ""}`
                        : user.phoneNumber}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#151516] p-2 shadow-2xl backdrop-blur-xl z-50">
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-gray-300 transition-colors hover:bg-white/5 hover:text-[#CD9F63]"
                      >
                        <RiUserLine className="text-base" />
                        حساب کاربری
                      </Link>

                      {/* بررسی ادمین بودن کاربر */}
                      {user?.isAdmin === true && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-gray-300 transition-colors hover:bg-white/5 hover:text-[#CD9F63]"
                        >
                          <RiShieldUserLine className="text-base" />
                          پنل مدیریت
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                      >
                        <RiLogoutBoxRLine className="text-base" />
                        {loggingOut ? "در حال خروج..." : "خروج از حساب"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hover:bg-[#101011] hover:text-[#CD9F63] hover:border-[#CD9F63] border duration-200 flex justify-center items-center bg-[#CD9F63] text-[#101011] rounded py-2 px-4"
                >
                  <span className="text-sm font-medium">ورود / ثبت‌نام</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md pt-20 px-4">
            <div className="bg-[#151516] border border-white/10 rounded-3xl w-full max-w-2xl text-white overflow-hidden shadow-2xl">
              <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5">
                <RiSearchLine className="text-xl text-[#CD9F63]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در محصولات، دوره‌ها و دستور پخت‌ها..."
                  className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
                />
                <button
                  onClick={() => {
                    setSearchModalOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-gray-400 hover:text-white p-1 cursor-pointer"
                >
                  <RiCloseLine className="text-2xl" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
                {searchLoading ? (
                  <div className="text-center py-10 text-[#CD9F63] text-xs animate-pulse">
                    در حال جستجو...
                  </div>
                ) : !searchQuery.trim() ? (
                  <div className="text-center py-10 text-gray-500 text-xs">
                    عبارت مورد نظر خود را تایپ کنید...
                  </div>
                ) : searchResults.courses.length === 0 &&
                  searchResults.products.length === 0 &&
                  searchResults.recipe.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    هیچ موردی با این عبارت یافت نشد.
                  </div>
                ) : (
                  <>
                    {searchResults.courses.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-[#CD9F63] mb-3 border-b border-white/5 pb-1">
                          دوره‌های آموزشی
                        </h3>
                        <div className="space-y-2">
                          {searchResults.courses.map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${course.id}`}
                              onClick={() => {
                                setSearchModalOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all"
                            >
                              {course.image && (
                                <img
                                  src={course.image}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-white">
                                  {course.title}
                                </h4>
                                <p className="text-[11px] text-gray-400">
                                  مدرس: {course.instructor}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.products.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-[#CD9F63] mb-3 border-b border-white/5 pb-1">
                          محصولات
                        </h3>
                        <div className="space-y-2">
                          {searchResults.products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={() => {
                                setSearchModalOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all"
                            >
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-white">
                                  {product.title}
                                </h4>
                                <p className="text-[11px] text-gray-400">
                                  {Number(product.price || 0).toLocaleString()}{" "}
                                  تومان
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.recipe.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-[#CD9F63] mb-3 border-b border-white/5 pb-1">
                          دستور پخت‌ها
                        </h3>
                        <div className="space-y-2">
                          {searchResults.recipe.map((recipe) => (
                            <Link
                              key={recipe.id}
                              href={`/recipe/${recipe.id}`}
                              onClick={() => {
                                setSearchModalOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all"
                            >
                              {recipe.image && (
                                <img
                                  src={recipe.image}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-white">
                                  {recipe.title}
                                </h4>
                                <p className="text-[11px] text-gray-400">
                                  آماده‌سازی: {recipe.prepTime}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="fixed backdrop-blur-[14px] bg-[#101011]/40 bottom-0 left-0 w-full shadow-md flex justify-around items-center py-2 lg:hidden z-50 border-t border-[#1E1E1D]">
          {navLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex flex-col items-center text-[10px] duration-300 ${
                pathName === item.href ? "text-[#CD9F63]" : "text-gray-200"
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </>
    );
  }
}

export default Header;