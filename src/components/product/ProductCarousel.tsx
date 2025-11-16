"use client";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Props = {
  products: any[];
  limit?: number;
  className?: string;
};

function Arrow(props: any) {
  const { className, onClick, direction } = props;
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous" : "Next"}
      onClick={onClick}
      className={`slick-custom-arrow ${direction} ${className || ""}`}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "prev" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}

export default function ProductCarousel({ products, limit = 12, className }: Props) {
  const items = products.slice(0, limit);

  // Prevent initial 4-slide flash on mobile
  const [ready, setReady] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(2); // default mobile

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) setSlidesToShow(2);
      else if (w < 1024) setSlidesToShow(3);
      else setSlidesToShow(4);
    };
    calc();
    setReady(true);
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const settings = {
    arrows: true,
    prevArrow: <Arrow direction="prev" />,
    nextArrow: <Arrow direction="next" />,
    dots: false,
    infinite: false,
    autoplay: false,
    speed: 400,
    slidesToShow,
    slidesToScroll: 1,
  };

  // While not ready (SSR + first paint), render static grid (mobile size)
  if (!ready) {
    return (
      <div className={className || "category-carousel"}>
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.slice(0, 2).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Slider key={slidesToShow} {...settings} className={className || "category-carousel"}>
      {items.map(p => (
        <div key={p.id} className="px-2">
          <ProductCard product={p} />
        </div>
      ))}
    </Slider>
  );
}