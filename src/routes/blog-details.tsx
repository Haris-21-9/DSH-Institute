import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import BlogDetails from "../pages/BlogDetails/BlogDetails";

const title = "Blog Article Details — Digital Skills House & Colabify";
const description =
  "In-depth technical guides, SEO strategies, mobile development insights, and enterprise architecture solutions.";

export const Route = createFileRoute("/blog-details")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <BlogDetails articleId={1} />,
});
