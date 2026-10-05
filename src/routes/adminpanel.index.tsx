import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Admin from "../pages/adminpanel/admin";

export const Route = createFileRoute("/adminpanel/")({
  component: Admin,
});
