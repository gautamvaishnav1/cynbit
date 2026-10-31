import type { CaseStudy, FaqItem, NavGroup } from '../types';

/** Transcribed from the public case-studies index. Images are not hot-linked:
 *  each card renders a deterministic brand gradient with the client monogram. */
export const caseStudies: CaseStudy[] = [
  {
    slug: 'wizhealth-ai-diagnostic',
    client: 'WizHealth',
    category: 'Software Dev',
    title: 'AI Diagnostic Triage: Enhancing Medical Efficiency.',
    metrics: ['Uptime', '99.99%'],
    palette: ['#006067', '#0f9aa2'],
    initials: 'WH',
  },
  {
    slug: 'pragya-healths-remote-monitoring',
    client: 'Pragya Healths',
    category: 'Software Dev',
    title: 'IoT Remote Patient Monitoring for Rural Health.',
    metrics: ['Growth', '+140%'],
    palette: ['#013c41', '#2a848a'],
    initials: 'PH',
  },
  {
    slug: 'wild-basil-supply-chain',
    client: 'Wild basil',
    category: 'Software Dev',
    title: 'Blockchain-Lite Transparency for Sustainable Food.',
    metrics: ['Traceability', '100%'],
    palette: ['#204f3a', '#4e9fa3'],
    initials: 'WB',
  },
  {
    slug: 'sofiasa-erp-modernization',
    client: 'Sofiasa',
    category: 'Software Dev',
    title: 'Modernizing Legacy ERP for the Digital Era.',
    metrics: ['Process time', '-58%'],
    palette: ['#02303a', '#7bbdc0'],
    initials: 'SF',
  },
  {
    slug: 'econtentprep-adaptive-learning',
    client: 'EContentPrep',
    category: 'Software Dev',
    title: 'AI-Driven Adaptive Learning Pathways for EdTech.',
    metrics: ['Completion', '+82%'],
    palette: ['#96601a', '#eeb372'],
    initials: 'EC',
  },
  {
    slug: 'cloudy-tales-collaboration',
    client: 'Cloudy Tales',
    category: 'Cloud Strategy',
    title: 'Real-time Collaborative Engine for Digital Storytellers.',
    metrics: ['Latency', '0.8s'],
    palette: ['#3f4f9e', '#4e9fa3'],
    initials: 'CT',
  },
  {
    slug: 'urban-wardrobe-ar-integration',
    client: 'Urban Wardrobe',
    category: 'Software Dev',
    title: 'AR Virtual Try-On: Redefining the Fashion Experience.',
    metrics: ['Conversion', '+46%'],
    palette: ['#4a2f6e', '#a8d5d7'],
    initials: 'UW',
  },
  {
    slug: 'evento-ticketing-scalability',
    client: 'Evento',
    category: 'Cloud Strategy',
    title: 'Scaling Real-time Ticketing for Major Entertainment.',
    metrics: ['Peak users', '50k+'],
    palette: ['#0b3d5c', '#4e9fa3'],
    initials: 'EV',
  },
  {
    slug: 'marketing-addict-ai-optimization',
    client: 'Marketing Addict',
    category: 'Digital Marketing',
    title: 'AI-Powered Campaign Optimization for Global Marketing.',
    metrics: ['Lead growth', '+40%'],
    palette: ['#a13d63', '#eeb372'],
    initials: 'MA',
  },
  {
    slug: 'fashion-headless-commerce',
    client: 'EliteVogue',
    category: 'Software Dev',
    title: 'Next-Gen Headless Commerce for Global Fashion.',
    metrics: ['Load time', '-64%'],
    palette: ['#123f3f', '#4e9fa3'],
    initials: 'EV',
  },
  {
    slug: 'retail-seo-growth',
    client: 'TrendMart',
    category: 'Digital Marketing',
    title: 'Hyper-local SEO strategy yields record organic growth for retail chain.',
    metrics: ['Organic traffic', '+140%'],
    palette: ['#7a4a12', '#e0993f'],
    initials: 'TM',
  },
  {
    slug: 'healthcare-cloud-migration',
    client: 'CarePlus Health',
    category: 'Cloud Strategy',
    title: 'Migrating critical health data to the cloud with zero downtime.',
    metrics: ['Downtime', '0 min'],
    palette: ['#00545c', '#7bbdc0'],
    initials: 'CP',
  },
  {
    slug: 'fintech-payments-evolution',
    client: 'GlobalPay',
    category: 'Software Dev',
    title: 'Revolutionizing cross-border payments for the next billion users.',
    metrics: ['Settlement', '-71%'],
    palette: ['#122a52', '#4e9fa3'],
    initials: 'GP',
  },
];

export const caseStudyCategories = [
  'All Success Stories',
  'Software Dev',
  'Cloud Strategy',
  'Digital Marketing',
] as const;

export const contactFaqs: FaqItem[] = [
  {
    question: 'How can I start a project with Cynbit?',
    answer:
      "You can start by reaching out via email or phone. We'll schedule an initial discovery call to understand your requirements and architectural needs.",
  },
  {
    question: 'Do you offer custom AI automation solutions?',
    answer:
      'Yes, we specialize in building custom AI agents, LLM integrations, and automated business workflows tailored to your specific operations.',
  },
  {
    question: 'Where is Cynbit Technologies located?',
    answer:
      'Our core engineering hub is located in Pratap Nagar, Jaipur, Rajasthan, but we serve visionaries and enterprises globally.',
  },
  {
    question: 'Can I join the BitElevate program?',
    answer:
      'Absolutely! BitElevate is our flagship training initiative. You can find more details on the BitElevate page or contact us directly for enrollment information.',
  },
];

export const navGroups: NavGroup[] = [
  {
    label: 'Company',
    children: [
      { label: 'Our Story', description: 'The vision behind Cynbit.', href: '/story', icon: 'history_edu' },
      { label: 'Our Team', description: 'Meet the architects.', href: '/team', icon: 'groups' },
      { label: 'Careers', description: 'Join the revolution.', href: '/careers', icon: 'work' },
      { label: 'Social Impact', description: 'Our global footprint.', href: '/impact', icon: 'public' },
    ],
  },
  {
    label: 'Expertise',
    children: [
      { label: 'Services Hub', description: 'Tailored tech solutions.', href: '/services', icon: 'terminal' },
      { label: 'Product Suite', description: 'Next-gen toolkits.', href: '/products', icon: 'inventory_2' },
      { label: 'Case Studies', description: 'Real-world results.', href: '/case-studies', icon: 'auto_graph' },
    ],
  },
  {
    label: 'BitElevate',
    children: [
      { label: 'The Ecosystem', description: 'Unstructured learning.', href: '/bitelevate', icon: 'school' },
      { label: 'Learning Paths', description: 'Architect your future.', href: '/bitelevate/paths', icon: 'route' },
      { label: 'Student Diaries', description: 'Real stories. Raw journeys.', href: '/diaries', icon: 'auto_stories' },
    ],
  },
];
