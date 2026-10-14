import { ArrowUpRightIcon } from './icons.jsx'

// Photo + title + text card, used for project case studies and the
// project teasers on the home page.
export default function UseCase({ image, alt = '', title, text, showArrow = false }) {
  return (
    <figure className="useCase mb-6 lg:mb-8">
      {image && (
        <img
          src={image}
          width="640"
          height="480"
          alt={alt}
          className="w-full h-auto fit-cover useCase__image brad-1 aspect-16x9 mb-4 lg:mb-6"
          loading="lazy"
        />
      )}
      <figcaption className="flex flex-col">
        <div className="flex flex-row justify-between items-center mb-3">
          <h3 className="h3">{title}</h3>
          {showArrow && <ArrowUpRightIcon />}
        </div>
        <p className="color-gray8">{text}</p>
      </figcaption>
    </figure>
  )
}
