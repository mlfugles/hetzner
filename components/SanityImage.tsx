import Image from "next/image";
import { urlFor } from "@/sanity/image";
import type { SanityImage as SanityImageType } from "@/sanity/types";

type Props = {
  image: SanityImageType | null | undefined;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

const emptyImageSrc = (w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`)}`;

/**
 * Renders a Sanity image through next/image (cropped to the hotspot the editor
 * set). Without an uploaded image it renders a blank placeholder at the same
 * aspect ratio so the layout holds and the slot is still clickable in the
 * Presentation tool.
 */
export function SanityImage({ image, width = 1600, height = 1200, sizes = "100vw", priority }: Props) {
  const asset = image?.asset;
  // Live patches in the Presentation tool deliver `{ _ref }` instead of the
  // GROQ-resolved `{ _id, url }`; urlFor handles both, so only check for one.
  const hasAsset = Boolean(asset && (asset._id || asset._ref));

  if (!hasAsset) {
    // eslint-disable-next-line @next/next/no-img-element -- inline data URI, nothing to optimise
    return <img src={emptyImageSrc(width, height)} alt="" width={width} height={height} />;
  }

  const lqip = asset?.metadata?.lqip ?? undefined;
  return (
    <Image
      src={urlFor(image!).width(width).height(height).url()}
      alt={image?.alt ?? ""}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      placeholder={lqip ? "blur" : "empty"}
      blurDataURL={lqip}
    />
  );
}
