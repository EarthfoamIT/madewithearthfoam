import carousel01 from '../assets/images/carousel-01.webp'
import carousel02 from '../assets/images/carousel-02.webp'
import carousel03 from '../assets/images/carousel-03.webp'
import carousel04 from '../assets/images/carousel-04.webp'

const images = [
  { src: carousel01, alt: 'the corner of a block of foam' },
  { src: carousel02, alt: 'closeup of a block of foam' },
  { src: carousel03, alt: 'closeup shot of a block of foam' },
  { src: carousel04, alt: 'closeup of foam pillow' },
]

// Endless strip. The images are rendered twice and the `carousel-scroll`
// keyframes translate the strip so the loop is seamless.
export default function Carousel() {
  return (
    <section className="bt1-gray1 pt-5 pb-5 lg:pt-10 lg:pb-10 carousel overflow-h">
      <div
        id="carousel-container"
        className="carousel__container flex gap-1 lg:gap-2"
        style={{ animationDuration: `calc(8s * ${images.length})` }}
      >
        {[...images, ...images].map((image, i) => (
          <img
            key={i}
            src={image.src}
            width="640"
            height="428"
            className="brad-1 aspect-16x9 fit-cover"
            alt={i < images.length ? image.alt : ''}
            aria-hidden={i < images.length ? undefined : 'true'}
          />
        ))}
      </div>
    </section>
  )
}
