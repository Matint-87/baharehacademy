// components/FreeRecipes.js
const sampleRecipes = [
  { id: 1, title: 'خوراک سبزیجات', image: '/recipe1.jpg' },
  { id: 2, title: 'کیک شکلاتی', image: '/recipe2.jpg' },
  { id: 3, title: 'پاستا ویژه', image: '/recipe3.jpg' },
]

export const Recipes = () => (
  <section className="py-20 px-6 bg-gray-50">
    <h2 className="text-3xl font-bold text-center mb-10">دستور پخت رایگان</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {sampleRecipes.map((recipe) => (
        <div key={recipe.id} className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden">
          <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
              مشاهده دستور پخت
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)