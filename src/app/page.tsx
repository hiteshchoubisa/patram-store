import { getFeaturedProducts, getLatestProducts } from "../lib/products";
import ProductCarousel from "../components/product/ProductCarousel";
import ProductCard from "../components/product/ProductCard";
import JsonLd from "../components/seo/JsonLd";
import Image from "next/image";
 

export const revalidate = 300;

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    getFeaturedProducts(16),
    getLatestProducts(12)
  ]);

  // Fetch a larger pool to build category sections
  const categoryPool = await getLatestProducts(120);

  const byCategory = (() => {
    const groups = { dhoop: [] as typeof categoryPool, incense: [] as typeof categoryPool, attar: [] as typeof categoryPool, others: [] as typeof categoryPool };
    for (const p of categoryPool) {
      const raw = (p.category || '');
      const c = raw.trim().toLowerCase();

      const isDhoop = /dhoop/.test(c);                       // matches 'dhoop', 'dhoop sticks'
      const isIncense = /(incense|agarbatti)/.test(c);       // matches 'incense', 'incense sticks', 'agarbatti'
      const isAttar = /attar/.test(c);                       // matches 'attar', 'attar oil'

      if (isDhoop) groups.dhoop.push(p);
      else if (isIncense) groups.incense.push(p);
      else if (isAttar) groups.attar.push(p);
      else groups.others.push(p);
    }
    return groups;
  })();

  // Remove specific products by name (case-insensitive)
  const excluded = ["bheem seni", "patram silver 200gm"];
  const filteredFeatured = featured.filter(p => !excluded.includes(p.name.toLowerCase()));

  return (
    <>
      <section className="bg-banner">
        <div className="banner-section">
          <div className="flex flex-col justify-center items-start py-20">
            <h1 className="heading1">Make Environment <br/><strong>Aromatic & Safe
            </strong></h1>
            <p className="mt-4 max-w-xl text-lg">Our Insence and Dhoop sticks are not only serving aroma, but also killing bacteria to safe our environment.</p>
            <div className="mt-8 flex gap-4">
              <a href="/shop" className="btn btn-primary">Shop Now</a>
            </div>
          </div>
          <Image
                    src="/banner-patram.png"
                    alt="Patram"
                    width={580}
                    height={530}
                    priority
                    className="banner-img "
                  />
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-block bg-light-brown">
        <div className="container">
        <div className="text-center mb-8">
          <h2 className="heading2">Shop by Category</h2>
          <p>Discover our wide range of products</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/shop?category=dhoop" className="category-card">
      
              <div className="p-4 text-center">
                <h3 className="cat-title">Dhoop Sticks</h3>
                <p className="text-sm text-gray-500 mt-1">Sacred Fragrance</p>
              </div>
        
          </a>
          
          <a href="/shop?category=incense" className="category-card">
         
              <div className="p-4 text-center">
                <h3 className="cat-title">Incense Sticks</h3>
                <p className="text-sm text-gray-500 mt-1">Aromatic Sticks</p>
              </div>
           
          </a>
          
          <a href="/shop?category=attar" className="category-card">
         
              <div className="p-4 text-center">
                <h3 className="cat-title">Attar</h3>
                <p className="text-sm text-gray-500 mt-1">Natural Perfumes</p>
              </div>
       
          </a>
          
          <a href="/shop?category=others" className="category-card">
         
              <div className="p-4 text-center">
                <h3 className="cat-title">Others</h3>
                <p className="text-sm text-gray-500 mt-1">Essential Products</p>
              </div>
           
          </a>
        </div>
          </div>
      </section>

      {/* Category Wise Product Sections */}
      {Object.entries(byCategory).map(([catKey, items]) => (
        items.length > 0 && (
          <section key={catKey} className="section-block">
            <div className="container">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="heading2">
                    {catKey === 'dhoop' && 'Dhoop Sticks'}
                    {catKey === 'incense' && 'Incense Sticks'}
                    {catKey === 'attar' && 'Attar'}
                    {catKey === 'others' && 'Other Products'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {catKey === 'dhoop' && 'Sacred fragrance collection.'}
                    {catKey === 'incense' && 'Aromatic sticks for ambiance.'}
                    {catKey === 'attar' && 'Natural perfume oils.'}
                    {catKey === 'others' && 'Miscellaneous essentials.'}
                  </p>
                </div>
                <a href={`/shop?category=${catKey}`} className="text-sm text-indigo-600 hover:underline">
                  View all
                </a>
              </div>

              {/* Use carousel if many items (desktop >4, mobile >2) */}
              {items.length > 4 ? (
                <ProductCarousel
                  products={items}
                  limit={12}
                  className="category-carousel mb-2"
                />
              ) : (
                <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {items.slice(0, 12).map(p => (
                    <ProductCard key={p.id} product={{ ...p, images: p.images ?? undefined, photo: p.photo ?? undefined }} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      ))}

   

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
