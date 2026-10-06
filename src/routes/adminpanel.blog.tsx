import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import AdminBlog from "../admin/blog";

export const Route = createFileRoute("/adminpanel/blog")({
  component: AdminBlog,
});
