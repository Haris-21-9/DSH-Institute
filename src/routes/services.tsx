import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import ServicesPage from "../pages/Services/ServicesPage";

const title = "Services — Digital Skills House & Colabify IT Capabilities";
const description =
  "Comprehensive software, web development, SEO optimization, mobile apps, digital marketing, and custom ERP systems engineered for business growth.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ServicesPage,
});
