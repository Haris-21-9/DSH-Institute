import harrisonImg from "@/assets/team/harrison.jpg";
import sarahImg from "@/assets/team/sarah.jpg";
import davidImg from "@/assets/team/david.jpg";
import aminaImg from "@/assets/team/amina.jpg";
import marcoImg from "@/assets/team/marco.jpg";
import scottImg from "@/assets/team/scott.jpg";

export const INITIAL_TEAM_MEMBERS = [
  {
    id: 1,
    name: "Harrison Baker",
    role: "Full-Stack Web Development Lead",
    skills: "React, Next.js, Node.js & Cloud Web Apps",
    bio: "Lead Web Architect specializing in production-grade web applications, modern JavaScript frameworks, and high-conversion client platforms. Over 12 years directing frontend and backend engineering sprints using React, Next.js, Node.js, and cloud hosting infrastructure.",
    experience: [
      "Full-Stack Architecture & Micro-Frontends",
      "Next.js 15 & React 19 Server Components",
      "Node.js, Express & Microservices",
      "REST & GraphQL High-Throughput APIs",
      "Core Web Vitals & Sub-100ms Rendering",
      "Enterprise Web Application Security"
    ],
    education: "MS Computer Science, Stanford University",
    years: "12+ years",
    image: harrisonImg,
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com"
    },
    achievements: [
      "Delivered 120+ client web apps & SaaS platforms",
      "Achieved 99.99% uptime across production sites",
      "Spearheaded enterprise headless migrations",
      "Mentored 40+ full-stack web developers"
    ]
  },
  {
    id: 2,
    name: "Sarah Lindqvist",
    role: "Principal SEO Strategist & Search Lead",
    skills: "Technical SEO, SERP Ranking & Keyword Authority",
    bio: "Search engine optimization authority with deep expertise in organic search mechanics, technical site audits, and competitive keyword domination. Has helped enterprise and local businesses multiply organic inbound traffic and achieve sustainable #1 Google rankings.",
    experience: [
      "Technical SEO Audits & Crawl Optimization",
      "Keyword Strategy & High-Intent Clustering",
      "On-Page Content Architecture & Semantic Schema",
      "Google Search Console & Ahrefs Dominance",
      "Local SEO, Google Maps & Citations",
      "Core Web Vitals Optimization for Search"
    ],
    education: "MS Digital Marketing, Harvard Business School",
    years: "11+ years",
    image: sarahImg,
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com"
    },
    achievements: [
      "Scaled organic client traffic by 340% in 9 months",
      "Secured #1 SERP ranks for 500+ commercial keywords",
      "Audited 80+ high-traffic web platforms",
      "Keynote Speaker on Modern AI & Search Algorithms"
    ]
  },
  {
    id: 3,
    name: "Marco Bellini",
    role: "Lead Mobile Applications Engineer",
    skills: "Flutter, React Native, Native iOS & Android",
    bio: "Mobile engineering lead with an obsessive focus on responsive cross-platform architectures and native app performance. Expert in building and shipping high-impact iOS and Android applications utilizing Flutter, React Native, and native mobile toolchains.",
    experience: [
      "Cross-Platform Architecture (Flutter & React Native)",
      "Native iOS (Swift) & Android (Kotlin) Optimization",
      "State Management (Riverpod, Bloc, Redux)",
      "Real-time Push Notifications & Offline Sync",
      "App Store & Google Play CI/CD Automation",
      "Biometrics & Secure Hardware Integrations"
    ],
    education: "MS Software Engineering, Politecnico di Milano",
    years: "10+ years",
    image: marcoImg,
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com"
    },
    achievements: [
      "Published 25+ apps to App Store & Google Play",
      "Maintained 4.8+ average app store user rating",
      "Optimized mobile cold-boot speeds by 60%",
      "Engineered offline-first sync for 500k+ MAU app"
    ]
  },
  {
    id: 4,
    name: "Amina Rahman",
    role: "Head of Digital & Performance Marketing",
    skills: "Paid Ads (PPC), Social Media Growth & Funnel ROI",
    bio: "Data-driven digital marketing director focused on scalable customer acquisition, high-ROI paid media campaigns, and conversion rate optimization (CRO). Specializes in crafting full-funnel strategies across Google Ads, Meta Ads, and social channels.",
    experience: [
      "Performance Marketing (PPC & Paid Social)",
      "Google Ads (Search, Performance Max, Display)",
      "Meta Ads (Facebook & Instagram Funnels)",
      "Conversion Rate Optimization (CRO)",
      "Multi-Touch Attribution & Server-Side Pixel Tracking",
      "B2B & B2C Revenue Growth Strategy"
    ],
    education: "MBA Marketing & Analytics, Melbourne Business School",
    years: "10+ years",
    image: aminaImg,
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com"
    },
    achievements: [
      "Managed $15M+ in performance ad budgets",
      "Delivered average 4.2x ROAS for eCommerce clients",
      "Grew brand social engagement by 280%",
      "Certified Google & Meta Marketing Partner"
    ]
  },
  {
    id: 5,
    name: "David Turner",
    role: "Principal ERP & Software Architect",
    skills: "Custom ERP Systems, Cloud POS & Scalable Databases",
    bio: "Enterprise software veteran with extensive experience designing custom ERP platforms, cloud POS solutions, and mission-critical database architectures. Specializes in helping growing enterprises automate workflows, sync real-time inventories, and centralize operations.",
    experience: [
      "Custom ERP & Multi-Warehouse Architecture",
      "Cloud Point of Sale (POS) & Offline Resiliency",
      "Relational & Document Database Optimization",
      "Inventory & Supply Chain Automation",
      "Microservices & Enterprise Cloud Integrations",
      "Data Governance, Security & Compliance"
    ],
    education: "MS Computer Science, MIT",
    years: "14+ years",
    image: davidImg,
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com"
    },
    achievements: [
      "Architected custom ERPs for 30+ enterprise clients",
      "Automated $80M in transaction processing flows",
      "Reduced system downtime to under 0.01%",
      "Designed real-time POS syncing across 120 retail branches"
    ]
  },
  {
    id: 6,
    name: "Scott Miles",
    role: "Head of DevOps & Cloud Architecture",
    skills: "AWS, CI/CD, Containerization & Microservices",
    bio: "Cloud solutions engineer specializing in continuous delivery pipelines, AWS cloud environments, container orchestration, and system reliability engineering. Ensures all office web, mobile, and ERP deployments are fault-tolerant and hyper-scalable.",
    experience: [
      "Cloud Infrastructure (AWS, GCP, Azure)",
      "Zero-Downtime CI/CD Automated Pipelines",
      "Docker Containerization & Kubernetes Clusters",
      "System Security Hardening & SOC2 Auditing",
      "Database Replication & High-Availability Clusters",
      "Site Reliability Engineering (SRE) & Observability"
    ],
    education: "PhD Computer Systems, Carnegie Mellon",
    years: "11+ years",
    image: scottImg,
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com"
    },
    achievements: [
      "Engineered 99.99% high-availability cloud infrastructure",
      "Reduced build & deployment cycle times by 75%",
      "Certified AWS Solutions Architect Professional",
      "Led disaster recovery simulations for fintech clients"
    ]
  }
];
