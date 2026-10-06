import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import AdminTeam from "../admin/team";

export const Route = createFileRoute("/adminpanel/team")({
  component: AdminTeam,
});
