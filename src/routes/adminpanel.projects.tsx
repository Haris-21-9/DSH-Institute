import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import AdminProjects from "../pages/adminpanel/projects";

export const Route = createFileRoute("/adminpanel/projects")({
  component: AdminProjects,
});
