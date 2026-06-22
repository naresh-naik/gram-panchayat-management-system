import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DemoRole = "admin" | "secretary" | "monitor" | "citizen";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation({
    onSuccess: async (user) => {
      if (import.meta.env.DEV) {
        localStorage.setItem("gp-demo-role", user.role);
        localStorage.setItem("gp-demo-user", JSON.stringify(user));
      }
      await utils.invalidate();
      navigate("/dashboard");
    },
  });

  const continueAs = (role: DemoRole) => {
    const demoUsers: Record<DemoRole, { name: string; email: string }> = {
      admin: { name: "Ramesh Kumar", email: "admin@grampanchayat.gov.in" },
      secretary: { name: "Sunita Devi", email: "secretary@grampanchayat.gov.in" },
      monitor: { name: "Mohan Singh", email: "monitor@gov.in" },
      citizen: { name: "Anita Sharma", email: "citizen@example.in" },
    };
    localStorage.setItem("gp-demo-role", role);
    localStorage.setItem("gp-demo-user", JSON.stringify({
      id: role === "admin" ? 1 : role === "secretary" ? 2 : role === "monitor" ? 3 : 4,
      role,
      unionId: `local-${role}`,
      passwordHash: null,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
      ...demoUsers[role],
    }));
    utils.invalidate().finally(() => navigate("/dashboard"));
  };

  const submitLogin = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[var(--gp-bg)] flex-col justify-center items-center px-16">
        <div className="w-20 h-20 rounded-full bg-[var(--gp-primary)] flex items-center justify-center mb-6">
          <Landmark className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-serif text-[var(--gp-primary)] text-center mb-4">
          Welcome Back
        </h2>
        <p className="text-base text-[var(--gp-text-secondary)] text-center max-w-sm mb-12">
          Access your Gram Panchayat dashboard and manage village records.
        </p>
        <div className="w-72 h-48 bg-gradient-to-br from-[var(--gp-primary)] to-[var(--gp-primary-light)] rounded-xl flex items-center justify-center opacity-80">
          <Landmark className="w-24 h-24 text-white/30" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white px-8 sm:px-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-full bg-[var(--gp-primary)] flex items-center justify-center mx-auto mb-4">
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-serif text-[var(--gp-primary)]">Welcome Back</h2>
          </div>

          <h3 className="text-xl font-semibold text-[var(--gp-text)] mb-1 text-center lg:text-left">Sign In</h3>
          <p className="text-sm text-[var(--gp-text-secondary)] mb-8 text-center lg:text-left">
            Enter your authorized Gram Panchayat account
          </p>

          <form onSubmit={submitLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)] text-white py-6 text-sm font-semibold rounded-lg"
            >
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
            {login.error && (
              <p className="text-sm text-[var(--gp-danger)]">{login.error.message}</p>
            )}
          </form>

          {import.meta.env.DEV && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--gp-border)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-[var(--gp-text-muted)]">local development roles</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["admin", "Admin"],
                  ["secretary", "Secretary"],
                  ["monitor", "Monitor"],
                  ["citizen", "Citizen"],
                ].map(([role, label]) => (
                  <Button
                    key={role}
                    variant="outline"
                    onClick={() => continueAs(role as DemoRole)}
                    className="border-[var(--gp-border)] text-[var(--gp-text)] hover:bg-[var(--gp-bg)] text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </>
          )}

          <p className="text-center text-xs text-[var(--gp-text-muted)] mt-8">
            Role-based access keeps administrative, monitoring, and public workflows separate.
          </p>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate("/register")} className="text-[var(--gp-primary)]">
              New citizen? Register here
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
