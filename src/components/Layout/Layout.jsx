import { useRouterState } from "@tanstack/react-router";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Layout.css";

export default function Layout({ children }) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="admin-root-wrapper">{children}</main>;
  }

  return (
    <div className="layout">
      <Header />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  );
}
