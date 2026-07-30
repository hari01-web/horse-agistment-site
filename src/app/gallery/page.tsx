export const metadata = {
  title: "Gallery | Strathyre Park",
};

const PLACEHOLDER_COUNT = 6;

export default function GalleryPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        Gallery
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
        Around Strathyre Park
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/80">
        Real photos of the property, paddocks, and horses are coming soon.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-brand-dark/20 bg-brand-cream/40 text-sm font-medium text-brand-dark/40"
          >
            Photo coming soon
          </div>
        ))}
      </div>
    </div>
  );
}
