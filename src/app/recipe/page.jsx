import { pool } from "@/lib/db";

async function getProducts() {
  "use server";
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function page() {
  const products = await getProducts();

  return (
    <>
      <div className="flex flex-wrap gap-6 justify-center">
        {products.map((item) => (
          <div
            key={item.id}
            className="w-80  rounded-lg overflow-hidden shadow-lg bg-white p-4 transition-all duration-300 hover:shadow-xl"
          >
            <div className="w-full h-56 md:h-64 overflow-hidden rounded-md mb-4">
              <img
                className="w-full h-full object-cover"
                src={item.image}
                alt={item.name}
              />
            </div>

            {/* Product Info */}
            <div className="px-2 pb-3">
              <h2 className="font-bold text-xl mb-2 text-gray-800">
                {item.name}
              </h2>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>نوع گوشت</span>
                <span className="font-semibold text-gray-700">
                  {item.meat_type}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>درصد گوشت</span>
                <span className="font-semibold text-gray-700">
                  {item.meat_percentage}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>وزن</span>
                <span className="font-semibold text-gray-700">
                  {item.weight_grams} گرم
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>تاریخ انقضا</span>
                <span className="font-semibold text-gray-700">
                  {item.expiration_date}
                </span>
              </div>

              {/* Price and Stock Info */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-red-700 font-bold text-lg">
                  {item.price} تومان
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 text-sm">
                  افزودن به سبد
                </button>
              </div>

              {item.stock_quantity <= 5 && (
                <div className="mt-3 text-xs text-orange-600 font-medium">
                  تنها {item.stock_quantity} عدد در انبار باقی مانده!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
