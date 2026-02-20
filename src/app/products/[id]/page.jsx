import ProductDetail from "@/src/components/ProductDetails";

export default function Page() {
  const fakeProducts = [
    {
      id: 1,
      name: "پیتزا مخصوص",
      description: "پیتزا با ژامبون، قارچ، پنیر و سس مخصوص",
      image: [
        "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/09.jpg",
        "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/10.jpg",
      ],
      weight_type: "گرم",
      weight: 500,
      shelf_life_type: "روز",
      shelf_life: 2,
      price: 120000,
      final_price: 96000,
      discount: 20,
    },
    {
      id: 2,
      name: "پیتزا گوشت و پنیر",
      description: "پیتزا با گوشت و پنیر و سبزیجات",
      image: [
        "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/11.jpg",
      ],
      weight_type: "گرم",
      weight: 550,
      shelf_life_type: "روز",
      shelf_life: 3,
      price: 150000,
      final_price: 135000,
      discount: 10,
    },
    {
      id: 3,
      name: "پیتزا سبزیجات",
      description: "پیتزا با سبزیجات تازه و پنیر",
      image: [
        "https://cdn.snappfood.ir/300x200/uploads/images/vendor-cover-app-review/16/12.jpg",
      ],
      weight_type: "گرم",
      weight: 480,
      shelf_life_type: "روز",
      shelf_life: 2,
      price: 110000,
      final_price: 110000,
      discount: 0,
    },
  ];

  // مثال: نمایش محصول با id = 1
  const product = fakeProducts.find((p) => p.id === 1);

  return <ProductDetail product={product} />;
}