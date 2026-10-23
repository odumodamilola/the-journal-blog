"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/lib/cms/types";
import { variantsOf } from "@/lib/cms/types";
import { mediaUrl } from "@/lib/cms/content";
import { browserClient } from "@/lib/supabase/browser";
import type { Upload } from "tus-js-client";

const bytes = (n: number) =>
  n >= 1048576
    ? `${(n / 1048576).toFixed(2)} MB`
    : `${Math.round(n / 1024)} KB`;
async function jsonResponse(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}
export function MediaLibrary({
  onChoose,
  initialFile,
}: {
  onChoose?: (asset: MediaAsset) => void;
  initialFile?: File;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]),
    [page, setPage] = useState(0),
    [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [progress, setProgress] = useState(0),
    [selected, setSelected] = useState<MediaAsset | null>(null),
    [alt, setAlt] = useState(""),
    [caption, setCaption] = useState(""),
    [showTrash, setShowTrash] = useState(false);
  const upload = useRef<Upload | null>(null),
    mounted = useRef(true),
    initialStarted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void upload.current?.abort();
    };
  }, []);
  const load = useCallback(async (next = 0) => {
    try {
      const body = await jsonResponse(
        await fetch(`/api/admin/media?page=${next}`, { cache: "no-store" }),
      );
      setAssets((old) => (next ? [...old, ...body.assets] : body.assets));
      setPage(next);
      setMore(body.assets.length === 48);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load media.",
      );
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const processAsset = async (id: string) => {
    setMessage("Optimizing image. Large AVIF images can take a little longer…");
    const body = await jsonResponse(
      await fetch(`/api/admin/media/${id}/process`, { method: "POST" }),
    );
    return body.asset as MediaAsset;
  };
  const uploadFile = useCallback(
    async (file: File) => {
      if (busy) return;
      if (
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          file.type,
        ) ||
        file.size > 20 * 1048576
      ) {
        setMessage(
          "Choose a JPEG, PNG, WebP, or AVIF under 20 MB. Export HEIC/SVG/GIF to a supported still image first.",
        );
        return;
      }
      setBusy(true);
      setProgress(0);
      setMessage("Preparing secure upload…");
      try {
        const { asset } = await jsonResponse(
          await fetch("/api/admin/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              mime: file.type,
              bytes: file.size,
            }),
          }),
        );
        if (!mounted.current) return;
        const { data, error } = await browserClient().auth.getSession();
        if (error || !data.session)
          throw new Error("Sign in again before uploading.");
        if (!mounted.current) return;
        const { Upload: TusUpload } = await import("tus-js-client");
        await new Promise<void>((resolve, reject) => {
          const task = new TusUpload(file, {
            endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(".supabase.co", ".storage.supabase.co")}/storage/v1/upload/resumable`,
            headers: {
              authorization: `Bearer ${data.session!.access_token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            },
            metadata: {
              bucketName: "journal-media",
              objectName: `${asset.id}/original`,
              contentType: file.type,
              cacheControl: "3600",
            },
            chunkSize: 6 * 1024 * 1024,
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            retryDelays: [0, 1000, 3000, 5000],
            onError: () =>
              reject(
                new Error(
                  "Upload interrupted. Your existing library is safe; choose the file again to retry.",
                ),
              ),
            onProgress: (sent, total) => {
              if (mounted.current) {
                setProgress(Math.round((sent / total) * 100));
                setMessage("Uploading original securely…");
              }
            },
            onSuccess: () => resolve(),
          });
          upload.current = task;
          task.start();
        });
        upload.current = null;
        if (!mounted.current) return;
        const ready = await processAsset(asset.id);
        setSelected(ready);
        setAlt(ready.alt);
        setCaption(ready.caption);
        setMessage(
          "Image ready. Add a useful description before inserting it.",
        );
        await load();
      } catch (error) {
        if (mounted.current)
          setMessage(
            error instanceof Error
              ? error.message
              : "Upload failed. Please retry.",
          );
      } finally {
        if (mounted.current) setBusy(false);
      }
    },
    [busy, load],
  );
  useEffect(() => {
    if (initialFile && !initialStarted.current) {
      initialStarted.current = true;
      void uploadFile(initialFile);
    }
  }, [initialFile, uploadFile]);
  async function patch(asset: MediaAsset, body: object) {
    setBusy(true);
    try {
      const result = await jsonResponse(
        await fetch(`/api/admin/media/${asset.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      await load();
      return result.asset as MediaAsset;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update image.",
      );
      return null;
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border border-dashed bg-white p-6"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void uploadFile(file);
        }}
      >
        <label className="block text-sm font-medium">
          Upload an image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadFile(file);
              event.target.value = "";
            }}
            className="mt-3 block max-w-full text-sm file:mr-4 file:rounded-lg file:border file:px-3 file:py-2"
          />
        </label>
        <p className="mt-3 text-xs leading-relaxed text-secondary">
          Drop a still image here. Up to 20 MB / 60 megapixels. Original
          preserved privately; optimized AVIF + WebP, up to 3840 pixels on the
          longest edge. Smaller images are never enlarged. File savings vary by
          image.
        </p>
        {busy && (
          <progress
            aria-label="Upload progress"
            value={progress}
            max={100}
            className="mt-4 w-full"
          />
        )}
      </div>
      <p role="status" className="text-sm text-primary">
        {message}
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showTrash}
          onChange={(e) => setShowTrash(e.target.checked)}
        />
        Show trash (recoverable)
      </label>
      {selected && (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm font-semibold">{selected.filename}</p>
          <label className="mt-4 block text-sm">
            Image description
            <input
              value={alt}
              maxLength={300}
              onChange={(e) => setAlt(e.target.value)}
              className="field"
              placeholder="Describe the subject and purpose of this image"
            />
          </label>
          <label className="mt-4 block text-sm">
            Caption (optional)
            <input
              value={caption}
              maxLength={500}
              onChange={(e) => setCaption(e.target.value)}
              className="field"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              className="button-secondary"
              onClick={async () => {
                const saved = await patch(selected, { alt, caption });
                if (saved) {
                  setSelected(saved);
                  setMessage("Image details saved.");
                }
              }}
            >
              Save image details
            </button>
            {onChoose && (
              <button
                type="button"
                className="button-primary"
                disabled={
                  busy ||
                  !alt.trim() ||
                  selected.status !== "ready" ||
                  !!selected.deleted_at
                }
                onClick={async () => {
                  const saved = await patch(selected, { alt, caption });
                  if (saved) onChoose(saved);
                }}
              >
                Insert image
              </button>
            )}
            <button
              type="button"
              className="button-secondary"
              disabled={busy}
              onClick={async () => {
                if (await patch(selected, { trash: !selected.deleted_at }))
                  setSelected(null);
              }}
            >
              {selected.deleted_at ? "Restore image" : "Move to trash"}
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {assets
          .filter((asset) =>
            showTrash ? !!asset.deleted_at : !asset.deleted_at,
          )
          .map((asset) => {
            const master = variantsOf(asset.variants).find(
              (v) => v.name === "master.webp",
            );
            return (
              <div
                key={asset.id}
                className="overflow-hidden rounded-xl border bg-white"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  disabled={busy}
                  onClick={() => {
                    setSelected(asset);
                    setAlt(asset.alt);
                    setCaption(asset.caption);
                  }}
                >
                  {asset.status === "ready" && !asset.deleted_at ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl(
                          asset.id,
                          variantsOf(asset.variants).some(
                            (v) => v.name === "480.webp",
                          )
                            ? "480.webp"
                            : "master.webp",
                        )}
                        alt={asset.alt || asset.filename}
                        width={asset.width!}
                        height={asset.height!}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                      />
                    </>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-surface-container text-xs">
                      {asset.deleted_at ? "In trash" : asset.status}
                    </div>
                  )}
                  <span className="block truncate px-3 pt-3 text-xs font-medium">
                    {asset.filename}
                  </span>
                  <span className="block px-3 py-2 text-xs text-secondary">
                    {asset.width ? `${asset.width} × ${asset.height} · ` : ""}
                    {master
                      ? `${bytes(asset.original_bytes)} → ${bytes(master.bytes)}`
                      : bytes(asset.original_bytes)}
                  </span>
                </button>
                {!asset.deleted_at && asset.status !== "ready" && (
                  <button
                    type="button"
                    disabled={busy}
                    className="px-3 pb-3 text-xs text-primary underline"
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await processAsset(asset.id);
                        setMessage("Image ready.");
                        await load();
                      } catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : "Retry failed.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Retry processing
                  </button>
                )}
              </div>
            );
          })}
      </div>
      {!assets.length && (
        <p className="text-sm text-secondary">
          Your media library is empty. Upload your first image above.
        </p>
      )}
      {more && (
        <button
          type="button"
          className="button-secondary"
          onClick={() => void load(page + 1)}
          disabled={busy}
        >
          Load more images
        </button>
      )}
    </div>
  );
}
export function MediaPicker({
  onChoose,
  onClose,
  initialFile,
}: {
  onChoose: (asset: MediaAsset) => void;
  onClose: () => void;
  initialFile?: File;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.activeElement as HTMLElement | null;
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      className="cms-dialog"
      aria-labelledby="media-picker-title"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2
          id="media-picker-title"
          className="font-editorial-headline text-3xl"
        >
          Your image library
        </h2>
        <button type="button" onClick={onClose} className="button-secondary">
          Close library
        </button>
      </div>
      <MediaLibrary onChoose={onChoose} initialFile={initialFile} />
    </dialog>
  );
}
