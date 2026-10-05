// @ts-expect-error - projectsData is a plain JavaScript data module
import { PROJECTS_DATA } from "@/data/projectsData";

declare const process: {
  env?: {
    MONGODB_URI?: string;
    MONGODB_DB_NAME?: string;
    MONGODB_USERNAME?: string;
    MONGODB_PASSWORD?: string;
  };
};

export interface ProjectItem {
  id: number | string;
  slug?: string;
  title: string;
  tagline?: string;
  category?: string;
  categoryBadge?: string;
  url?: string;
  liveUrl?: string;
  image?: string;
  isFirstCard?: boolean;
  useIframe?: boolean;
  client?: string;
  location?: string;
  duration?: string;
  team?: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  deliverables?: string[];
  technologies?: string[];
  results?: string;
  createdAt?: string;
}

// Environment Configuration & Verified Credentials
export const MONGODB_CONFIG = {
  uri:
    (typeof process !== "undefined" && process?.env?.MONGODB_URI) ||
    "mongodb+srv://haris2192001_db_user:1of06JZdrwXOtgif@cluster0.9xogsl5.mongodb.net/Colabify?retryWrites=true&w=majority&appName=Cluster0",
  dbName: (typeof process !== "undefined" && process?.env?.MONGODB_DB_NAME) || "Colabify",
  username: (typeof process !== "undefined" && process?.env?.MONGODB_USERNAME) || "haris2192001_db_user",
  password: (typeof process !== "undefined" && process?.env?.MONGODB_PASSWORD) || "1of06JZdrwXOtgif",
};

// Initial default projects to seed into MongoDB
export const SEED_PROJECTS: ProjectItem[] = ((PROJECTS_DATA as any[]) || []).map((p: any) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  tagline: p.tagline,
  category: p.category,
  categoryBadge: p.categoryBadge,
  url: p.url,
  liveUrl: p.liveUrl || p.url,
  image: p.image,
  isFirstCard: Boolean(p.isFirstCard),
  useIframe: Boolean(p.useIframe),
  client: p.client,
  location: p.location,
  duration: p.duration,
  team: p.team,
  overview: p.overview,
  challenge: p.challenge,
  solution: p.solution,
  deliverables: p.deliverables,
  technologies: p.technologies,
  results: p.results,
  createdAt: new Date().toISOString(),
}));
