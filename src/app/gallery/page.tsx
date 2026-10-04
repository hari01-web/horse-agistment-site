import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Gallery | Strathyre Park",
};

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("id, url, caption")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        Gallery
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
        Around Strathyre Park
      </h1>

      {!photos || photos.length === 0 ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/80">
          Photos of the property, paddocks and horses are coming soon.
        </p>
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? "Strathyre Park"}
                loading="lazy"
                className="aspect-square w-full rounded-2xl object-cover"
              />
              {photo.caption && (
                <figcaption className="mt-2 text-sm text-foreground/70">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
