"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// Helper function to get photo URL
function getPhotoUrl(photoUrl?: string | null) {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("http")) return photoUrl;
  const { data } = supabase.storage.from("product-photos").getPublicUrl(photoUrl);
  return data.publicUrl;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  photo_url?: string | null;
  images?: string[] | null;
  mrp?: number;
}

interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ open, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Clear products when drawer opens
  useEffect(() => {
    if (open) {
      setProducts([]);
      setQuery("");
      
      // Test database connection
      testDatabaseConnection();
    }
  }, [open]);

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log("🔧 Testing database connection...");
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, photo_url, images, mrp")
        .limit(5);
      
      if (error) {
        console.error("❌ Database connection test failed:");
        console.error("Error object:", error);
        console.error("Error message:", error?.message || "No message");
        console.error("Error details:", error?.details || "No details");
        console.error("Error hint:", error?.hint || "No hint");
        console.error("Error code:", error?.code || "No code");
        console.error("Full error:", JSON.stringify(error, null, 2));
      } else {
        console.log("✅ Database connection successful");
        console.log("📦 Sample products from database:", data);
        console.log("📊 Total products found:", data?.length);
      }
    } catch (error) {
      console.error("❌ Database connection test error:", error);
    }
  };

  // Only actual database products - no sample products

  // Search products - only from actual database
  const searchProducts = async (searchQuery: string) => {
    // If no search query, clear products
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      console.log("🔍 Searching for:", searchQuery);
      
      // Simple search approach - get all products and filter client-side
      const { data: allProducts, error } = await supabase
        .from("products")
        .select("id, name, price, category, photo_url, images, mrp")
        .limit(100);

      if (error) {
        console.error("❌ Database error:", error);
        console.error("Error message:", error?.message || "No message");
        console.error("Error details:", error?.details || "No details");
        console.error("Error hint:", error?.hint || "No hint");
        console.error("Error code:", error?.code || "No code");
        setProducts([]);
        return;
      }

      console.log("📦 Total products in database:", allProducts?.length);

      // Filter products that match search query
      const filteredProducts = (allProducts || []).filter((product: any) => {
        const searchTerm = searchQuery.toLowerCase();
        const productName = product.name.toLowerCase();
        
        // Check if any word from search query matches product name
        const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
        const productWords = productName.split(' ');
        
        // Check if any search word is found in product name
        return searchWords.some((searchWord: string) => 
          productWords.some((productWord: string) => 
            productWord.includes(searchWord) || searchWord.includes(productWord)
          )
        );
      });

      console.log("✅ Filtered results:", filteredProducts.length);
      console.log("📋 Found products:", filteredProducts.map((p: any) => p.name));
      
      setProducts(filteredProducts.slice(0, 15));
    } catch (error) {
      console.error("❌ Search catch error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Search input changed:", value);
    setQuery(value);
    
    // Search immediately when user types
    if (value.trim()) {
      searchProducts(value);
    } else {
      setProducts([]);
    }
  };

  // Create slug from product name
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    console.log("🖱️ Product clicked:", product);
    console.log("📝 Product name:", product.name);
    
    // Add to recent searches
    const newRecent = [product.name, ...recentSearches.filter(s => s !== product.name)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));

    // Create slug from product name and navigate
    const productSlug = createSlug(product.name);
    const productUrl = `/products/${productSlug}`;
    console.log("🔗 Navigating to:", productUrl);
    router.push(productUrl);
    onClose();
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    searchProducts(searchTerm);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div className="search-overlay">
          <div className="flex-1" onClick={onClose} />
          <div className="search-drawer">
            {/* Search Header */}
            <div className="search-header">
              <div className="search-input-container">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="search-input"
                  autoFocus
                />
                <button onClick={onClose} className="search-close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Content */}
            <div className="search-content">
              {loading ? (
                <div className="search-loading">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Searching products...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="search-results">
                  {products.map((product) => {
                    const primaryImage =
                      (product.images && product.images.length > 0
                        ? getPhotoUrl(product.images[0])
                        : getPhotoUrl(product.photo_url)) || null;

                    return (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="search-result-item group"
                    >
                      <div className="search-result-image">
                        {primaryImage ? (
                          <img 
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg ${primaryImage ? 'hidden' : ''}`}>
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="search-result-details flex-1">
                        <div className="search-result-name group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </div>
                        {product.category && (
                          <div className="text-xs text-gray-500 mb-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              {product.category}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="search-result-price font-semibold">
                            ₹{product.price.toLocaleString("en-IN")}
                          </div>
                          {product.mrp && product.mrp > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )})}
                </div>
              ) : query.trim() ? (
                <div className="search-empty">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709" />
                  </svg>
                  <p className="text-gray-500">No products found</p>
                  <p className="text-sm text-gray-400">Try different keywords</p>
                </div>
              ) : (
                <div className="search-empty">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500">Start typing to search products</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
