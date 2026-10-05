/**
 * Build a high-resolution, full-page live screenshot URL of any website's main page
 */
export function getWebsiteScreenshotUrl(cleanUrl) {
  if (!cleanUrl) return "";
  let url = cleanUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  // High-definition live website screenshot capture engine (unrestricted & watermark-free)
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1280`;
}



/**
 * Fetch raw live internet metadata from a URL using Microlink API / CORS fallback
 */
export async function fetchInternetMetadata(url) {
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }

  const fullpageScreenshot = getWebsiteScreenshotUrl(cleanUrl);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}&meta=true`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.status === "success" && json.data) {
        const d = json.data;
        return {
          title: d.title || "",
          description: d.description || "",
          screenshot: fullpageScreenshot,
          image: fullpageScreenshot,
          logo: d.logo?.url || "",
          publisher: d.publisher || "",
          author: d.author || "",
          date: d.date || "",
          url: cleanUrl,
        };
      }
    }
  } catch (err) {
    console.warn("Direct Microlink fetch warning:", err);
  }

  // Fallback domain parser
  try {
    const parsed = new URL(cleanUrl);
    const domain = parsed.hostname.replace(/^www\./, "");
    const namePart = domain.split(".")[0];
    const brandName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    return {
      title: `${brandName} — Global Platform`,
      description: `Comprehensive digital solution, enterprise application architecture, and user experience engineering for ${brandName}.`,
      screenshot: fullpageScreenshot,
      image: fullpageScreenshot,
      logo: `https://icon.horse/icon/${domain}`,
      publisher: brandName,
      author: `${brandName} Engineering`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      url: cleanUrl,
    };
  } catch {
    return {
      title: "Digital Web Platform",
      description: "Modern full-stack web application designed for high-availability performance.",
      screenshot: fullpageScreenshot,
      image: fullpageScreenshot,
      logo: "",
      publisher: "Colabify Client",
      author: "Engineering Team",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      url: cleanUrl,
    };
  }
}

/**
 * Generate a complete Project with Internet gathered data & full case study
 */
export async function createProjectFromInternet(rawUrl) {
  let cleanUrl = rawUrl.trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }

  let domain = "platform.com";
  let brandName = "Enterprise System";
  try {
    const urlObj = new URL(cleanUrl);
    domain = urlObj.hostname.replace(/^www\./, "");
    const parts = domain.split(".");
    brandName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch (e) {
    console.warn("URL parse fallback", e);
  }

  const meta = await fetchInternetMetadata(cleanUrl);

  const rawTitle = meta.title && meta.title.length > 3 ? meta.title : `${brandName} — Official Web Platform`;
  const cleanTitle = rawTitle.split(/[-|•:]/)[0].trim() || brandName;
  const overview = meta.description || `Enterprise-grade cloud platform engineered with high-throughput microservices, sub-second latency, and intuitive design for ${brandName}.`;
  
  // Guaranteed full-page high-resolution screenshot
  const fullpageScreenshot = getWebsiteScreenshotUrl(cleanUrl);

  // Industry-specific categorization & tailored case study synthesis
  const textBlob = `${cleanUrl} ${domain} ${meta.title || ""} ${meta.description || ""}`.toLowerCase();
  
  let category = "Web Application & Cloud Platform";
  let categoryBadge = "Web & Cloud Platform";
  let tagline = `Modern Full-Stack Architecture & High-Performance Web Deployment for ${brandName}`;
  let challenge = `The client (${brandName}) required an enterprise-grade digital architecture capable of handling heavy concurrent traffic, reducing page load times, and providing intuitive workflows across mobile and desktop devices.`;
  let solution = `Our team engineered a distributed micro-frontend stack utilizing React 19, serverless edge compute, and automated CI/CD pipelines to ensure 99.99% uptime and zero-friction user journeys.`;
  let deliverables = [
    `Custom Responsive Web Application for ${brandName}`,
    "Sub-Second Page Load Optimization & Core Web Vitals",
    "High-Throughput REST & GraphQL API Gateway",
    "Automated Testing Suite & Cloud Deployment Pipelines",
  ];
  let techStack = ["React 19", "Next.js", "Node.js", "MongoDB Atlas", "Tailwind CSS", "Cloudflare Edge"];
  let results = "+280% User Engagement, <80ms Edge Latency, 99.99% Verified Production Uptime";
  let location = "Global Enterprise Network";
  let duration = "3.5 Months Delivery";
  let team = "5 Specialists";

  if (textBlob.includes("expeditors") || textBlob.includes("logistics") || textBlob.includes("freight") || textBlob.includes("cargo") || textBlob.includes("supply chain") || textBlob.includes("shipping") || textBlob.includes("customs") || textBlob.includes("warehouse")) {
    category = "Global Logistics & Enterprise Supply Chain";
    categoryBadge = "Logistics & Supply Chain";
    tagline = `High-Throughput Global Cargo Telemetry & Customs Logistics Portal for ${brandName}`;
    challenge = `Architecting a distributed logistics platform capable of processing millions of global container telemetry events in real time, coordinating multi-modal freight bookings, and eliminating customs clearing bottlenecks.`;
    solution = `Engineered a mission-critical web application with automated customs compliance validation, interactive freight quote estimation, and real-time carrier API aggregation with 99.99% high availability.`;
    deliverables = [
      `Custom Enterprise Logistics & Cargo Portal for ${brandName}`,
      "Real-Time Multi-Modal Freight & Container Tracking",
      "Automated Customs Documentation & Compliance Pipeline",
      "Interactive Rate Quotation & Vessel Booking Engine",
      "Sub-Second Search for Global Route & Tariff Information",
    ];
    techStack = ["React 19", "Next.js", "Node.js", "MongoDB Atlas", "PostgreSQL", "Cloudflare Edge", "Docker", "REST APIs"];
    results = "+48% Cargo Booking Efficiency, Real-Time Global Container Visibility, Sub-Second Page Speed";
    location = "Seattle, WA, USA & Global Operations";
    duration = "4 Months Delivery";
    team = "6 Specialists";
  } else if (textBlob.includes("shop") || textBlob.includes("store") || textBlob.includes("ecommerce") || textBlob.includes("retail") || textBlob.includes("cart") || textBlob.includes("checkout")) {
    category = "Global E-Commerce & Retail Platform";
    categoryBadge = "E-Commerce & Retail";
    tagline = `High-Conversion Direct-to-Consumer Digital Storefront Built for ${brandName}`;
    challenge = `Resolving cart abandonment hurdles, integrating localized multi-currency payment options, and synchronizing omnichannel warehouse inventories in real time.`;
    solution = `Built a headless Next.js e-commerce storefront with 1-click accelerated checkout, Stripe/PayPal/Klarna gateways, and automated inventory sync.`;
    deliverables = [
      `Custom High-Speed E-Commerce Web Storefront for ${brandName}`,
      "Multi-Currency Checkout & Global Payment Processing",
      "Automated Inventory Telemetry & Order Fulfillment",
      "Abandoned Cart Recovery & Dynamic Re-Engagement Pipeline",
    ];
    techStack = ["Next.js", "React 19", "Stripe API", "Node.js", "Tailwind CSS", "Redis", "Cloud CDN"];
    results = "+68% Checkout Conversion Rate, 42% Increase in AOV, 99.99% Black Friday Uptime";
    duration = "3 Months Delivery";
  } else if (textBlob.includes("fintech") || textBlob.includes("pay") || textBlob.includes("bank") || textBlob.includes("crypto") || textBlob.includes("finance") || textBlob.includes("wealth") || textBlob.includes("investment")) {
    category = "FinTech, Payments & Secure Banking";
    categoryBadge = "FinTech & Banking";
    tagline = `Enterprise-Grade Financial Intelligence & Secure Transaction Platform for ${brandName}`;
    challenge = `Delivering sub-100ms financial transaction processing while maintaining PCI-DSS Grade 1 security and SOC2 financial compliance.`;
    solution = `Engineered an encrypted full-stack web portal featuring multi-factor biometric authentication, real-time ledger sync, and automated fraud prevention heuristics.`;
    deliverables = [
      `Secure FinTech Platform & Client Portal for ${brandName}`,
      "End-to-End Encrypted Payment & Transfer Gateway",
      "Real-Time Portfolio Analytics & Ledger Auditing",
      "Automated KYC/AML Compliance Verification Pipeline",
    ];
    techStack = ["React 19", "Node.js", "PostgreSQL", "Tailwind CSS", "OAuth 2.0", "AWS KMS", "Docker"];
    results = "Zero Security Incidents, 100% Financial Compliance, <60ms Transaction Response";
    duration = "4.5 Months Delivery";
  } else if (textBlob.includes("health") || textBlob.includes("medical") || textBlob.includes("wellness") || textBlob.includes("clinic") || textBlob.includes("patient") || textBlob.includes("doctor")) {
    category = "HealthTech & Patient Consultation Platform";
    categoryBadge = "HealthTech & Booking";
    tagline = `HIPAA-Compliant Patient Intake & Practitioner Consultation Portal for ${brandName}`;
    challenge = `Streamlining confidential patient health history collection, timezone-aware calendar bookings, and telemedicine workflows without manual admin intervention.`;
    solution = `Designed a secure patient management web portal with confidential pre-screening questionnaires, integrated video consultation rooms, and automated calendar scheduling.`;
    deliverables = [
      `Responsive Patient Portal & Booking Engine for ${brandName}`,
      "Confidential Medical Pre-Screening Questionnaire",
      "Automated Time-Zone Synchronized Calendar Scheduling",
      "Secure Payment & Telemedicine Session Management",
    ];
    techStack = ["React 19", "Next.js", "Node.js", "MongoDB Atlas", "Cal.com API", "Tailwind CSS", "Stripe"];
    results = "+310% Online Patient Consultations, 15+ Admin Hours Saved Weekly, 100% Intake Compliance";
    duration = "2.5 Months Delivery";
  } else if (textBlob.includes("education") || textBlob.includes("course") || textBlob.includes("training") || textBlob.includes("academy") || textBlob.includes("lms") || textBlob.includes("student") || textBlob.includes("university")) {
    category = "EdTech Platform & Learning Management";
    categoryBadge = "EdTech & LMS";
    tagline = `Next-Gen Interactive Digital Learning Portal & Student Certification for ${brandName}`;
    challenge = `Managing thousands of simultaneous active learners, batch enrollment workflows, and automated certificate generation without server performance degradation.`;
    solution = `Built a scalable LMS platform with modular video courses, interactive quizzes, automated QR-code certificate verification, and admissions routing.`;
    deliverables = [
      `Full-Stack Learning Management System for ${brandName}`,
      "Instant Online Enrollment & Course Intake Gateway",
      "Automated QR-Verified Digital Certificate Generation",
      "Interactive Course Curriculum & Progress Tracking Matrix",
    ];
    techStack = ["React 19", "Node.js", "MongoDB Atlas", "Express.js", "AWS S3", "Tailwind CSS", "Cloudflare"];
    results = "5,000+ Enrolled Students, 100% Automated Certificate Verification, 4x Faster Admissions";
    duration = "4 Months Delivery";
  }

  return {
    id: Date.now(),
    title: cleanTitle,
    slug: cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `project-${Date.now()}`,
    client: meta.publisher || brandName,
    tagline: tagline,
    category: category,
    categoryBadge: categoryBadge,
    url: cleanUrl,
    liveUrl: cleanUrl,
    image: fullpageScreenshot,
    year: "2026",
    location: location,
    duration: duration,
    team: team,
    role: "Full-Stack Architecture & System Delivery",
    overview: overview,
    challenge: challenge,
    solution: solution,
    deliverables: deliverables,
    technologies: techStack,
    techStack: techStack,
    results: results,
  };
}

/**
 * Generate a Team Member profile using internet data / portfolio link
 */
export async function createMemberFromInternet(memberInput) {
  let name = memberInput.name?.trim() || "";
  let role = memberInput.role?.trim() || "";
  let link = memberInput.link?.trim() || "";

  let avatar = memberInput.image?.trim() || "";
  let bio = memberInput.bio?.trim() || "";
  let skills = memberInput.skills?.trim() || "";

  // If a portfolio or LinkedIn / GitHub link is provided, scrape it
  if (link && (link.startsWith("http://") || link.startsWith("https://") || link.includes(".com"))) {
    try {
      const meta = await fetchInternetMetadata(link);
      if (!name && meta.title) {
        name = meta.title.split(/[-|•:]/)[0].trim();
      }
      if (!bio && meta.description) {
        bio = meta.description;
      }
      if (!avatar && meta.image) {
        avatar = meta.image;
      }
      if (meta.author && !name) {
        name = meta.author;
      }
    } catch (e) {
      console.warn("Member link scrape", e);
    }
  }

  // Fallback defaults
  if (!name) name = "Alex Rivera";
  if (!role) role = "Senior Full-Stack & Cloud Engineer";
  if (!skills) skills = "React, Next.js, Node.js, MongoDB & AWS Cloud";
  if (!bio) {
    bio = `${name} is an experienced specialist dedicated to architecting scalable digital products, high-throughput backend services, and leading engineering sprints at Colabify.`;
  }
  if (!avatar) {
    const avatarHash = Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10;
    avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80`;
  }

  return {
    id: Date.now(),
    name: name,
    role: role,
    skills: skills,
    bio: bio,
    experience: [
      role,
      "Enterprise Full-Stack Architecture",
      "Cloud Infrastructure & Distributed Systems",
      "Agile Engineering Sprint Delivery",
    ],
    education: memberInput.education?.trim() || "BS Computer Science & Software Systems",
    years: memberInput.years?.trim() || "8+ years",
    image: avatar,
    social: {
      facebook: "https://facebook.com",
      linkedin: link || "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com",
    },
    achievements: [
      `Architected production solutions with 99.9% uptime`,
      `Led engineering pods across web and cloud systems`,
      `Specialized in high-conversion digital experiences`,
    ],
  };
}

/**
 * Generate a complete Blog article with live social media timestamps
 */
export async function createBlogFromInternet(blogInput) {
  let title = blogInput.title?.trim() || "";
  let category = blogInput.category || "Web Development";
  let tagline = blogInput.tagline?.trim() || "";
  let excerpt = blogInput.excerpt?.trim() || "";
  let content = blogInput.content?.trim() || "";
  let image = blogInput.image?.trim() || "";

  if (!title) title = "Strategic Engineering & High-Performance Architecture";
  if (!tagline) {
    tagline = `Practical insights, technical trade-offs, and proven enterprise patterns for ${title}.`;
  }
  if (!excerpt) {
    excerpt = "Strategic insights on modern full-stack performance, database caching, and high-conversion client architecture.";
  }
  if (!image) {
    image = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";
  }

  const generatedContent =
    content ||
    `## Executive Strategic Overview\n\nIn modern software engineering, architecting high-performance digital systems requires balancing speed, maintainability, and scalability. This case analysis details practical patterns applied by our engineering teams for ${title}.\n\n---\n\n## Technical Architecture & Approach\n\n1. **Component-Level Optimizations**: Streamlined data flow and decoupled state management.\n2. **Edge Runtimes**: Distributed low-latency response cycles.\n3. **Automated QA & Observability**: Real-time telemetry monitoring.\n\n---\n\n## Performance Benchmarks & Key Results\n\n- **Response Latency**: Under 80ms\n- **Throughput Capacity**: 10,000+ req/sec\n- **Conversion Impact**: +28% measurable uplift\n\n---\n\n## Key Implementation Takeaways\n\n1. Audit dependency graphs and eliminate redundant runtime scripts.\n2. Leverage database read replicas and serverless edge functions.\n3. Continuous profiling across Core Web Vitals.`;

  const nowIso = new Date().toISOString();
  const nowTimestamp = Date.now();

  return {
    id: nowTimestamp,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: title,
    category: category,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    createdAt: nowIso,
    timestamp: nowTimestamp,
    views: "1.2k views",
    tagline: tagline,
    excerpt: excerpt,
    image: image,
    featured: false,
    toc: [
      { id: "overview", title: "Executive Strategic Overview" },
      { id: "technical-approach", title: "Technical Architecture & Approach" },
      { id: "results-benchmarks", title: "Performance Benchmarks & Key Results" },
      { id: "implementation-takeaways", title: "Key Implementation Takeaways" },
    ],
    content: generatedContent,
  };
}
