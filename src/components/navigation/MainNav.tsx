const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" }
];

export default function MainNav() {
  return (
    <nav className="hidden md:flex gap-6">
      {links.map(l => (
        <a key={l.href} href={l.href} className="text-sm text-neutral-700 hover:text-indigo-600">
          {l.label}
        </a>
      ))}
    </nav>
  );
}