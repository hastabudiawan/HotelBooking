import Image from "next/image";
import { isRemoteImage } from "@/lib/image-url";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
};

export function RoomImage({ src, alt, sizes, priority }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // Alamat dari situs lain tidak perlu didaftarkan di next.config, tetapi tidak dikecilkan.
      unoptimized={isRemoteImage(src)}
      className="object-cover"
    />
  );
}