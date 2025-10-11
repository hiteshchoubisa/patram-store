"use client";
import { useCart } from "../cart/CartProvider";
import type { StoreProduct } from "../../lib/products";
import { useState } from "react";

export default function ProductCard({ product }: { product: StoreProduct }) {
  const { add } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Get the second image from the images array, fallback to first image or main photo
  const getHoverImage = () => {
    if (product.images && product.images.length > 1) {
      return product.images[1]; // Second image
    } else if (product.images && product.images.length === 1) {
      return product.images[0]; // First image if only one available
    }
    return product.photo; // Fallback to main photo
  };

  const hoverImage = getHoverImage();
  const hasHoverImage = hoverImage && hoverImage !== product.photo;

  return (
    <div className="border rounded-lg overflow-hidden bg-white flex flex-col group">
      <a 
        href={`/products/${product.slug || product.id}`} 
        className="block aspect-[4/3] bg-neutral-100 relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main image */}
        {product.photo && (
          <img 
            src={product.photo} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${
              isHovered && hasHoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
        )}
        
        {/* Hover image */}
        {hasHoverImage && (
          <img 
            src={hoverImage} 
            alt={`${product.name} - Alternative view`} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        )}
        
        {/* Hover overlay effect */}
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isHovered ? 'opacity-10' : 'opacity-0'
        }`} />
      </a>
      
      <div className="p-3 flex-1 flex flex-col">
        <a href={`/products/${product.slug || product.id}`} className="font-medium text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
          {product.name}
        </a>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-indigo-600 font-semibold text-sm">₹{product.price.toLocaleString("en-IN")}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[11px] line-through text-neutral-500">₹{product.mrp.toLocaleString("en-IN")}</span>
          )}
        </div>
        <button
          onClick={() => {
            add({ id: product.id, name: product.name, price: product.price, qty: 1, photo: product.photo }, false);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000); // Reset after 2 seconds
          }}
          className={`mt-auto w-full rounded-md py-2 text-xs font-medium transition-all duration-200 ${
            addedToCart 
              ? 'bg-green-600 text-white' 
              : 'bg-neutral-900 text-white hover:bg-neutral-800 group-hover:bg-indigo-600 group-hover:shadow-md'
          }`}
        >
          {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}