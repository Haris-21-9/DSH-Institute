import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import AdminBlog from "../pages/adminpanel/blog";

const title = "Manage Blog Articles — Admin Panel";
const description = "Manage editorial articles, insights, and publications.";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
    ],
  }),
  component: AdminBlog,
});
