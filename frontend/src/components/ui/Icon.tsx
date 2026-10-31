import type { SVGProps } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Award,
  BadgeCheck,
  BarChart3,
  BellRing,
  BookOpen,
  Box,
  Brain,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  HeartHandshake,
  History,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageSquare,
  Monitor,
  Navigation,
  Network,
  Package,
  PenLine,
  Phone,
  PieChart,
  Quote,
  Rocket,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Smile,
  SlidersHorizontal,
  Sparkles,
  Star,
  Terminal,
  ThumbsUp,
  Timer,
  TrendingUp,
  Users,
  Video,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps the icon keys used in the data layer to concrete Lucide components.
 * Unknown keys fall back to a neutral box so data edits can never crash the UI.
 */
export const iconLibrary: Record<string, LucideIcon> = {
  // product / feature keys
  analytics: BarChart3,
  terminal: Terminal,
  verified_user: ShieldCheck,
  support_agent: Headphones,
  video_chat: Video,
  description: FileText,
  troubleshoot: Wrench,
  badge: BadgeCheck,
  notifications_active: BellRing,
  history: History,
  donut_large: PieChart,
  dashboard: LayoutDashboard,
  domain: Building2,
  group: Users,
  insights: TrendingUp,
  reviews: MessageSquare,
  auto_awesome: Sparkles,
  mood: Smile,
  notification_important: AlertTriangle,
  security: Shield,
  stars: Star,
  location_automatic: MapPin,
  rocket: Rocket,
  apartment: Building,
  school: GraduationCap,
  architecture: LineChart,
  work_history: History,
  route: Navigation,
  navigation: Navigation,
  auto_stories: BookOpen,
  history_edu: BookOpen,
  work: Briefcase,
  public: Globe,
  inventory_2: Package,
  auto_graph: LineChart,
  grid_view: LayoutGrid,
  code: Code2,
  brain: Brain,
  network: Network,

  // navigation / action keys
  mail: Mail,
  expand_more: ChevronDown,
  arrow_forward: ArrowRight,
  north_east: ArrowUpRight,
  hub: Network,
  psychology: Brain,
  settings_suggest: Settings,
  campaign: Megaphone,
  cloud_done: Cloud,
  bolt: Zap,
  trending_up: TrendingUp,
  format_quote: Quote,
  event: Calendar,
  shopping_bag: ShoppingBag,
  cloud: Cloud,
  volunteer_activism: HeartHandshake,
  workspace_premium: Award,
  verified: BadgeCheck,
  star: Star,
  menu: Menu,
  close: X,
  send: Send,
  check: Check,
  filter: SlidersHorizontal,
  edit: PenLine,
  inbox: Inbox,
  loader: Loader2,
  location_on: MapPin,
  phone_in_talk: Phone,
  alternate_email: AtSign,
  timer: Timer,
  monitor: Monitor,
  thumb_up: ThumbsUp,
  alert: AlertTriangle,
  box: Box,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Key from {@link iconLibrary}. */
  name: string;
  /** Rendered px size (width & height). */
  size?: number;
}

/** Data-driven icon renderer with a safe fallback. */
export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  const Component = iconLibrary[name] ?? Box;
  return (
    <Component
      width={size}
      height={size}
      strokeWidth={1.9}
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    />
  );
}

export default Icon;
