import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import AdminTeam from "../pages/adminpanel/team";

const title = "Manage Team — Admin Panel";
const description = "Manage engineering team members, roles, and skills.";

export const Route = createFileRoute("/admin/team")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
    ],
  }),
  component: AdminTeam,
});
