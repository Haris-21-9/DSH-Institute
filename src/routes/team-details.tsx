import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import TeamDetails from "../pages/TeamDetails/TeamDetails";

const title = "Team Details — Colabify Consulting";
const description =
  "Get to know the talented professionals who drive our success and deliver exceptional results for our clients.";

export const Route = createFileRoute("/team-details")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <TeamDetails memberId={1} />,
});
