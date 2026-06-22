import { LOGIN_PATH } from "@/const";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@db/schema";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

type Role = User["role"];

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: Role[];
};

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--gp-text-muted)]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[var(--gp-bg)] flex items-center justify-center p-6">
        <div className="max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-[var(--gp-text)]">Access restricted</h1>
          <p className="mt-2 text-sm text-[var(--gp-text-secondary)]">
            Your account does not have permission to view this section.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
