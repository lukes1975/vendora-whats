import { Link } from 'react-router-dom';

const PopularProducts = () => {
  const products = [
    {
      id: 1,
      name: "iPhone 13 Pro Max",
      price: "₦180,000",
      originalPrice: "₦200,000",
      image: "/images/electronics.jpg",
      seller: "John Doe",
      rating: 4.9,
      reviews: 24,
      category: "Electronics",
      badge: "Hot Deal"
    },
    {
      id: 2,
      name: "Calculus Textbook",
      price: "₦3,500",
      originalPrice: "₦5,000",
      image: "/images/books.jpg",
      seller: "Sarah M.",
      rating: 4.8,
      reviews: 12,
      category: "Books",
      badge: "Best Seller"
    },
    {
      id: 3,
      name: "Nike Air Force 1",
      price: "₦25,000",
      originalPrice: "₦35,000",
      image: "/images/fashion.jpg",
      seller: "Mike T.",
      rating: 4.7,
      reviews: 18,
      category: "Fashion",
      badge: "Trending"
    },
    {
      id: 4,
      name: "Pizza Delivery",
      price: "₦2,500",
      originalPrice: "₦3,000",
      image: "/images/food.jpg",
      seller: "Campus Kitchen",
      rating: 4.9,
      reviews: 45,
      category: "Food",
      badge: "Popular"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-s4 to-s5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="h2 text-white mb-4">
            <span className="bg-gradient-to-r from-p1 to-p2 bg-clip-text text-transparent">Popular</span> This Week
          </h2>
          <p className="body-1 text-neutral-300 max-w-2xl mx-auto">
            See what's trending on campus. These items are flying off the shelves!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group relative"
            >
              <div className="relative bg-s2/40 backdrop-blur-sm border border-s3/30 rounded-2xl p-6 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-p1/10">
                {/* Badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-bold text-white
                    ${product.badge === 'Hot Deal' ? 'bg-gradient-to-r from-p1 to-p2' :
                      product.badge === 'Best Seller' ? 'bg-gradient-to-r from-p2 to-p3' :
                      product.badge === 'Trending' ? 'bg-gradient-to-r from-p3 to-accent1' :
                      'bg-gradient-to-r from-accent1 to-accent2'}
                  `}>
                    {product.badge}
                  </span>
                </div>

                {/* Product Image */}
                <div className="relative mb-4 h-48 bg-s3/30 rounded-xl overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-s1/50 to-transparent" />
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-p1 transition-colors duration-300 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neutral-400">{product.category}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-p1">{product.price}</span>
                    <span className="text-sm text-neutral-500 line-through">{product.originalPrice}</span>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-p3' : 'text-neutral-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-neutral-400">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-2 pt-2 border-t border-s3/30">
                    <div className="w-6 h-6 bg-gradient-to-r from-p1 to-p2 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {product.seller.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-400">by {product.seller}</span>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-p1/0 via-p1/5 to-p2/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
            View All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
