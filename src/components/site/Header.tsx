import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-navy-on-white.jpg"
            alt="Strathyre Park"
            width={160}
            height={200}
            className="h-14 w-auto"
            priority
          />
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 transition-colors hover:text-brand-dark"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-cream"
        >
          Owner Login
        </Link>
      </div>
    </header>
  );
}
