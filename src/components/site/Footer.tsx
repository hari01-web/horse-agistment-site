export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/10 bg-brand-cream/60">
      <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-foreground/70">
        <p className="font-medium text-brand-dark">Strathyre Park</p>
        <p>Welcome Creek</p>
        <p className="mt-4">© {year} Strathyre Park. All rights reserved.</p>
      </div>
    </footer>
  );
}
