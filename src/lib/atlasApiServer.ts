import { MONGODB_CONFIG } from "./mongodb";

const MONGODB_URI =
  (typeof process !== "undefined" && process?.env?.["MONGODB_URI"]) || MONGODB_CONFIG.uri;
const DB_NAME =
  (typeof process !== "undefined" && process?.env?.["MONGODB_DB_NAME"]) || MONGODB_CONFIG.dbName;

let cachedClient: any = null;
let cachedDb: any = null;
let lastConnectFailure = 0;
const FAILURE_COOLDOWN_MS = 15000;

const SEED_PROJECTS = [
  {
    id: 1,
    slug: "usa-insulation-houston",
    title: "USA Insulation Houston",
    tagline: "High-Converting Web Platform & Local Organic SEO Domination",
    category: "Web Development & Local SEO",
    categoryBadge: "Web Platform & SEO",
    url: "https://usainsulationhouston.com/",
    image: "https://image.thum.io/get/width/1280/fullpage/noanimate/https://usainsulationhouston.com/",
    client: "USA Insulation Houston Franchise",
    location: "Houston, Texas, USA",
    duration: "3 Months",
    team: "5 Specialists",
    overview: "A modern responsive web platform engineered for USA Insulation Houston.",
    results: "+180% Organic Search Traffic, 3.4x Monthly Quotes, 0.8s Page Speed",
  },
  {
    id: 2,
    slug: "australian-education-counsel",
    title: "Australian Education Counsel",
    tagline: "Global Higher Education Portal & Student Visa Advisory Platform",
    category: "Web Application & EdTech Consulting",
    categoryBadge: "EdTech & Advisory",
    url: "https://aec.net.pk/",
    image: "https://image.thum.io/get/width/1280/fullpage/noanimate/https://aec.net.pk/",
    client: "Australian Education Counsel (AEC)",
    location: "Islamabad, PK & Melbourne, AUS",
    duration: "4 Months",
    team: "6 Specialists",
    overview: "A premier international education advisory portal for students.",
    results: "+250% Student Assessment Submissions, 40% Reduction in Counselor Response Time",
  },
  {
    id: 4,
    slug: "digital-skills-house",
    title: "Digital Skills House",
    tagline: "Next-Gen Tech Education LMS & Certification Platform",
    category: "EdTech & Learning Management",
    categoryBadge: "LMS & EdTech",
    url: "https://digitalskillshouse.pk/",
    image: "https://digitalskillshouse.pk/digital-skills-house.png",
    client: "Digital Skills House Academy",
    location: "London, UK",
    duration: "4 Months",
    team: "6 Specialists",
    overview: "Interactive video LMS platform with live coding sandbox.",
    results: "+310% Student Enrollments, 88% Course Completion Rate",
  },
  {
    id: 1790596543648,
    slug: "wwgc",
    title: "World Wide Group (WWGC)",
    tagline: "High-Throughput Global Cargo Telemetry & Supply Chain Logistics Portal",
    category: "Global Logistics & Enterprise Supply Chain",
    categoryBadge: "Logistics & Supply Chain",
    url: "https://wwgc.com.pk/",
    client: "World Wide Group (WWGC)",
    location: "Karachi, PK & Global Operations",
    duration: "4 Months Delivery",
    team: "6 Specialists",
    overview: "Consolidated freight forwarding and logistics platform.",
    results: "+48% Cargo Booking Efficiency, Sub-Second Page Speed",
  },
];

const SEED_TEAM = [
  {
    id: 1,
    name: "Harrison Baker",
    role: "Full-Stack Web Development Lead",
    skills: "React, Next.js, Node.js & Cloud Web Apps",
    bio: "Lead Web Architect specializing in production-grade web applications, modern JavaScript frameworks, and high-conversion client platforms.",
    years: "12+ years",
    education: "MS Computer Science, Stanford University",
  },
  {
    id: 2,
    name: "Sarah Lindqvist",
    role: "Principal SEO Strategist & Search Lead",
    skills: "Technical SEO, SERP Ranking & Keyword Authority",
    bio: "Search engine optimization authority with deep expertise in organic search mechanics and competitive keyword domination.",
    years: "11+ years",
    education: "MS Digital Marketing, Harvard Business School",
  },
  {
    id: 3,
    name: "Marco Bellini",
    role: "Lead Mobile Applications Engineer",
    skills: "Flutter, React Native, Native iOS & Android",
    bio: "Mobile engineering lead with an obsessive focus on responsive cross-platform architectures and native app performance.",
    years: "10+ years",
    education: "MS Software Engineering, Politecnico di Milano",
  },
  {
    id: 4,
    name: "Amina Rahman",
    role: "Head of Digital & Performance Marketing",
    skills: "Paid Ads (PPC), Social Media Growth & Funnel ROI",
    bio: "Data-driven digital marketing director focused on scalable customer acquisition and high-ROI paid media campaigns.",
    years: "10+ years",
    education: "MBA Marketing & Analytics, Melbourne Business School",
  },
  {
    id: 5,
    name: "David Turner",
    role: "Principal ERP & Software Architect",
    skills: "Custom ERP Systems, Cloud POS & Scalable Databases",
    bio: "Enterprise software veteran with extensive experience designing custom ERP platforms and cloud POS solutions.",
    years: "14+ years",
    education: "MS Computer Science, MIT",
  },
  {
    id: 6,
    name: "Scott Miles",
    role: "Head of DevOps & Cloud Architecture",
    skills: "AWS, CI/CD, Containerization & Microservices",
    bio: "Cloud solutions engineer specializing in continuous delivery pipelines, AWS cloud environments, and container orchestration.",
    years: "11+ years",
    education: "PhD Computer Systems, Carnegie Mellon",
  },
];

const SEED_BLOGS = [
  {
    id: 1,
    slug: "future-of-headless-cms-nextjs-2026",
    title: "The Future of Headless CMS & Next.js 15 in 2026",
    category: "Web Development",
    excerpt: "Why modern engineering teams are ditching monolithic CMS suites in favor of headless APIs, React 19 server components, and distributed CDN edge caching.",
  },
  {
    id: 2,
    slug: "technical-seo-core-web-vitals-guide",
    title: "Mastering Technical SEO & Sub-Second Core Web Vitals",
    category: "SEO & Growth",
    excerpt: "An actionable framework for diagnosing INP, LCP, and CLS bottlenecks to climb competitive Google search results and accelerate organic lead flow.",
  },
  {
    id: 3,
    slug: "flutter-vs-react-native-enterprise-apps",
    title: "Flutter vs. React Native for Enterprise Mobile Apps",
    category: "Mobile Apps",
    excerpt: "A deep architectural benchmark comparing rendering pipelines, state managers, offline synchronization, and hardware SDK bridges across iOS & Android.",
  },
];

async function getAtlasDb(): Promise<any> {
  if (cachedDb && cachedClient) return cachedDb;

  if (Date.now() - lastConnectFailure < FAILURE_COOLDOWN_MS) {
    return null;
  }

  try {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    await client.connect();
    cachedClient = client;
    cachedDb = client.db(DB_NAME);
    return cachedDb;
  } catch (err) {
    console.warn("[MongoDB Atlas Server connect warning]:", err);
    cachedClient = null;
    cachedDb = null;
    lastConnectFailure = Date.now();
    return null;
  }
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

async function parseBody(request: Request): Promise<any> {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function handleAtlasApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/atlas/")) {
    return null;
  }

  if (request.method === "OPTIONS") {
    return jsonResponse({}, 204);
  }

  // ─── PROJECTS API ───
  if (pathname === "/api/atlas/projects") {
    try {
      const db = await getAtlasDb();
      if (db) {
        const col = db.collection("projects");
        if (request.method === "GET") {
          const docs = await col.find({}).sort({ id: -1 }).toArray();
          const cleanDocs = docs.map(({ _id, ...rest }: any) => rest);
          const projects = cleanDocs.length > 0 ? cleanDocs : SEED_PROJECTS;
          return jsonResponse({ success: true, projects });
        }
        if (request.method === "POST") {
          const body = await parseBody(request);
          if (body && body.id) {
            const clean = { ...body };
            delete clean._id;
            await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
            return jsonResponse({ success: true, project: clean });
          }
        }
        if (request.method === "DELETE") {
          const body = await parseBody(request);
          const id = body.id || url.searchParams.get("id");
          if (id) {
            const numId = Number(id);
            await col.deleteOne({ $or: [{ id: id }, { id: numId }, { id: String(id) }] });
            return jsonResponse({ success: true, id });
          }
        }
      }
    } catch (e) {
      console.warn("[Atlas projects API error]:", e);
    }
    return jsonResponse({ success: true, projects: SEED_PROJECTS });
  }

  // ─── TEAM API ───
  if (pathname === "/api/atlas/team") {
    try {
      const db = await getAtlasDb();
      if (db) {
        const col = db.collection("team_members");
        if (request.method === "GET") {
          const docs = await col.find({}).sort({ id: -1 }).toArray();
          const cleanDocs = docs.map(({ _id, ...rest }: any) => rest);
          const team = cleanDocs.length > 0 ? cleanDocs : SEED_TEAM;
          return jsonResponse({ success: true, team });
        }
        if (request.method === "POST") {
          const body = await parseBody(request);
          if (body && body.id) {
            const clean = { ...body };
            delete clean._id;
            await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
            return jsonResponse({ success: true, member: clean });
          }
        }
        if (request.method === "DELETE") {
          const body = await parseBody(request);
          const id = body.id || url.searchParams.get("id");
          if (id) {
            const numId = Number(id);
            await col.deleteOne({ $or: [{ id: id }, { id: numId }, { id: String(id) }] });
            return jsonResponse({ success: true, id });
          }
        }
      }
    } catch (e) {
      console.warn("[Atlas team API error]:", e);
    }
    return jsonResponse({ success: true, team: SEED_TEAM });
  }

  // ─── BLOGS API ───
  if (pathname === "/api/atlas/blogs") {
    try {
      const db = await getAtlasDb();
      if (db) {
        const col = db.collection("blogs");
        if (request.method === "GET") {
          const docs = await col.find({}).sort({ id: -1 }).toArray();
          const cleanDocs = docs.map(({ _id, ...rest }: any) => rest);
          const blogs = cleanDocs.length > 0 ? cleanDocs : SEED_BLOGS;
          return jsonResponse({ success: true, blogs });
        }
        if (request.method === "POST") {
          const body = await parseBody(request);
          if (body && body.id) {
            const clean = { ...body };
            delete clean._id;
            await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
            return jsonResponse({ success: true, blog: clean });
          }
        }
        if (request.method === "DELETE") {
          const body = await parseBody(request);
          const id = body.id || url.searchParams.get("id");
          if (id) {
            const numId = Number(id);
            await col.deleteOne({ $or: [{ id: id }, { id: numId }, { id: String(id) }] });
            return jsonResponse({ success: true, id });
          }
        }
      }
    } catch (e) {
      console.warn("[Atlas blogs API error]:", e);
    }
    return jsonResponse({ success: true, blogs: SEED_BLOGS });
  }

  // ─── USERS API ───
  if (pathname === "/api/atlas/users") {
    try {
      const db = await getAtlasDb();
      if (db) {
        const col = db.collection("users");
        if (request.method === "GET") {
          const docs = await col.find({}).toArray();
          const cleanDocs = docs.map(({ _id, ...rest }: any) => rest);
          return jsonResponse({ success: true, users: cleanDocs });
        }
        if (request.method === "POST") {
          const body = await parseBody(request);
          if (body && (body.email || body.id)) {
            const clean = { ...body };
            delete clean._id;
            const query = clean.email ? { email: clean.email } : { id: clean.id };
            await col.updateOne(query, { $set: clean }, { upsert: true });
            return jsonResponse({ success: true, user: clean });
          }
        }
      }
    } catch (e) {
      console.warn("[Atlas users API error]:", e);
    }
    return jsonResponse({ success: true, users: [] });
  }

  // ─── SETTINGS API ───
  if (pathname === "/api/atlas/settings") {
    try {
      const db = await getAtlasDb();
      if (db) {
        const col = db.collection("settings");
        const key = url.searchParams.get("key") || "hero_trust";
        if (request.method === "GET") {
          const doc = await col.findOne({ key });
          if (doc) {
            const { _id, ...rest } = doc;
            return jsonResponse({ success: true, settings: rest });
          }
        }
        if (request.method === "POST") {
          const body = await parseBody(request);
          if (body && body.key) {
            const clean = { ...body };
            delete clean._id;
            await col.updateOne({ key: clean.key }, { $set: clean }, { upsert: true });
            return jsonResponse({ success: true, settings: clean });
          }
        }
      }
    } catch (e) {
      console.warn("[Atlas settings API error]:", e);
    }
    if (request.method === "POST") {
      const body = await parseBody(request);
      return jsonResponse({ success: true, settings: body });
    }
    return jsonResponse({ success: true, settings: null });
  }

  // ─── REVIEWS API ───
  if (pathname === "/api/atlas/reviews") {
    try {
      const db = await getAtlasDb();
      if (db) {
        const col = db.collection("reviews");
        if (request.method === "GET") {
          const docs = await col.find({}).sort({ id: -1 }).toArray();
          const cleanDocs = docs.map(({ _id, ...rest }: any) => rest);
          return jsonResponse({ success: true, reviews: cleanDocs });
        }
        if (request.method === "POST") {
          const body = await parseBody(request);
          if (body && body.id) {
            const clean = { ...body };
            delete clean._id;
            await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
            return jsonResponse({ success: true, review: clean });
          }
        }
        if (request.method === "DELETE") {
          const body = await parseBody(request);
          const id = body.id || url.searchParams.get("id");
          if (id) {
            await col.deleteOne({ $or: [{ id: id }, { id: String(id) }] });
            return jsonResponse({ success: true, id });
          }
        }
      }
    } catch (e) {
      console.warn("[Atlas reviews API error]:", e);
    }
    return jsonResponse({ success: true, reviews: [] });
  }

  return jsonResponse({ success: false, message: "Endpoint not found" }, 404);
}
