import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Blog from "../pages/Blog/Blog";

const title = "Blog — Tech Insights & Web Development Guides | Digital Skills House";
const description =
  "Technical tutorials, SEO strategies, mobile development trends, and freelancing roadmaps from Digital Skills House.";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Blog,
});
