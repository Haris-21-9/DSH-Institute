import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://haris2192001_db_user:1of06JZdrwXOtgif@cluster0.9xogsl5.mongodb.net/Colabify?retryWrites=true&w=majority&appName=Cluster0";

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
  }
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
  }
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
  }
];

async function seed() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db('Colabify');

  console.log("Seeding Projects collection...");
  for (const p of SEED_PROJECTS) {
    await db.collection('projects').updateOne({ id: p.id }, { $set: p }, { upsert: true });
  }

  console.log("Seeding Team Members collection...");
  for (const t of SEED_TEAM) {
    await db.collection('team_members').updateOne({ id: t.id }, { $set: t }, { upsert: true });
  }

  console.log("Seeding Blogs collection...");
  for (const b of SEED_BLOGS) {
    await db.collection('blogs').updateOne({ id: b.id }, { $set: b }, { upsert: true });
  }

  console.log("-----------------------------------------");
  console.log("✅ Seed completed successfully!");
  console.log("Projects in MongoDB Atlas:", await db.collection('projects').countDocuments());
  console.log("Team members in MongoDB Atlas:", await db.collection('team_members').countDocuments());
  console.log("Blogs in MongoDB Atlas:", await db.collection('blogs').countDocuments());
  console.log("-----------------------------------------");

  await client.close();
}

seed().catch(console.error);
