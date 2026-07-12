import Image from "next/image";
import Link from "next/link";

async function getProducts() {
  "use server"
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function ProductItems() {
  const productList = await getProducts();

  return (
    <>
      <div className="flex flex-wrap gap-6 justify-center">
        {productList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 flex flex-col overflow-hidden w-65 h-90"
          >
            <div className="relative w-full h-56">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-t-2xl"
              />
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between">
              <p className="text-gray-600 line-clamp-1 text-sm mb-3">
                {item.description}
              </p>

              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col h-10">
                  <span className="font-bold text-lg md:text-xl text-gray-900">
                    {item.final_price.toLocaleString()} تومان
                  </span>
                  {item.discount > 0 && (
                    <span className="text-gray-400 line-through text-sm">
                      {item.price.toLocaleString()} تومان
                    </span>
                  )}
                </div>

                {item.discount > 0 && (
                  <div className="px-2 py-1 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {item.discount}%
                    </span>
                  </div>
                )}
              </div>

              <Link href={`/products/${item.id}`}>
                <button className="bg-[#FE5F55] hover:bg-[#FE4F44] text-white rounded py-2 px-4 w-full transition-all duration-300 shadow-sm hover:shadow-md font-medium">
                  مشاهده محصول
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
