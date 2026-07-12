"use client";

function Login() {
  console.log(navigator.userAgent);
  
  return (
    <div className="w-full h-screen bgg flex justify-center items-center">
      <div className="w-92 h-80 p-10 backdrop-blur-[14px] bg-white/40 rounded-lg border border-[#DFE4EB] justify-center flex flex-col gap-10">
        <div className="flex flex-col gap-2.5">
          <p className="text-xl text-[#252b32]">ورود/ثبت‌نام</p>
          <p className="text-sm text-[#5d6c7e]">
            لطفاً شماره موبایل خود را وارد کنید.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="w-full rounded border-[#DFE4EB] border py-2.5 px-4">
            <input
              name="mobile"
              className="w-full outline-0 bg-auto"
              type="text"
              placeholder="برای مثال ۰۹۱۲۳۴۵۶۷۸۹"
              onChange={(e) =>
                (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
              }
            />
          </div>
          <button className="w-full p-2.5 hover:bg-white hover:text-[#e24257] hover:border-[#e24257] bg-[#e24257] border border-white text-white duration-300 rounded cursor-pointer flex justify-center items-center">
            ادامه
          </button>
        </div>
      </div>  
    </div>
  );
}

export default Login;
