import { useState } from "react";
import { useNavigate } from "react-router";
import { Landmark } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [formError, setFormError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const register = trpc.auth.registerCitizen.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      setSubmittedEmail(form.email);
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (!form.consent) {
      setFormError("Please accept the citizen data declaration");
      return;
    }

    register.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
    });
  };

  if (submittedEmail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[var(--gp-primary)] flex items-center justify-center mx-auto mb-4">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-serif text-[var(--gp-primary)]">Registration Submitted</h1>
          <p className="text-sm text-[var(--gp-text-secondary)] mt-3">
            Your citizen account request for {submittedEmail} has been sent for administrator verification.
          </p>
          <p className="text-sm text-[var(--gp-text-secondary)] mt-3">
            You can login after the Gram Panchayat office approves your account.
          </p>
          <Button onClick={() => navigate("/login")} className="mt-6 bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)] text-white">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[var(--gp-primary)] flex items-center justify-center mx-auto mb-4">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-serif text-[var(--gp-primary)]">Citizen Registration</h1>
          <p className="text-sm text-[var(--gp-text-secondary)] mt-2">
            Create a citizen account to access village services and track requests.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="new-password"
              minLength={12}
              required
            />
            <p className="text-xs text-[var(--gp-text-muted)]">Use at least 12 characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              autoComplete="new-password"
              minLength={12}
              required
            />
          </div>
          <label className="flex items-start gap-3 text-sm text-[var(--gp-text-secondary)]">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => setForm({ ...form, consent: event.target.checked })}
              className="mt-1"
            />
            <span>
              I confirm that the information submitted is correct and may be verified by the Gram Panchayat office for citizen services.
            </span>
          </label>

          {(formError || register.error) && (
            <p className="text-sm text-[var(--gp-danger)]">
              {formError || register.error?.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={register.isPending}
            className="w-full bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)] text-white py-6"
          >
            {register.isPending ? "Creating account..." : "Create Citizen Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => navigate("/login")} className="text-[var(--gp-primary)]">
            Already have an account? Login
          </Button>
        </div>
      </div>
    </div>
  );
}
