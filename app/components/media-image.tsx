import { optImageWidths } from "../generated/image-manifest";

const widths = [640, 1080, 1600];

export function optSrcset(src: string): string | null {
  const base = src.split("/").pop()?.replace(/\.jpg$/, "");
  if (!base || !optImageWidths[base]) return null;
  return widths
    .filter((w) => optImageWidths[base].includes(w))
    .map((w) => `/detail/opt/${base}.${w}.webp ${w}w`)
    .join(", ");
}

export default function MediaImage({
  src,
  alt,
  loading = "lazy",
  sizes = "100vw",
  className,
  fetchPriority,
}: {
  src: string;
  alt: string;
  loading?: "lazy" | "eager";
  sizes?: string;
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
}) {
  const srcset = optSrcset(src);
  return (
    <picture>
      {srcset ? <source type="image/webp" srcSet={srcset} sizes={sizes} /> : null}
      <img src={src} alt={alt} loading={loading} sizes={sizes} className={className} fetchPriority={fetchPriority} />
    </picture>
  );
}
