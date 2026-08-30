export const technologies = [
  'Python',
  'JavaScript',
  'React',
  'Node.js',
  'Machine Learning',
  'LLM Applications',
  'APIs',
  'Git & GitHub',
];

export const projects = [
  {
    number: '01',
    title: 'Project one',
    summary: 'A future home for an AI-powered product, its problem, and the impact it creates.',
    stack: ['AI', 'React', 'API'],
    image: '',
    github: '',
    liveDemo: '',
    caseStudy: '',
  },
  {
    number: '02',
    title: 'Project two',
    summary: 'A future home for an experiment, learning milestone, or thoughtful engineering case study.',
    stack: ['Python', 'ML', 'Product'],
    image: '',
    github: '',
    liveDemo: '',
    caseStudy: '',
  },
];

export const experienceItems = [
  {
    type: 'Next up',
    title: 'Hackathons & collaborative builds',
    description: 'Projects, learnings, and memorable team moments will be documented here.',
    images: [
      {
        src: '/early-chapters/globe.jpg',
        alt: 'Globe visual representing a broad perspective on technology and collaboration.',
        label: 'A wider view',
      },
      {
        src: '/early-chapters/hackfest.jpg',
        alt: 'Hackfest event visual.',
        label: 'Hackfest moments',
      },
    ],
  },
  {
    type: 'In progress',
    title: 'Certifications & focused learning',
    description: 'Verified credentials and completed learning milestones will be added as they are earned.',
    images: [
      {
        src: '/early-chapters/learning-focus.jpg',
        alt: 'Editorial 3D illustration of a tablet, notebook, pencil, and blue glass sphere on a study desk.',
        label: 'Focused curiosity',
      },
      {
        src: '/early-chapters/learning-milestone.jpg',
        alt: 'Editorial 3D illustration of ascending translucent blue glass steps beside an open notebook.',
        label: 'Milestone in view',
      },
    ],
  },
];

export const contactLinks = [
  { label: 'GitHub', href: 'https://github.com/ChadBojelador' },
  { label: 'Email', href: 'mailto:chadbojelador9@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/chad-bojelador/' },
];

export const earlyChapterCarouselItems = [
  {
    image: '/early-chapters/globe.jpg',
    alt: 'Globe visual representing a broad perspective on technology and collaboration.',
  },
  {
    image: '/early-chapters/hackfest.jpg',
    alt: 'Hackfest event visual.',
  },
];

// Roadmap editor: add a new item here and set its `order` value to place it.
// Change `direction` below to switch between newest-first and oldest-first.
export const earlyChapterRoadmapSettings = {
  direction: 'descending',
};

export const earlyChapterTimeline = [
  {
    eyebrow: '01 · perspective',
    title: 'Exploring a wider view',
    id: 'perspective',
    order: 1,
    description: 'A space for the ideas, collaborations, and questions that shape an early path in AI engineering.',
    image: '/early-chapters/globe.jpg',
    alt: 'Globe visual representing a broad perspective on technology and collaboration.',
  },
  {
    eyebrow: '02 · build together',
    title: 'Hackfest',
    id: 'hackfest',
    order: 2,
    description: 'A growing record of build-focused moments, experiments, and lessons from working alongside other curious people.',
    image: '/early-chapters/hackfest.jpg',
    alt: 'Hackfest event visual.',
  },
  {
    eyebrow: '03 · focused learning',
    title: 'Keeping the curiosity moving',
    id: 'focused-learning',
    order: 3,
    description: 'Learning milestones and reflections will live here as they are documented and added to the journey.',
    image: '/early-chapters/learning-focus.jpg',
    alt: 'Study setup with a tablet, notebook, pencil, and blue glass sphere.',
  },
  {
    eyebrow: '04 · continued growth',
    title: 'Always learning',
    id: 'always-learning',
    order: 4,
    description: 'A place to collect completed learning milestones and the next chapters still taking shape.',
    image: '/Learning/asean.png',
    alt: 'ASEAN learning certificate.',
  },
];
