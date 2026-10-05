import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Home from "../pages/Home/Home";

const title = "Digital Skills House — Premier IT Institute & Software Agency in Multan";
const description =
  "Digital Skills House offers professional IT training and digital services in Web Development, SEO, Digital Marketing, Mobile App Development, and WordPress. FBR & PSEB registered.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Home,
});
