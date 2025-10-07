import { getFeaturedProducts, getLatestProducts } from "../lib/products";
import ProductCarousel from "../components/product/ProductCarousel";
import ProductCard from "../components/product/ProductCard";
import JsonLd from "../components/seo/JsonLd";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    getFeaturedProducts(16),
    getLatestProducts(12)
  ]);

  return (
    <>
      <section className="relative bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h1 className="text-4xl md:text-5xl font-bold">Discover Quality Products</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">Curated items delivered with speed and trust.</p>
          <div className="mt-8 flex gap-4">
            <a href="/shop" className="bg-white text-indigo-700 px-5 py-3 rounded-md text-sm font-medium">Shop Now</a>
            <a href="/about" className="border border-white/40 px-5 py-3 rounded-md text-sm font-medium hover:bg-white/10">Learn More</a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Discover our wide range of products</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/shop?category=dhoop" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Dhoop Products"
                  className="w-16 h-16 object-cover rounded-full"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Dhoop</h3>
                <p className="text-sm text-gray-500 mt-1">Sacred Fragrance</p>
              </div>
            </div>
          </a>
          
          <a href="/shop?category=incense" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1596462502278-4bfe3525c3e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Incense Sticks"
                  className="w-16 h-16 object-cover rounded-full"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Incense Sticks</h3>
                <p className="text-sm text-gray-500 mt-1">Aromatic Sticks</p>
              </div>
            </div>
          </a>
          
          <a href="/shop?category=attar" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Attar Perfumes"
                  className="w-16 h-16 object-cover rounded-full"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Attar</h3>
                <p className="text-sm text-gray-500 mt-1">Natural Perfumes</p>
              </div>
            </div>
          </a>
          
          <a href="/shop?category=herbal" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Herbal Products"
                  className="w-16 h-16 object-cover rounded-full"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Herbal</h3>
                <p className="text-sm text-gray-500 mt-1">Natural Remedies</p>
              </div>
            </div>
          </a>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Products</h2>
            <a href="/shop" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              View all →
            </a>
          </div>
          <ProductCarousel products={featured} />
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Latest Products</h2>
          <a href="/shop" className="text-sm text-indigo-600 hover:underline">View all</a>
        </div>
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {latest.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Patram Store",
        "url": "http://localhost:4000",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "http://localhost:4000/shop?query={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }} />
    </>
  );
}
