import healthcareAmbulance from '../assets/images/healthcare-ambulance.webp'
import healthcarePrivacyCurtains from '../assets/images/healthcare-privacy-curtains.webp'
import healthcareWaitingArea from '../assets/images/healthcare-waiting-area.webp'
import healthcareMedicalCamp from '../assets/images/healthcare-medical-camp.webp'
import bikesForWorkers from '../assets/images/bikes-for-workers.webp'
import ppeKitDistribution from '../assets/images/ppe-kit-distribution.webp'
import deharagodaWater from '../assets/images/deharagoda-water.webp'
import halfHeightPillow01 from '../assets/images/half-height-pillow-01.webp'
import halfHeightPillow02 from '../assets/images/half-height-pillow-02.webp'

// Each project gets its own page at /<slug>.
// `card` is the teaser shown in the home page's "Fair Trade Projects" section.
export const projects = [
  {
    slug: 'increasing-access-to-healthcare',
    title: 'Increasing Access to Healthcare',
    summary:
      'Sri Lanka has free government healthcare, but in rural areas the wait times for care can be prohibitively long and hospitals are often lacking in basic amenities like privacy curtains. Our workers have chosen to invest a lot in these facilities, benefiting everyone who lives there.',
    card: { image: healthcareAmbulance, alt: 'ambulance parked in front of a hospital' },
    caseStudies: [
      {
        title: 'Protecting Privacy at the Emergency Medical Center',
        text: 'Eheliyagoda Base Hospital is the only one in the area that handles emergencies, including emergency childbirth. But there was absolutely no patient privacy, as all beds were in an open room. Full privacy curtains were installed along with seats for those waiting, which greatly improved the standard of care.',
        image: healthcarePrivacyCurtains,
        alt: 'hospital room with curtains between the beds',
      },
      {
        title: 'Building a Waiting Area for the Local Hospital',
        text: 'The Badalkumbura Hospital cares for a whopping 800 patients a day, and it’s where many of our workers receive medical care. There’s always a wait to be seen, and yet it had no waiting room. A covered area was built in front of the hospital and filled with benches to create a comfortable, protected area.',
        image: healthcareWaitingArea,
        alt: 'people in Sri Lanka sitting in a waiting area',
      },
      {
        title: 'Hosting Free Medical Clinics',
        text: 'Preventative healthcare isn’t common for a lot of our workers. To help them take better care of themselves, free health clinics are now available to farmers, tappers, and factory workers. These clinics offer check-ups, blood work, and provide financial assistance when additional treatment is needed.',
        image: healthcareMedicalCamp,
        alt: 'crowd of people in Sri Lanka waiting for medical care',
      },
    ],
  },
  {
    slug: 'improving-productivity-and-working-conditions',
    title: 'Improving Productivity and Working Conditions',
    summary:
      'As independent, organic farmers, it can be hard to keep up with the big corporations. Our farmers are always coming up with more sustainable, creative ways to increase productivity without sacrificing the quality of crops (or their quality of life).',
    card: { image: bikesForWorkers, alt: 'a line of people with new bicycles' },
    caseStudies: [
      {
        title: 'Providing Bikes as Transportation',
        text: 'Between gas shortages and high fuel prices, our employees were having trouble getting to work. They came up with the idea to buy a fleet of bicycles for their shared use, making it easier and cheaper to travel.',
        image: bikesForWorkers,
        alt: 'a line of people with new bicycles',
      },
      {
        title: 'Outfitting Tappers with Protective Gear',
        text: 'Tappers often start work before dawn, and are frequently outside in rainy conditions. To keep them safe, warm, and dry, they requested kits of protective boots, headlamps, and raincoats. This gear has already been put into the hands of 350 farmers and 1100 tappers.',
        image: ppeKitDistribution,
        alt: 'people in Sri Lanka receiving PPE',
      },
    ],
  },
  {
    slug: 'strengthening-the-community',
    title: 'Strengthening the Community',
    summary:
      'Every project is different, and some look beyond our own fields and families to address specific needs of the community related to education, childcare, and public spaces.',
    card: { image: deharagodaWater, alt: 'people standing in front of a well' },
    caseStudies: [
      {
        title: 'Bringing Water to an Elementary School',
        text: 'Although Sri Lanka is rich in rainfall and natural waterways, clean water access can be unreliable in rocky regions and around mining facilities where groundwater is contaminated. At the request of workers who live nearby, a well was built for the Ellawala Deheragoda Primary College, which is centrally located between 10 villages and provides education to over 400 students.',
        image: deharagodaWater,
        alt: 'people standing in front of a well',
      },
      {
        // This case study has no photo on the original site either.
        title: 'Creating Space at a Community Center',
        text: 'The Kanuggalla Village Community Hall is home to all sorts of resources, including public meeting spaces, food storage, welfare programs, and elderly care. It’s also where the local preschool operates. There just wasn’t enough room for everyone, so a retaining wall was constructed to create a safe, separate area for the children.',
      },
    ],
  },
  {
    // Unlisted placeholder: in the original sitemap but not linked from any
    // page, and its captions are empty. Kept so the route still exists.
    slug: 'half-height-pillow',
    title: 'Half Height Pillow',
    unlisted: true,
    caseStudies: [
      { title: '', text: '', image: halfHeightPillow01, alt: '' },
      { title: '', text: '', image: halfHeightPillow02, alt: '' },
    ],
  },
]

export const listedProjects = projects.filter((project) => !project.unlisted)
