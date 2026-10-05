import { createFileRoute, useNavigate } from "@tanstack/react-router";
// @ts-expect-error - plain JSX component
import LoginView from "../login-view/LoginView";

const title = "Admin Login & Sign Up — Digital Skill House";
const description = "Sign in or register for the Digital Skill House Administration Control Panel.";

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      <LoginView onClose={() => { navigate({ to: "/admin" }); }} />
    </div>
  );
}

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LoginPage,
});
