import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Search } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.user.list.useQuery({
    search: search || undefined,
    role: role === "all" ? undefined : role as "admin" | "secretary" | "citizen" | "monitor",
    status: status === "all" ? undefined : status as "pending" | "active" | "suspended",
    limit: 50,
  });
  const updateStatus = trpc.user.updateStatus.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-serif text-[var(--gp-text)]">User Management</h1>
              <p className="text-sm text-[var(--gp-text-secondary)] mt-1">
                Verify citizen registrations and control account access.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gp-text-muted)]" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="citizen">Citizen</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--gp-primary)]" />
                Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--gp-bg-secondary)] text-xs uppercase tracking-wider text-[var(--gp-text-secondary)]">
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Role</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-[var(--gp-text-secondary)]">
                          Loading accounts...
                        </td>
                      </tr>
                    )}
                    {!isLoading && data?.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-[var(--gp-text-secondary)]">
                          No accounts match the selected filters.
                        </td>
                      </tr>
                    )}
                    {!isLoading && data?.items.map((user) => {
                      const isCurrentUser = currentUser?.id === user.id;
                      return (
                        <tr key={user.id} className="border-t border-[var(--gp-border)] hover:bg-[var(--gp-bg)]">
                          <td className="p-3 font-medium text-[var(--gp-text)]">{user.name}</td>
                          <td className="p-3 text-[var(--gp-text-secondary)]">{user.email}</td>
                          <td className="p-3 capitalize text-[var(--gp-text-secondary)]">{user.role}</td>
                          <td className="p-3">
                            <Badge className={`${statusColors[user.status] ?? ""} capitalize`}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {user.status !== "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updateStatus.isPending}
                                  onClick={() => updateStatus.mutate({ id: user.id, status: "active" })}
                                >
                                  Approve
                                </Button>
                              )}
                              {user.status !== "suspended" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updateStatus.isPending || isCurrentUser}
                                  className="text-[var(--gp-danger)]"
                                  onClick={() => updateStatus.mutate({ id: user.id, status: "suspended" })}
                                >
                                  Suspend
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
