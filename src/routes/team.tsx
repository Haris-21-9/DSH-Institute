import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Team from "../pages/Team/Team";

const title = "Team — Digital Skills House Instructors & Domain Leads";
const description =
  "Meet the Digital Skills House certified instructors and technical leads specializing in Web Development, SEO, Mobile Apps, and Digital Marketing.";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Team,
});
