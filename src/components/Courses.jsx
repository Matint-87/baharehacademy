// components/Courses.js
const sampleCourses = [
  { id: 1, title: 'آشپزی مبتدی', level: 'مبتدی', price: 'رایگان', image: '/course1.jpg' },
  { id: 2, title: 'کیک و شیرینی', level: 'متوسط', price: '200,000 تومان', image: '/course2.jpg' },
  { id: 3, title: 'غذاهای بین‌المللی', level: 'پیشرفته', price: '500,000 تومان', image: '/course3.jpg' },
]

export const Courses = () => (
  <section className="py-20 px-6 bg-white">
    <h2 className="text-3xl font-bold text-center mb-10">دوره‌ها</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {sampleCourses.map((course) => (
        <div key={course.id} className="bg-gray-50 rounded-lg shadow hover:shadow-lg overflow-hidden">
          <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-2">سطح: {course.level}</p>
            <p className="text-orange-500 font-bold mb-4">{course.price}</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
              ثبت‌نام
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)