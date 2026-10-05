import { createFileRoute, useParams } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import BlogDetails from "../pages/BlogDetails/BlogDetails";

const title = "Blog Article Details — Digital Skills House & Colabify";
const description =
  "In-depth technical guides, SEO strategies, mobile development insights, and enterprise architecture solutions.";

export const Route = createFileRoute("/blog-details/$id")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: BlogArticleDetails,
});

function BlogArticleDetails() {
  const { id } = useParams({ from: "/blog-details/$id" });
  return <BlogDetails articleId={id || 1} />;
}
