import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Projects from "../pages/Projects/Projects";

const title = "Projects — Digital Skills House Live Portfolio & Case Studies";
const description =
  "Explore live websites, web applications, and digital platforms built by Digital Skills House engineers and students.";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Projects,
});
