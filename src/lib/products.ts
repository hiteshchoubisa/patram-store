import { createClient } from "@supabase/supabase-js";
import { createProductSlug } from "./slug";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRODUCT_BUCKET = process.env.NEXT_PUBLIC_PRODUCT_BUCKET || "product-photos";

function photoUrl(key?: string | null) {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;      // added
  categorySlug?: string;  // optional
  mrp?: number | null;
  description?: string | null;
  photo: string | null;
  images?: string[] | null;
  // slug optional (not in table now); use id for routes
  slug?: string | null;
};

function mapRow(r: any): StoreProduct {
  // Helper function to get image URLs from the images array
  const getImageUrls = (images: any[] | null): string[] => {
    if (!images || !Array.isArray(images)) return [];
    return images.map(img => photoUrl(img)).filter(Boolean) as string[];
  };

  return {
    id: r.id,
    name: r.name,
    price: Number(r.price),
    mrp: r.mrp != null ? Number(r.mrp) : null,
    category: r.category,
    description: r.description,
    photo: photoUrl(r.photo_url),
    images: getImageUrls(r.images),
    slug: r.slug ?? createProductSlug(r.name)
  };
}

export async function getFeaturedProducts(limit = 8) {
  // Since is_featured and updated_at columns don't exist, return latest products by created_at
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,mrp,category,description,photo_url,images,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Supabase getFeaturedProducts error:", error.message);
    return [];
  }
  return (data || []).map(mapRow);
}

export async function getLatestProducts(limit = 12) {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,mrp,category,description,photo_url,images,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Supabase getLatestProducts error:", error.message);
    return [];
  }
  return (data || []).map(mapRow);
}

// Currently treat param as id (since slug column absent)
export async function getProductById(param: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,mrp,category,description,photo_url,images")
    .eq("id", param)
    .maybeSingle();
  if (error) {
    console.error("Supabase getProductById error:", error.message);
    return null;
  }
  return data ? mapRow(data) : null;
}

// Get product by slug (name-based)
export async function getProductBySlug(slug: string) {
  // Get all products and find the one with matching slug
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,mrp,category,description,photo_url,images");
  
  if (error) {
    console.error("Supabase getProductBySlug error:", error.message);
    return null;
  }
  
  if (!data) return null;
  
  // Find product with matching slug
  for (const row of data) {
    const product = mapRow(row);
    if (product.slug === slug) {
      return product;
    }
  }
  
  return null;
}

// For sitemap (slugs)
export async function getAllProductSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name");
  
  if (error) {
    console.error("Supabase getAllProductSlugs error:", error.message);
    return [];
  }
  
  return (data || []).map(r => createProductSlug(r.name));
}

// For sitemap (ids) - keeping for backward compatibility
export async function getAllProductIds(): Promise<string[]> {
  const { data, error } = await supabase.from("products").select("id");
  if (error) {
    console.error("Supabase getAllProductIds error:", error.message);
    return [];
  }
  return (data || []).map(r => r.id);
}