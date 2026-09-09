"use client";

type BirdImageProps = {
  alt: string;
  width?: number;
  height?: number;
  rounded?: boolean;
};

export default function BirdImage({ alt, width = 400, height = 250, rounded = true }: BirdImageProps) {
  // Simple colored placeholder for bird image
  return (
    <div
      style={{
        width: width,
        height: height,
        borderRadius: rounded ? "12px" : 0,
        background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "3rem",
      }}
      title={alt}
    >
      🐦
    </div>
  );
}