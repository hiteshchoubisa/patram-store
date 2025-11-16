"use client";
import { useCart } from "../cart/CartProvider";
import type { StoreProduct } from "../../lib/products";
import { useState } from "react";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    images?: string[];
    photo?: string; // optional
    category?: string; // e.g. "Incense"
    categorySlug?: string; // optional
  };
}

const rowToProduct = (row: any): StoreProduct => ({
  id: row.id,
  name: row.name,
  price: row.price,
  image: row.image_url,
  photo: row.photo,                 // Add the photo property
  category: row.category_name,      // map DB column
  categorySlug: row.category_slug,  // optional
});

export default function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Unified image selection (fix for products having only a featured image)
  const baseImage =
    product.image_url ||
    product.photo ||
    (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png");

  // Optional cache-buster (only if not placeholder)
  const versioned =
    baseImage && baseImage !== "/placeholder.png"
      ? (baseImage.includes("?") ? `${baseImage}&v=${product.id}` : `${baseImage}?v=${product.id}`)
      : baseImage;

  // Hover image (second image if available and different)
  const hoverImage =
    product.images && product.images.length > 1 ? product.images[1] : null;
  const hasHoverImage = !!hoverImage && hoverImage !== baseImage;

  return (
    <div className="group border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition">
     

      <a
        href={`/products/${(product as any).slug || product.id}`}
        className="block aspect-[1/1] bg-neutral-100 relative overflow-hidden"
      >
        <ProductImage product={product} className="rounded-md transition-all duration-500 group-hover:scale-105" />
      </a>

      <div className="product-dt">
        <a
          href={`/products/${(product as any).slug || product.id}`}
          className="pro-title"
        >
          {product.name}
        </a>

        {product.category && (
          <span className="pro-cat-title">
            {product.category}
          </span>
        )}
        {!product.category && (product as any).categorySlug && (
          <span className="pro-cat-title">
            {(product as any).categorySlug.replace(/-/g, " ")}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="price">₹ {product.price.toLocaleString("en-IN")}</span>
          {(product as any).mrp && (product as any).mrp > product.price && (
            <span className="sale-price">₹{(product as any).mrp.toLocaleString("en-IN")}</span>
          )}
        </div>

        <button
          onClick={() => {
            add(
              {
                id: product.id,
                name: product.name,
                price: product.price,
                qty: 1,
                photo: baseImage,
              },
              false
            );
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
          }}
          className={`mt-auto w-full rounded-md py-2 text-xs font-medium transition-all duration-200 ${
            addedToCart
              ? "bg-green-600 text-white"
              : "bg-neutral-900 text-white hover:bg-neutral-800 group-hover:bg-indigo-600 group-hover:shadow-md"
          }`}
        >
          {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}