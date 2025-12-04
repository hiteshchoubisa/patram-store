'use client';

import React from 'react';

type InnerBannerProps = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
};

export default function InnerBanner({ title, subtitle, align = 'left' }: InnerBannerProps) {
  const alignmentClasses =
    align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <section className="bg-banner  inner-banner-section flex items-center">
      <div
        className={`max-w-6xl mx-auto px-6 w-full flex flex-col justify-center ${alignmentClasses}`}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[#004B1B]">{title}</h1>
        {subtitle && (
          <p className="text-base md:text-lg text-black/80 max-w-3xl mt-2">{subtitle}</p>
        )}
      </div>
    </section>
  );
}


