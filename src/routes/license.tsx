import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JSX page
import License from "../pages/License/License";

const title = "License & Attributions — Digital Skills House";
const description =
  "Learn about the open licenses and attributions for resources used across Digital Skills House platforms.";

export const Route = createFileRoute("/license")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: License,
});
