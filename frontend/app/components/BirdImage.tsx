import Image from "next/image";

type BirdImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  rounded?: boolean;
};

export default function BirdImage({ src, alt, width = 400, height = 250, rounded = true }: BirdImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        borderRadius: rounded ? "12px" : 0,
        objectFit: "cover",
      }}
    />
  );
}