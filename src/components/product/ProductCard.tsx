"use client";
import { useCart } from "../cart/CartProvider";
import type { StoreProduct } from "../../lib/products";

export default function ProductCard({ product }: { product: StoreProduct }) {
  const { add } = useCart();
  return (
    <div className="border rounded-lg overflow-hidden bg-white flex flex-col">
      <a href={`/products/${product.slug || product.id}`} className="block aspect-[4/3] bg-neutral-100">
        {product.photo && <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />}
      </a>
      <div className="p-3 flex-1 flex flex-col">
        <a href={`/products/${product.slug || product.id}`} className="font-medium text-sm line-clamp-2">{product.name}</a>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-indigo-600 font-semibold text-sm">₹{product.price.toLocaleString("en-IN")}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[11px] line-through text-neutral-500">₹{product.mrp.toLocaleString("en-IN")}</span>
          )}
        </div>
        <button
          onClick={() => add({ id: product.id, name: product.name, price: product.price, qty: 1, photo: product.photo })}
          className="mt-auto w-full bg-neutral-900 text-white rounded-md py-2 text-xs font-medium hover:bg-neutral-800"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}