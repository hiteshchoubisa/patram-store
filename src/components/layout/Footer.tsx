import { siteConfig } from "../../config/site";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#4b2b12] text-white footer">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-10 md:grid-cols-4 text-sm">
        {/* Brand / About */}
        <div>
          <div className="text-base font-semibold mb-3">
            {siteConfig.company.name}
          </div>
          <p className="text-xs leading-relaxed text-white">
            {siteConfig.description}
          </p>
        </div>

        {/* Shop by category */}
        <div>
          <div className="text-sm font-semibold mb-3 uppercase tracking-wide">
            Products
          </div>
          <ul className="space-y-1.5 text-xs">
            <li>
              <a href="/shop?category=dhoop-sticks" className="hover:text-orange-200 transition-colors">
                Dhoop Sticks
              </a>
            </li>
            <li>
              <a href="/shop?category=incense-sticks" className="hover:text-orange-200 transition-colors">
                Incense Sticks
              </a>
            </li>
            <li>
              <a href="/shop?category=attar" className="hover:text-orange-200 transition-colors">
                Attar & Natural Perfumes
              </a>
            </li>
            <li>
              <a href="/shop?category=others" className="hover:text-orange-200 transition-colors">
                Pooja & Other Essentials
              </a>
            </li>
          </ul>
        </div>

        {/* Navigate */}
        <div>
          <div className="text-sm font-semibold mb-3 uppercase tracking-wide">
            Navigate
          </div>
          <ul className="space-y-1.5 text-xs">
            <li>
              <a href="/shop" className="hover:text-orange-200 transition-colors">
                Shop
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-orange-200 transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-orange-200 transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="/track-order" className="hover:text-orange-200 transition-colors">
                Track Order
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <div className="text-sm font-semibold mb-3 uppercase tracking-wide">
            Contact
          </div>
          <p className="text-xs text-white">
            {siteConfig.company.address}
          </p>
          <p className="text-xs mt-2 text-figure">
            <a
              href={`https://wa.me/918107514654`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-200 transition-colors"
            >
              WhatsApp: {siteConfig.company.phone}
            </a>
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="text-gray-100/80">Follow:</span>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-200 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-200 transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 text-[11px] text-gray-100/70 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {siteConfig.company.name}. All rights reserved.
          </span>
          <span>Handmade Ayurvedic incense & attar crafted in Udaipur, Rajasthan.</span>
        </div>
      </div>
    </footer>
  );
}