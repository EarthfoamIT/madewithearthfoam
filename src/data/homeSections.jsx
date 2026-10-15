import foamBlock from '../assets/images/foam-block.webp'
import team from '../assets/images/team.webp'
import partnerLogos from '../assets/images/partner-logos.webp'
import { Link } from 'react-router'
import ProjectCard from '../components/ProjectCard.jsx'
import { listedProjects } from './projects.js'

// Gallery items:
//   { type: 'image', src, width, height, alt, caption? }
//   { type: 'video', src, caption }   (src lives in public/assets/)
//   { type: 'certificates' }          (renders the certificate PDF links)

export const homeSections = [
  {
    id: 'our-foam',
    title: 'Our Foam',
    subhead: "You won't find a better foam.",
    gallery: [
      {
        type: 'image',
        src: foamBlock,
        width: 450,
        height: 450,
        alt: 'a block of Earthfoam on a pedestal',
        caption: 'Our foam is incredibly consistent and impeccably made',
      },
      { type: 'video', src: '/assets/Foam01.512_512x512_crf20.mp4', caption: 'The liquid latex is poured into molds and baked' },
      { type: 'video', src: '/assets/Foam02.512_512x512_crf20.mp4', caption: 'After baking, the solid latex is taken off the mold' },
    ],
    body: (
      <div className="richtext">
        <p>To make Earthfoam, we sourced the highest-quality liquid latex there is, created a transparent supply chain from scratch, and built our own factory.</p>
        <p>Natural latex is known for its exceptional durability and comfort. It absorbs pressure instantly and returns to its original shape the moment it’s released. The airy structure naturally dissipates body heat, and its high density provides stability for people of all shapes and sizes.</p>
        <p>But Earthfoam isn’t just any natural latex foam. Our superior raw materials, highly skilled team, and ownership over the entire process result in an incredibly consistent, impeccably made foam.</p>
        <p>From bedding to furniture, upholstery to footwear, whatever you make, make it good.</p>
      </div>
    ),
  },
  {
    id: 'our-forests',
    title: 'Our Forests',
    subhead: 'We can trace every block of Earthfoam back to the tree.',
    gallery: [
      // "its" fixes the original caption's typo ("it's sap").
      { type: 'video', src: '/assets/Forests01.512_512x512_crf20.mp4', caption: 'A farmer taps a latex tree to collect its sap' },
      { type: 'video', src: '/assets/Forests04.512_512x512_crf20.mp4', caption: 'Latex sap slowly drips from the tree' },
      { type: 'video', src: '/assets/Forests02.512_512x512_crf20.mp4', caption: 'A farmer retrieves the collected sap' },
    ],
    body: (
      <div className="richtext">
        <p>Earthfoam starts as the milky sap of rubber trees harvested by a collective of farmers in Sri Lanka.</p>
        <p>When we first started making latex foam, we weren’t happy with the existing supply chains. We’ve spent the last several years building our own Fair For Life certified fair trade network of 323 small organic farms. It’s the largest in Sri Lanka, employing more than 1,700 workers (and counting). We’ve been able to ensure fair wages and working conditions for all of them.</p>
        <p>Every one of these rubber tree farms is GOLS certified organic, which reduces water and energy use and boosts the biodiversity of the forests.</p>
        <p>Rubber tree forests are beautiful and highly sustainable. One tree can supply liquid latex sap for over 20 years and rubber trees have one of the highest carbon dioxide absorption rates. When our trees stop producing latex sap, the wood is burned to heat our rubber during the vulcanization process.</p>
      </div>
    ),
  },
  {
    id: 'our-factory',
    title: 'Our Factory',
    subhead: 'We control the entire process, so we know exactly how Earthfoam is made.',
    bordered: true,
    gallery: [
      { type: 'video', src: '/assets/Factory01.512_512x512_crf20.mp4', caption: 'An aerial view of our factory outside of Colombo' },
      { type: 'video', src: '/assets/Factory03.512_512x512_crf20.mp4', caption: 'The start of our factory line' },
      { type: 'video', src: '/assets/Factory02.512_512x512_crf20.mp4', caption: 'Technicians inspect and trim the solid blocks of foam' },
    ],
    body: (
      <div className="richtext">
        <p>The liquid latex we collect is meticulously processed using the Dunlop method at our Earthfoam Factory in Colombo, Sri Lanka.</p>
        <p>Our technicians have an average of 15 years of experience working with latex and are true masters of their craft. As a natural material, latex has a natural variance. There’s a lot of nuance and chemistry that goes into processing our foam to meet our extremely high-quality standards.</p>
        <p>We use our own recipe and highly specialized equipment to create latex foam that is remarkably consistent, comfortable, and durable.</p>
        <p>By owning our factory, we know Earthfoam doesn’t contain any fillers or synthetic latex. Plus, making our foam in the same place it’s harvested has reduced energy and transportation costs and allowed us to have a greater impact on our workers, who all earn a living wage.</p>
      </div>
    ),
  },
  {
    id: 'standards-and-certifications',
    title: 'Standards & Certifications',
    subhead: 'Our commitment to our product, employees, and community.',
    bordered: true,
    gallery: [{ type: 'certificates' }],
    body: (
      <div className="richtext">
        <h3 id="sustainable">Sustainable</h3>
        <p>By working with a natural material, farming organically, focusing on biodiversity, and prioritizing the well-being of our workers, Earthfoam is a sustainable product for people and the planet.</p>
        <h3 id="organic">Organic</h3>
        <p>We source latex from certified organic rubber tree farms, and we pay our farmers a premium for the extra effort it takes to care for organic crops. With more biodiversity in our forests, other crops like tea, honey, and kithul syrup (a local sweetener) provide additional sources of income for the farms.</p>
        <h3 id="safe">Safe</h3>
        <p>Earthfoam holds the most stringent health and emissions certifications available and never contains fillers or synthetic latex.</p>
        <h3 id="fair-trade">Fair Trade</h3>
        <p>We are dedicated to maintaining the highest level of working conditions for our employees, and the overall security of the most vulnerable people in our supply chain; the agricultural farmers and workers. As the most stringent fair trade certification, Fair for Life is the most impactful certification we have.</p>
        <h3 id="comfortable">Comfortable</h3>
        <p>Synthetic alternatives have to innovate constantly to achieve the level of comfort that comes easily to natural latex foam. It has a soft, springy feel, is naturally breathable, and doesn’t lose its shape or support over time.</p>
        <h3 id="consistent">Consistent</h3>
        <p>Natural latex has natural variations depending on growing conditions, weather, etc. But because our team has so much experience, we’re able to fine-tune our production process to adapt to these variations and ensure consistency in every batch of Earthfoam.</p>
      </div>
    ),
  },
  {
    id: 'fair-trade-projects',
    title: 'Fair Trade Projects',
    subhead: 'Uplifting the local community in Sri Lanka',
    bordered: true,
    gallery: [],
    body: (
      <>
        <div className="richtext">
          <p>As a Fair for Life certified company, we pay into a Development Fund for our factory workers, farmers, and tappers in Sri Lanka. They decide how to spend it.</p>
          <p>As owners of our Sri Lankan factory and the architects of our fair trade network, we’ve always been active members of our local communities. Our team in Sri Lanka lives, works, votes, and sends their kids to school mere miles away from where our foam is made.</p>
          <p>Environmental sustainability may be one of our top priorities, but caring for our planet would mean next to nothing if we didn’t care for our people.</p>
          <p>Here are some of the projects made possible by the fund.</p>
        </div>
        {listedProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </>
    ),
  },
  {
    id: 'working-together',
    title: 'Working Together',
    subhead: 'How you can source from our factory and work together.',
    bordered: true,
    gallery: [
      {
        type: 'image',
        src: team,
        width: 450,
        height: 337,
        alt: 'Earthfoam employees in front of a warehouse of mattress materials',
        caption: 'Our hardworking team of technicians and staff',
      },
      {
        type: 'image',
        src: partnerLogos,
        width: 450,
        height: 450,
        // The original had empty alt text here.
        alt: 'Logos of companies Earthfoam works with',
        caption: 'A few of the companies we work with',
      },
    ],
    body: (
      <div className="richtext">
        <p>There are a few different ways to source foam from our Earthfoam Factory and we’re always happy to discuss custom projects.</p>
        <p>
          If you have questions or new ideas, please{' '}
          <Link to="/contact">contact us</Link>.
        </p>
        <h3 id="wholesale-latex-foam">Wholesale Latex Foam</h3>
        <p>Our foam is available wholesale in a variety of sizes and densities (including hard rubber). We can also adjust our molds to fit your needs. Reach out to us to discuss quantities and customization options. Licensing is available to use the Made with Earthfoam seal on your finished products.</p>
        <h3 id="product-collaboration">Product Collaboration</h3>
        <p>Want to see Your Brand x Earthfoam? We love to collab with like-minded companies and would be delighted to discuss making something together. We have our own product design teams and can be as involved as you want.</p>
        <h3 id="white-label-manufacturing">White Label Manufacturing</h3>
        <p>Between our foam factory, our design team, and our sewing department, we are equipped to make sustainable, quality products from scratch. If you’re looking for a full-service production partner for your own brand (with or without the Made with Earthfoam seal) let’s talk about it.</p>
      </div>
    ),
  },
]
