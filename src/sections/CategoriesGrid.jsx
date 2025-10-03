import { Link } from 'react-router-dom';

const CategoriesGrid = () => {
  const categories = [
    {
      name: "Electronics",
      icon: "📱",
      count: "120+ items",
      color: "from-p1 to-p2",
      bgColor: "bg-p1/10",
      borderColor: "border-p1/20"
    },
    {
      name: "Fashion",
      icon: "👕",
      count: "85+ items",
      color: "from-p2 to-p3",
      bgColor: "bg-p2/10",
      borderColor: "border-p2/20"
    },
    {
      name: "Books",
      icon: "📚",
      count: "200+ items",
      color: "from-p3 to-accent1",
      bgColor: "bg-p3/10",
      borderColor: "border-p3/20"
    },
    {
      name: "Food",
      icon: "🍕",
      count: "45+ items",
      color: "from-accent1 to-accent2",
      bgColor: "bg-accent1/10",
      borderColor: "border-accent1/20"
    },
    {
      name: "Home & Living",
      icon: "🏠",
      count: "60+ items",
      color: "from-accent2 to-accent3",
      bgColor: "bg-accent2/10",
      borderColor: "border-accent2/20"
    },
    {
      name: "Sports",
      icon: "⚽",
      count: "35+ items",
      color: "from-accent3 to-p1",
      bgColor: "bg-accent3/10",
      borderColor: "border-accent3/20"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-s3 to-s4">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="h2 text-white mb-4">
            Shop by <span className="bg-gradient-to-r from-p1 to-p2 bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="body-1 text-neutral-300 max-w-2xl mx-auto">
            Find exactly what you're looking for. Browse our popular categories with hundreds of items from fellow students.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/category/${category.name.toLowerCase()}`}
              className="group relative"
            >
              <div className={`
                relative bg-s2/40 backdrop-blur-sm border rounded-2xl p-6 h-full 
                transition-all duration-300 hover:scale-105 hover:shadow-2xl
                ${category.bgColor} ${category.borderColor} hover:border-opacity-40
              `}>
                {/* Icon */}
                <div className="text-4xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-p1 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {category.count}
                  </p>
                </div>

                {/* Hover Gradient Overlay */}
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 
                  group-hover:opacity-10 transition-opacity duration-300 pointer-events-none
                  ${category.color}
                `} />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-p1 to-p2 text-white rounded-xl font-medium hover:from-p1/90 hover:to-p2/90 transition-all duration-300 hover:scale-105"
          >
            View All Categories
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
