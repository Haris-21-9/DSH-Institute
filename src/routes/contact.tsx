import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import Contact from "../pages/Contact/Contact";

const title = "Contact Digital Skills House — Admissions & Project Inquiries";
const description =
  "Get in touch with Digital Skills House for course admissions, software engineering inquiries, and corporate training programs.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Contact,
});
