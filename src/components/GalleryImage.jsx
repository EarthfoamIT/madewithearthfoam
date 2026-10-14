export default function GalleryImage({ src, width, height, alt, caption }) {
  return (
    <figure className="contentLayout__galleryMedia relative overflow-h mt-2 mb-2">
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        className="w-full h-auto fit-cover aspect-square brad-1"
        loading="lazy"
      />
      {caption && (
        <div className="w-full p-2 absolute b0 l0 r0 flex justify-center">
          <figcaption className="rounded text-caption text-center inline-block">{caption}</figcaption>
        </div>
      )}
    </figure>
  )
}
