import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/10 bg-brand-dark">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-10 text-sm text-white/70">
        <Image
          src="/logo-white-on-navy.jpg"
          alt="Strathyre Park"
          width={80}
          height={100}
          className="h-16 w-auto"
        />
        <div>
          <p className="font-medium text-white">Strathyre Park</p>
          <p>Welcome Creek</p>
          <p className="mt-4">© {year} Strathyre Park. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
