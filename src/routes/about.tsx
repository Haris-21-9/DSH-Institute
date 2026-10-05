import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import About from "../pages/About/About";

const title = "About Digital Skills House — Top IT Institute & Agency in Multan";
const description =
  "Digital Skills House is an FBR & PSEB registered IT institute and digital agency providing practical training in Web Development, SEO, Mobile Apps, and Digital Marketing.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: About,
});
