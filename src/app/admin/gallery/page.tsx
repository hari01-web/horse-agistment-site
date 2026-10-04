import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  deleteGalleryPhoto,
  updateGalleryCaption,
  uploadGalleryPhotos,
} from "@/lib/actions/gallery";
import PhotoInput from "@/components/shared/PhotoInput";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("id, path, url, caption")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-dark">Gallery</h1>
        <Link href="/gallery" className="text-sm font-medium text-brand-dark underline">
          View public Gallery page
        </Link>
      </div>
      <p className="mt-1 text-sm text-foreground/60">
        Photos here appear on the public Gallery page, newest first.
      </p>

      <form
        action={uploadGalleryPhotos}
        className="mt-6 flex max-w-lg flex-col gap-3 rounded-xl border border-black/10 bg-white/60 p-4"
      >
        <p className="text-sm font-medium text-brand-dark">Add photos</p>
        <PhotoInput name="photos" multiple />
        <input
          name="caption"
          placeholder="Caption (optional, applies to all photos chosen)"
          className="rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Upload
        </button>
        <p className="text-xs text-foreground/50">Tip: upload up to about 10 photos at a time.</p>
      </form>

      {!photos || photos.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">No photos yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-xl border border-black/10 bg-white/70 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? ""}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <form
                action={updateGalleryCaption.bind(null, photo.id)}
                className="mt-2 flex gap-2"
              >
                <input
                  name="caption"
                  defaultValue={photo.caption ?? ""}
                  placeholder="Caption"
                  className="min-w-0 flex-1 rounded-lg border border-black/15 px-2 py-1 text-sm outline-none focus:border-brand"
                />
                <button type="submit" className="cursor-pointer text-sm font-medium text-brand-dark underline">
                  Save
                </button>
              </form>
              <form
                action={deleteGalleryPhoto.bind(null, photo.id, photo.path)}
                className="mt-2"
              >
                <button type="submit" className="cursor-pointer text-xs text-red-600 underline">
                  Delete photo
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
