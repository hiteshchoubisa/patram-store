import { siteConfig } from "../../config/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-neutral-600 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-medium mb-2">{siteConfig.name}</div>
          <p className="text-xs leading-relaxed">{siteConfig.description}</p>
        </div>
        <div>
          <div className="font-medium mb-2">Navigate</div>
            <ul className="space-y-1">
              <li><a href="/shop" className="hover:underline">Shop</a></li>
              <li><a href="/about" className="hover:underline">About</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
            </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Contact</div>
          <p className="text-xs">{siteConfig.company.address}</p>
          <p className="text-xs mt-1">{siteConfig.company.phone}</p>
        </div>
      </div>
      <div className="py-4 text-center text-[11px] text-neutral-500">
        © {new Date().getFullYear()} {siteConfig.company.name}. All rights reserved.
      </div>
    </footer>
  );
}