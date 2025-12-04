import { supabase } from "../../../lib/supabaseClient";
import ProductDetail from "../../../components/product/ProductDetail";
import InnerBanner from "@/components/layout/InnerBanner";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  // For now, return empty array - we'll generate pages dynamically
  return [];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Check if the slug is actually a UUID (ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let product: any = null;
    let error: any = null;
    
    if (isUUID) {
      // If it's a UUID, search by ID
      const result = await supabase
        .from("products")
        .select("id, name, price, mrp, category, description, photo_url, images")
        .eq("id", slug)
        .single();
      product = result.data;
      error = result.error;
    } else {
      // If it's a slug, search by name
      const result = await supabase
        .from("products")
        .select("id, name, price, mrp, category, description, photo_url, images")
        .ilike("name", `%${slug.replace(/-/g, ' ')}%`)
        .single();
      product = result.data;
      error = result.error;
    }

    // If no exact match, try getting all products and filtering client-side
    if (error || !product) {
      console.log("🔄 Trying client-side search for metadata...");
      const { data: allProducts, error: allError } = await supabase
        .from("products")
        .select("id, name, price, mrp, category, description, photo_url, images")
        .limit(100);

      if (!allError && allProducts) {
        // Find product by matching words
        const searchWords = (isUUID ? slug : slug.replace(/-/g, ' ')).toLowerCase().split(' ').filter(word => word.length > 0);
        const foundProduct = allProducts?.find((p: any) => {
          if (isUUID) {
            return p.id === slug;
          } else {
            const productWords = p.name.toLowerCase().split(' ');
            return searchWords.every((searchWord: string) => 
              productWords.some((productWord: string) => 
                productWord.includes(searchWord) || searchWord.includes(productWord)
              )
            );
          }
        });
        
        if (foundProduct) {
          console.log("✅ Found product via client-side search for metadata:", foundProduct);
          product = foundProduct;
          error = null;
        }
      }
    }

    if (error || !product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found."
      };
    }

    return {
      title: product.name,
      description: `Shop ${product.name} at Patram Store`,
      openGraph: {
        title: product.name,
        description: `Shop ${product.name} at Patram Store`,
        type: "website",
        images: [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: `Shop ${product.name} at Patram Store`,
        images: [],
      }
    };
  } catch (error) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found."
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  console.log("🔍 Product page - looking for slug:", slug);
  
  try {
    // Check if the slug is actually a UUID (ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    // Define searchTerm for use in fallback search
    const searchTerm = isUUID ? slug : slug.replace(/-/g, ' ');
    
    let product: any = null;
    let error: any = null;
    
    if (isUUID) {
      // If it's a UUID, search by ID
      console.log("🔍 Searching by ID:", slug);
      const result = await supabase
        .from("products")
        .select("id, name, price, mrp, category, description, photo_url, images")
        .eq("id", slug)
        .single();
      product = result.data;
      error = result.error;
    } else {
      // If it's a slug, search by name
      console.log("🔍 Searching for product with term:", searchTerm);
      
      const result = await supabase
        .from("products")
        .select("id, name, price, mrp, category, description, photo_url, images")
        .ilike("name", `%${searchTerm}%`)
        .single();
      product = result.data;
      error = result.error;
    }

    console.log("📦 Exact match result:", { product, error });

    // If no exact match, try getting all products and filtering client-side
    if (error || !product) {
      console.log("🔄 Trying client-side search...");
      const { data: allProducts, error: allError } = await supabase
        .from("products")
        .select("id, name, price, mrp, category, description, photo_url, images")
        .limit(100);

      if (allError) {
        console.error("❌ All products query error:", allError);
        error = allError;
      } else {
        // Find product by matching words
        const foundProduct = allProducts?.find((p: any) => {
          if (isUUID) {
            return p.id === slug;
          } else {
            const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
            const productWords = p.name.toLowerCase().split(' ');
            return searchWords.every((searchWord: string) => 
              productWords.some((productWord: string) => 
                productWord.includes(searchWord) || searchWord.includes(productWord)
              )
            );
          }
        });
        
        if (foundProduct) {
          console.log("✅ Found product via client-side search:", foundProduct);
          product = foundProduct;
          error = null;
        } else {
          console.log("❌ No product found via client-side search");
          product = null;
          error = null;
        }
      }
    }

    console.log("📦 Final product query result:", { product, error });

    if (error) {
      console.error("❌ Product query error:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      notFound();
    }

    if (!product) {
      console.log("❌ No product found with slug:", slug);
      notFound();
    }

    console.log("✅ Product found:", product);

    // Helper function to get photo URL
    const getPhotoUrl = (photoUrl: string | null) => {
      if (!photoUrl) return null;
      if (photoUrl.startsWith("http")) return photoUrl;
      const { data } = supabase.storage.from("product-photos").getPublicUrl(photoUrl);
      return data.publicUrl;
    };

    // Helper function to get image URLs from the images array
    const getImageUrls = (images: any[] | null): string[] => {
      if (!images || !Array.isArray(images)) return [];
      return images.map(img => {
        if (img.startsWith("http")) return img;
        const { data } = supabase.storage.from("product-photos").getPublicUrl(img);
        return data.publicUrl;
      }).filter(Boolean);
    };

    // Debug product data
    console.log("Product data for detail page:", {
      id: product.id,
      name: product.name,
      photo_url: product.photo_url,
      images: product.images
    });

    // Convert to the format expected by ProductDetail
    const productData = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      photo: getPhotoUrl(product.photo_url),
      price: product.price || 0,
      mrp: product.mrp || null,
      category: product.category || null,
      images: getImageUrls(product.images),
      slug: slug
    };

    console.log("Final product data:", {
      id: productData.id,
      name: productData.name,
      photo: productData.photo,
      images: productData.images
    });

    // Fetch related products in same category (excluding current), then shuffle
    let relatedProducts: any[] = [];
    if (product.category) {
      const { data: related, error: relatedError } = await supabase
        .from("products")
        .select("id, name, price, mrp, category, description, photo_url, images")
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(20);

      if (!relatedError && related && related.length > 0) {
        const mapped = related.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          photo: getPhotoUrl(p.photo_url),
          price: p.price || 0,
          mrp: p.mrp || null,
          category: p.category || null,
          images: getImageUrls(p.images),
          slug: p.id,
        }));

        // Simple shuffle for random order
        relatedProducts = mapped
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
      }
    }

    return (
      <div className="min-h-screen bg-white">
        <InnerBanner
          title="Shop Patram"
          subtitle="Browse our full range of ayurvedic and aromatic essentials."
        />
        <ProductDetail product={productData} relatedProducts={relatedProducts} />
      </div>
    );
  } catch (error) {
    console.error("❌ Product page error:", error);
    notFound();
  }
}
