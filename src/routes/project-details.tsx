import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import ProjectDetails from "../pages/ProjectDetails/ProjectDetails";

const title = "Project Details — Colabify Consulting";
const description =
  "Detailed information about our completed projects, showcasing our expertise and commitment to excellence.";

export const Route = createFileRoute("/project-details")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProjectDetails,
});
