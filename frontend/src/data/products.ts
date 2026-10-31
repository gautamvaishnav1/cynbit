import type { Product, ProductId } from '../types';

/**
 * Public product copy transcribed from cynbit.in/products.
 * This file is DATA ONLY — it contains no component logic and no review data.
 */
export const products: Product[] = [
  {
    id: 'cynbit-studio',
    name: 'Cynbit Studio',
    monogram: 'CS',
    icon: 'rocket',
    flag: 'Flagship edtech',
    eyebrow: 'AI-Powered Career Growth Lab',
    tagline: 'Not just another coding platform.',
    summary: 'Coding education and AI-evaluated learning platform for career-focused developers.',
    description:
      'Cynbit Studio helps students and developers move from learning to employability through adaptive coding paths, AI-evaluated missions, and institutional-grade career tools.',
    accent: 'brand',
    ctaLabel: 'Start Building Legacy',
    quote:
      'What if your coding platform knew where you stand, challenged you at the right level, and helped you present yourself to companies?',
    featureGroups: [
      {
        eyebrow: 'The Skill Engine',
        heading: 'Adaptive Learning & AI Evaluation',
        body: 'Every user gets a personalized journey. Identify your level with a placement assessment, follow structured paths, and receive real-time AI feedback on your code quality.',
        features: [
          { icon: 'analytics', title: 'Placement Assessment', subtitle: 'Skip what you know' },
          { icon: 'terminal', title: 'AI Coding Missions', subtitle: 'Adaptive challenges' },
          { icon: 'verified_user', title: 'AI Code Evaluation', subtitle: 'Quality feedback' },
          { icon: 'support_agent', title: 'AI Mentor Support', subtitle: 'Hints & guidance' },
        ],
      },
      {
        eyebrow: 'Built for Employability',
        heading: 'Career Prep ecosystem.',
        features: [
          { icon: 'video_chat', title: 'AI Mock Interviews', subtitle: 'Practice with feedback' },
          { icon: 'description', title: 'AI Resume Engine', subtitle: 'Generated for you' },
          { icon: 'troubleshoot', title: 'Job Matcher Analysis', subtitle: 'Role fit scoring' },
          { icon: 'badge', title: 'Legacy Profiles', subtitle: 'Verified proof of skill' },
        ],
      },
    ],
    pillars: [
      {
        code: 'USP 01',
        title: 'One Platform Ecosystem',
        body: 'Connects learning, proof of skill, and career documents in one place.',
      },
      {
        code: 'USP 02',
        title: 'Adaptive Skill Journey',
        body: 'Placement tests personalize your path from day one.',
      },
      {
        code: 'USP 03',
        title: 'AI Quality Evaluation',
        body: 'Feedback on code quality instead of just simple output matching.',
      },
      {
        code: 'USP 04',
        title: 'Visible Progress Proof',
        body: 'XP and certificates turn invisible effort into verified career proof.',
      },
      {
        code: 'USP 05',
        title: 'Employability Built-in',
        body: 'Resume generation and job matching make this more than just a learning app.',
      },
      {
        code: 'USP 06',
        title: 'AI Career Companion',
        body: 'Mentor, evaluator, and interviewer integrated into one experience.',
      },
    ],
    stats: [
      { value: 'Logic', label: 'Track reasoning' },
      { value: 'Execution', label: 'Track speed' },
      { value: 'AI Review', label: 'Track quality' },
    ],
  },
  {
    id: 'tenantease',
    name: 'TenantEase',
    monogram: 'TE',
    icon: 'apartment',
    flag: 'Flagship saas',
    eyebrow: 'Smart property management',
    tagline: 'Smart Property & Tenant Management Platform',
    summary: 'Property and tenant management platform with automated rent collection.',
    description:
      'Replaces manual chaos with a single smart system. Manage properties, track tenants, and automate rent collection in one centralized dashboard.',
    accent: 'sand',
    ctaLabel: 'Schedule Tour',
    quote:
      'Run your property business without the chaos of notebooks and scattered chats.',
    featureGroups: [
      {
        eyebrow: 'Financial Control',
        heading: 'Rent & Payment Intelligence',
        body: 'Never miss or forget payments. Track monthly rent, record transactions, and view pending dues with automated system-driven reminders.',
        features: [
          { icon: 'notifications_active', title: 'Auto Reminders', subtitle: 'System-driven chasing' },
          { icon: 'history', title: 'Payment Audit', subtitle: 'Full digital history' },
          { icon: 'donut_large', title: 'Collection Efficiency', subtitle: '100% target' },
          { icon: 'dashboard', title: 'Business Dashboard', subtitle: 'Occupancy & revenue trends' },
        ],
      },
      {
        eyebrow: 'Portfolio Control',
        heading: 'Units, tenants, overview.',
        features: [
          { icon: 'domain', title: 'Unit Tracking', subtitle: 'Add buildings and rooms. Track availability instantly.' },
          { icon: 'group', title: 'Tenant Profiles', subtitle: 'Structured digital profiles with ID verification, contacts, and history.' },
          { icon: 'insights', title: 'Business Dashboard', subtitle: 'Occupancy rates and revenue trends for data-driven property management.' },
        ],
      },
    ],
    pillars: [
      {
        code: '01',
        title: 'Unit Tracking',
        body: 'Add buildings and rooms. Track availability instantly. No more confusion about vacancy status.',
      },
      {
        code: '02',
        title: 'Tenant Profiles',
        body: 'Structured digital profiles with ID verification, contacts, and historical data all in one secure place.',
      },
      {
        code: '03',
        title: 'Business Dashboard',
        body: 'Occupancy rates and revenue trends for data-driven property management.',
      },
    ],
    stats: [
      { value: '100%', label: 'Collection target' },
      { value: 'Auto', label: 'Rent reminders' },
    ],
  },
  {
    id: 'revio',
    name: 'Revio',
    monogram: 'RV',
    icon: 'auto_awesome',
    flag: 'Flagship Reputation AI',
    eyebrow: 'AI Reputation & Sentiment Hub',
    tagline: 'The Definitive Review Management System',
    summary: 'AI-powered reputation and review management platform.',
    description:
      'Revio is an AI-first reputation engine built to automate customer feedback management, sync reviews across platforms, and protect brand prestige through intelligent sentiment analysis.',
    accent: 'ink',
    ctaLabel: 'Audit Reputation Architecture',
    quote:
      'Revio is the centralized ecosystem for the modern reputation-driven business.',
    featureGroups: [
      {
        eyebrow: 'Reputation Management',
        heading: 'AI-Driven Review Sync',
        body: 'Monitor positive and negative feedback across Google, social media, and industry sites. Deploy AI-generated, professional responses to every review automatically.',
        features: [
          { icon: 'reviews', title: 'Cross-Platform Sync', subtitle: 'Google, social & listings' },
          { icon: 'auto_awesome', title: 'AI Response Engine', subtitle: 'Drafted replies' },
          { icon: 'mood', title: 'Sentiment Intelligence', subtitle: 'Tone over time' },
          { icon: 'notification_important', title: 'Crisis Detection', subtitle: 'Early warnings' },
        ],
      },
      {
        eyebrow: 'Access Hierarchy',
        heading: 'Security Model',
        body: 'Structured role-based access for global admins, brand managers, and location-level advisors.',
        features: [
          { icon: 'security', title: 'Admin', subtitle: 'System governance' },
          { icon: 'stars', title: 'Manager', subtitle: 'Brand prestige' },
          { icon: 'support_agent', title: 'Advisor', subtitle: 'Branch operations' },
          { icon: 'location_automatic', title: 'Multi-Location Control', subtitle: 'Ratings from one dashboard' },
        ],
      },
    ],
    pillars: [
      {
        code: '01',
        title: 'Multi-Location Control',
        body: 'Centralized control for brands with multiple branches. Track location-wise ratings and sentiment from a single dashboard.',
      },
      {
        code: '02',
        title: 'AI Response Engine',
        body: 'Professional, on-brand replies drafted automatically for every incoming review.',
      },
      {
        code: '03',
        title: 'Crisis Detection',
        body: 'Sentiment shifts and negative spikes are flagged before they escalate.',
      },
    ],
    stats: [
      { value: '94%', label: 'Sentiment score' },
      { value: 'AI-First', label: 'Responses' },
      { value: 'Multi-Site', label: 'Sync' },
    ],
  },
];

export const productIds: ProductId[] = products.map((p) => p.id);

export function getProduct(id: ProductId): Product {
  const found = products.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown product id: ${id}`);
  return found;
}
