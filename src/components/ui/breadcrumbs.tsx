import { Link, useLocation, matchPath } from "react-router-dom";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href: string };

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/attendance": "Attendance",
  "/records": "Records",
  "/students": "Students",
  "/schedule": "Schedule",
  "/take-attendance": "Take Attendance",
  "/accounts": "Accounts",
  "/excuse-application": "Excuse Application",
  "/academic-year": "Academic Year",
  "/profile": "Profile",
};

const dynamicRoutes: Array<{ pattern: string; label: (params: Record<string, string>) => string }> = [
  { pattern: "/sessions/:sessionId/students", label: () => "Session Students" },
  { pattern: "/take-attendance/:sessionId", label: () => "Take Attendance" },
];

export const Breadcrumbs = () => {
  const location = useLocation();

  const buildCrumbs = (): Crumb[] => {
    const pathnames = location.pathname.split("/").filter(Boolean);
    if (pathnames.length === 0) return [{ label: routeLabels["/"], href: "/" }];

    const crumbs: Crumb[] = [{ label: routeLabels["/"], href: "/" }];

    let accumulated = "";
    for (let i = 0; i < pathnames.length; i++) {
      accumulated += `/${pathnames[i]}`;

      // Exact label
      const exact = routeLabels[accumulated];
      if (exact) {
        crumbs.push({ label: exact, href: accumulated });
        continue;
      }

      // Dynamic label
      const dyn = dynamicRoutes.find((r) => matchPath({ path: r.pattern, end: false }, accumulated));
      if (dyn) {
        const m = matchPath({ path: dyn.pattern, end: false }, accumulated);
        const label = dyn.label((m?.params as Record<string, string>) || {});
        crumbs.push({ label, href: accumulated });
        continue;
      }

      // Fallback
      const pretty = pathnames[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({ label: pretty, href: accumulated });
    }

    return crumbs;
  };

  const crumbs = buildCrumbs();

  return (
    <nav aria-label="Breadcrumb" className="mb-2" role="navigation">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center">
              {idx > 0 && <ChevronRight className="w-3 h-3 mx-1 text-muted-foreground/60" aria-hidden="true" />}
              {isLast ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.href} className="hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm px-0.5">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

