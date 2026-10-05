import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import AdminProjects from "../pages/adminpanel/projects";

const title = "Manage Projects — Admin Panel";
const description = "Manage live portfolio websites, categories, and API links.";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
    ],
  }),
  component: AdminProjects,
});
