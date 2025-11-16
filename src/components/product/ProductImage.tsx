"use client";
import { useState } from "react";

interface ProductImageProps {
  product: any;
  className?: string;
  alt?: string;
}

function resolveImage(product: any): string {
  // Ordered fallbacks
  const candidates: (string | undefined)[] = [
    product.image_url,
    product.photo,
    product.image,                  // legacy
    product.featured_image,         // optional
    product.images && product.images[0],
  ];
  const found = candidates.find(src => typeof src === "string" && !!src.trim());
  return found || "/placeholder.png";
}

export default function ProductImage({ product, className = "", alt }: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const base = resolveImage(product);
  const src = errored ? "/placeholder.png" : base;

  return (
    <img
      src={src}
      alt={alt || product.name || "Product"}
      loading="lazy"
      className={`w-full h-full object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
}