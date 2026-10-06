import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Admin from "../admin/admin";

export const Route = createFileRoute("/adminpanel/")({
  component: Admin,
});
