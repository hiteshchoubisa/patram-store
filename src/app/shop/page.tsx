import { getLatestProducts } from "../../lib/products";
import ProductCard from "../../components/product/ProductCard";
import InnerBanner from "@/components/layout/InnerBanner";

export const revalidate = 300;

type SearchParams = { search?: string; q?: string; category?: string };

export default async function ShopPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const term = (sp?.search || sp?.q || "").trim().toLowerCase();
  const category = sp?.category || "";

  const products = await getLatestProducts(200);
  const filtered = products.filter(p => {
    const matchesSearch = !term || 
      p.name.toLowerCase().includes(term) ||
      (p.category || "").toLowerCase().includes(term);
    
    const matchesCategory = !category || 
      (p.category || "").toLowerCase().includes(category.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const empty = filtered.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <InnerBanner
        title="Shop Patram"
        subtitle="Browse our full range of ayurvedic and aromatic essentials."
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-6">Shop</h1>

      {/* Category Filter */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <a 
            href="/shop" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </a>
          <a 
            href="/shop?category=dhoop" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === 'dhoop' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dhoop
          </a>
          <a 
            href="/shop?category=incense" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === 'incense' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Incense Sticks
          </a>
          <a 
            href="/shop?category=attar" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === 'attar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Attar
          </a>
          <a 
            href="/shop?category=others" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === 'attar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Others
          </a>
        </div>
      </div>


      {empty && (
        <div className="text-sm text-neutral-600 space-y-3 mb-8">
          <p>No products found.</p>
          <details className="border rounded p-3 bg-neutral-50">
            <summary className="cursor-pointer text-neutral-800 font-medium text-xs">Troubleshoot</summary>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-xs">
              <li>Verify env keys (URL & anon).</li>
              <li>Ensure products table has rows.</li>
              <li>RLS select policy for anon present.</li>
            </ul>
          </details>
        </div>
      )}

        {!empty && (
          <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={{ ...p, images: p.images || undefined, photo: p.photo || undefined }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}