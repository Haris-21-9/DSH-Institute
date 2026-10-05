import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Admin from "../pages/adminpanel/admin";

const title = "Admin Dashboard — Colabify / Digital Skills House";
const description =
  "Overview of live portfolio projects, team members, blog articles, and system settings.";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
    ],
  }),
  component: Admin,
});
