import { getFeaturedProducts, getLatestProducts } from "../lib/products";
import ProductCarousel from "../components/product/ProductCarousel";
import ProductCard from "../components/product/ProductCard";
import JsonLd from "../components/seo/JsonLd";
import Image from "next/image";
import type { Metadata } from "next";
import { siteConfig } from "../config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Buy Ayurvedic Dhoop, Incense & Attar Online | Patram Store",
  description:
    "Shop handcrafted Ayurvedic dhoop sticks, incense (agarbatti), attar oils and pooja essentials. Natural ingredients, safe smoke, fast delivery and custom aroma development.",
  keywords: [
    "buy dhoop online",
    "ayurvedic dhoop sticks",
    "natural incense sticks",
    "agarbatti online",
    "herbal incense",
    "attar oil",
    "pooja essentials",
    "handmade incense India",
    "low smoke incense",
    "patram store",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Buy Ayurvedic Dhoop, Incense & Attar Online | Patram Store",
    description:
      "Handmade herbal dhoop, incense and attar oils with custom aroma development and fast delivery across India.",
    url: siteConfig.baseUrl,
    images: [{ url: siteConfig.ogImage }],
  },
};

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

  const customizationHighlights = [
    { label: "Blend styles", value: "30+" },
    { label: "Lead time", value: "10 days" },
    { label: "MOQ", value: "50 boxes" }
  ];

  const customizationSteps = [
    {
      title: "Share the vibe",
      description: "Tell us the mood, ritual or purpose your incense should support."
    },
    {
      title: "Co-create the blend",
      description: "Pick base ingredients, oil strength and stick format with our perfumers."
    },
    {
      title: "Finalize packaging",
      description: "Choose eco sleeves, gifting tins or private-label boxes to match your brand."
    }
  ];

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

    {/* Customize Incense Section */}
    <section className="section-block bg-[#fff8ef]">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#f45a29] mb-3">
                Customize Incense
              </p>
              <h2 className="heading2 text-3xl lg:text-4xl">
                Co-create incense blends that match your ritual, event or brand.
              </h2>
              <p className="mt-4 text-base text-gray-700">
                From herbal dhoop to luxury attar-infused sticks, Patram's lab can tailor aroma, burn time and packaging so you launch something truly personal.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {customizationHighlights.map(item => (
                  <div key={item.label} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-orange-50 text-center">
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                
                <a
                  href="https://wa.me/918107514654?text=Hi%20Patram%2C%20I%20want%20to%20customize%20incense"
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-gray-900 text-white"
                >
                 Talk to our lab
                </a>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How customization works</h3>
              <div className="space-y-5">
                {customizationSteps.map((step, idx) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#f45a29]/10 text-[#f45a29] flex items-center justify-center font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Need something rush? Share your target fragrance notes and delivery date—our team replies within 24 hours.
              </div>
            </div>
          </div>
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
