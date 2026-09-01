"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BIRD_IMAGES = [
  "aarn-giri-3lGi0BXJ1W0-unsplash-1.jpg",
  "amee-fairbank-brown-fk1-9yNd120-unsplash-1.jpg",
  "anastasiya-dalenka-7iwKvbL3-UE-unsplash-1-1.jpg",
  "birger-strahl-M5tWJRuTCH0-unsplash-1.jpg",
  "birger-strahl-wDLkhlL-Ns8-unsplash-1.jpg",
  "boris-smokrovic-DPXytK8Z59Y-unsplash-3.jpg",
  "boris-smokrovic-RLLR0oRz16Y-unsplash-2.jpg",
  "chris-charles-9APFPoNb9iw-unsplash-1.jpg",
  "chris-smith-ZeIFgSO3MAU-unsplash-1.jpg",
  "christoph-nolte-rBw2hKC-lHk-unsplash-1-1.jpg",
  "dima-langemann-mjh7ZAAMUmw-unsplash-1.jpg",
  "dulcey-lima-P7fVUSY-5ws-unsplash-2.jpg",
  "genevieve-curry-ORWiAySaSyo-unsplash-1.jpg",
  "jacques-le-henaff-ic-13C3QhAI-unsplash-1.jpg",
  "loic-barre-PzBnvNMHF8Y-unsplash-1.jpg",
  "lukasz-rawa-pjFhcS8t7aw-unsplash-1.jpg",
  "maheera-kulsoom-6AqAhaC6IiA-unsplash-1.jpg",
  "maheera-kulsoom-eWE8pe7wOh8-unsplash-1.jpg",
  "maheera-kulsoom-lEiR65LHUZU-unsplash-1.jpg",
  "maheera-kulsoom-tNHEh-BVn-0-unsplash-1.jpg",
  "mark-olsen-tjZPseTxe6k-unsplash-2.jpg",
  "mehdi-sepehri-cX0Yxw38cx8-unsplash-1-1.jpg",
  "mohammed-nasim-F2OswZJ_4aQ-unsplash-1.jpg",
  "tahlia-doyle-j_4WlUkRgBE-unsplash-1.jpg",
  "trison-thomas-BZN0ItiEf-g-unsplash-2.jpg",
  "vijayalakshmi-nidugondi-WJ4e6UUtwdc-unsplash-1.jpg",
  "wolfgang-hasselmann-IQqTlejF6x0-unsplash-1.jpg",
  "yerim-lee-5ht5AOxTf0k-unsplash-1.jpg",
  "zdenek-machacek-OlKkCmToXEs-unsplash-1.jpg",
  "zdenek-machacek-eqXiLNfZDc0-unsplash-1.jpg",
];

type BirdImageProps = {
  alt: string;
  width?: number;
  height?: number;
  rounded?: boolean;
};

export default function BirdImage({ alt, width = 400, height = 250, rounded = true }: BirdImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const random = BIRD_IMAGES[Math.floor(Math.random() * BIRD_IMAGES.length)];
    setSrc(`/images/birds/${random}`);
  }, []);

  if (!src) return null;

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