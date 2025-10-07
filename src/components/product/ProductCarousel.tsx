"use client";
import type { StoreProduct } from "../../lib/products";
import ProductCard from "./ProductCard";
import { useRef, useState, useEffect } from "react";

export default function ProductCarousel({ products }: { products: StoreProduct[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  
  function scroll(dx: number) {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  }

  // Calculate dots based on visible items
  const itemsPerView = 4; // Number of items visible at once
  const totalDots = Math.ceil(products.length / itemsPerView);

  // Update current index when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const scrollLeft = ref.current.scrollLeft;
        const itemWidth = 272; // w-64 + gap-6 = 256 + 24 = 280, but using 272 for better calculation
        const newIndex = Math.round(scrollLeft / itemWidth);
        setCurrentIndex(Math.min(newIndex, totalDots - 1));
      }
    };

    const scrollContainer = ref.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [totalDots]);

  // Go to specific slide
  const goToSlide = (index: number) => {
    if (ref.current) {
      const itemWidth = 272;
      ref.current.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative">
      {/* Navigation arrows positioned on the right side */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button 
          type="button" 
          onClick={() => scroll(-272)} 
          className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          aria-label="Previous products"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          type="button" 
          onClick={() => scroll(272)} 
          className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          aria-label="Next products"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Carousel container with hidden scrollbar */}
      <div 
        ref={ref} 
        className="flex gap-6 overflow-x-auto snap-x scrollbar-hide"
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {products.map(p => (
          <div key={p.id} className="snap-start w-64 flex-shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Dots/Indicators */}
      {totalDots > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalDots }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-indigo-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}