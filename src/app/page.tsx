import { getFeaturedProducts, getLatestProducts } from "../lib/products";
import ProductCarousel from "../components/product/ProductCarousel";
import ProductCard from "../components/product/ProductCard";
import JsonLd from "../components/seo/JsonLd";
import Image from "next/image";
import type { Metadata } from "next";
import { siteConfig } from "../config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Buy Aushadhi  Dhoop, Incense & Attar Online | Patram Store",
  description:
    "Shop handcrafted Aushadhi dhoop sticks, incense (agarbatti), attar oils and pooja essentials. Natural ingredients, safe smoke, fast delivery and custom aroma development.",
  keywords: [
    "buy dhoop online",
    "Aushadhi dhoop sticks",
    "natural incense sticks",
    "Aushadhi agarbatti online",
    "herbal incense",
    "attar oil",
    "pooja essentials",
    "handmade incense India",
    "low smoke incense",
    "patram store",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Buy Aushadhi Dhoop, Incense & Attar Online | Patram Store",
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
            <h1 className="heading1">Crafted from Nature,<br/><strong>Infused with Aroma
            </strong></h1>
            <p className="mt-4 max-w-xl text-lg">Pure ingredients like <strong>Cow Dung, Temple Flowers, Clove, Kapoor & Neem</strong> blended into divine fragrance for a peaceful spiritual experience.</p>
            <div className="mt-8 flex gap-4">
              <a href="/shop" className="btn btn-primary">Shop Now</a>
            </div>
          </div>
          <Image
                    src="/banner-patram.jpg"
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
       
              <i className="icon-cat"><Image
                    src="/icon-dhoop.svg"
                    alt="Patram Dhoop"
                    width={51}
                    height={51}
                    priority 
                  /></i>
                <h3 className="cat-title">Dhoop  </h3>
                <p className="text-sm text-gray-500">Bambooless Sticks</p>
            
        
          </a>
          
          <a href="/shop?category=incense" className="category-card">
          
              <i className="icon-cat"><Image
                    src="/icon-incense.svg"
                    alt="Patram Incense Sticks"
                    width={51}
                    height={51}
                    priority 
                  /></i>
                <h3 className="cat-title">Incense  </h3>
                <p className="text-sm text-gray-500">Bamboo Sticks</p>
               
           
          </a>
          
          <a href="/shop?category=attar" className="category-card">
          
              <i className="icon-cat"><Image
                    src="/icon-attar.svg"
                    alt="Patram Attar"
                    width={51}
                    height={51}
                    priority 
                  /></i>
                <h3 className="cat-title">Attar</h3>
                <p className="text-sm text-gray-500">Natural Perfumes</p>
              
       
          </a>
          
          <a href="/shop?category=others" className="category-card">
         
               
              <i className="icon-cat"><Image
                    src="/icon-other.svg"
                    alt="Patram Other Essential"
                    width={51}
                    height={51}
                    priority 
                  /></i>
                <h3 className="cat-title">Others</h3>
                <p className="text-sm text-gray-500 ">Essential Products</p>
            
           
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
    <section className="section-block bg-[#D6EED4]">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="bg-white  ">
            <Image
                    src="/patram-customize-store.jpg"
                    alt="Patram Customize Incense and Dhoop"
                    width={670}
                    height={540}
                    priority 
                  />
            </div>
            <div>
            
              <h2 className="heading1 text-3xl lg:text-4xl">
              Customized & Crafted Incense, <br/>as on Demand
              </h2>
              <p className="mt-4 text-base text-gray-700">
              At Patram, we understand that every customer is unique — and so is their fragrance preference. That’s why we offer fully customized incense and dhoop solutions designed especially for our valuable customers.
              </p>
       
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
           
          </div>
        </div>
      </section>

      <section className="section-block bg-[#fff8ef]">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
            
              <h2 className="heading1 text-3xl lg:text-4xl">
              Patram Membership Plan’s <br/>5 Benefits
              </h2>
              <p className="mt-4 text-base text-gray-700">
             Experience fragrance like never before with our exclusive membership program, designed especially for our loyal and valuable customers.
              </p>
       
       <ul className="icon-lists">
        <li><i><Image src="/icon-free.svg" alt="Free Samples"  width={26} height={26}/></i> Get <strong>Free Samples</strong> of All Products</li>
        <li><i><Image src="/icon-discount.svg" alt="Extra Discount "  width={24} height={24}/></i>Enjoy Up to <strong>15% Discount Extra Discount</strong>  on Every Purchase</li>
        <li><i><Image src="/icon-custom.svg" alt="Customize Incense"  width={24} height={24}/></i><strong>Customize Incense</strong> as per Requirements</li>
        <li><i><Image src="/icon-save.svg" alt="Cost-Saving"  width={24} height={24}/></i>On-Demand <strong>Cost-Saving</strong>  Benefits </li>
        <li><i><Image src="/icon-gift.svg" alt="Free Gifts"  width={24} height={24}/></i>Receive Exclusive <strong>Festive Offers & Surprise Gifts</strong> <small>T&C apply</small></li>
       </ul>
               
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
