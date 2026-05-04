import Image from "next/image";

type RoomGalleryProps = {
  images: string[];
  alt: string;
  priority?: boolean;
};

export function RoomGallery({ images, alt, priority = false }: RoomGalleryProps) {
  const [primary, ...secondary] = images;

  return (
    <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-brand-deep shadow-soft lg:aspect-[16/11]">
        <Image
          src={primary}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/30 via-transparent to-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(secondary.length > 0 ? secondary : images.slice(0, 2)).slice(0, 6).map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-brand-sage shadow-sm"
          >
            <Image
              src={image}
              alt={`${alt} ${index + 2}`}
              fill
              sizes="(min-width: 1024px) 24vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
