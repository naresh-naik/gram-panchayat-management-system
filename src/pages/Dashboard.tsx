import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Shield, FileText, PieChart, TrendingUp, AlertCircle, Calendar, ArrowRight, Sparkles,
  CheckCircle, Clock, Activity
} from "lucide-react";
import { useNavigate } from "react-router";
import { navigateWithLocalLocation } from "@/lib/locationNavigation";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "citizen";

  const { data: stats } = trpc.report.getDashboardStats.useQuery();
  const { data: recentGrievances } = trpc.grievance.list.useQuery({ limit: 5 });
  const { data: recentMeetings } = trpc.meeting.list.useQuery({ limit: 5 });

  const statCards = [
    { label: "Total Citizens", value: stats?.totalCitizens ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Schemes", value: stats?.activeSchemes ?? 0, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Enrollments", value: stats?.activeEnrollments ?? 0, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Revenue", value: `Rs. ${((stats?.totalRevenue ?? 0) / 100000).toFixed(1)}L`, icon: PieChart, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const quickActions = [
    { label: "Add Citizen", icon: Users, path: "/records", roles: ["admin", "secretary"] },
    { label: "New Scheme", icon: Shield, path: "/schemes", roles: ["admin", "secretary"] },
    { label: "Smart Services", icon: Sparkles, path: "/smart-services", roles: ["admin", "secretary", "citizen", "monitor"] },
    { label: "Schedule Meeting", icon: Calendar, path: "/meetings", roles: ["admin", "secretary"] },
    { label: "View Reports", icon: TrendingUp, path: "/reports", roles: ["admin", "monitor"] },
    { label: "View Finances", icon: PieChart, path: "/finances", roles: ["admin", "secretary", "monitor"] },
    { label: "File Grievance", icon: AlertCircle, path: "/grievances", roles: ["admin", "secretary", "citizen"] },
  ];

  const visibleActions = quickActions.filter((a) => a.roles.includes(role));

  const statusColors: Record<string, string> = {
    submitted: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    assigned: "bg-purple-100 text-purple-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-[var(--gp-text)]">
              {role === "admin" && "Administrator Dashboard"}
              {role === "secretary" && "Secretary Dashboard"}
              {role === "citizen" && "Citizen Dashboard"}
              {role === "monitor" && "Government Monitor Dashboard"}
            </h1>
            <p className="text-[var(--gp-text-secondary)] mt-1">
              Welcome back, {user?.name}. Here's what's happening in your village.
            </p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-mono font-medium text-[var(--gp-text)]">{stat.value}</p>
                      <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium mt-1">{stat.label}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--gp-text)] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {visibleActions.map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => navigateWithLocalLocation(navigate, action.path)}
                  className="flex flex-col items-center gap-2 h-auto py-5 border-[var(--gp-border)] hover:bg-[var(--gp-bg-secondary)] hover:border-[var(--gp-primary)]"
                >
                  <action.icon className="w-5 h-5 text-[var(--gp-primary)]" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Grievances */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[var(--gp-accent)]" />
                    Recent Grievances
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateWithLocalLocation(navigate, "/grievances")}
                    className="text-[var(--gp-accent)]"
                  >
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentGrievances?.items?.slice(0, 5).map((g) => (
                    <div key={g.id} className="flex items-center justify-between p-3 bg-[var(--gp-bg)] rounded-lg">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--gp-text)] truncate">{g.subject}</p>
                        <p className="text-xs text-[var(--gp-text-muted)]">{g.referenceNumber}</p>
                      </div>
                      <Badge className={`${statusColors[g.status] ?? ""} text-xs capitalize shrink-0`}>
                        {g.status.replace("_", " ")}
                      </Badge>
                    </div>
                  )) ?? (
                    <p className="text-sm text-[var(--gp-text-muted)] text-center py-4">No grievances found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--gp-primary)]" />
                    Upcoming Meetings
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateWithLocalLocation(navigate, "/meetings")}
                    className="text-[var(--gp-accent)]"
                  >
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMeetings?.items?.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-[var(--gp-bg)] rounded-lg">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--gp-text)] truncate">{m.title}</p>
                        <p className="text-xs text-[var(--gp-text-muted)]">
                          {m.date ? new Date(m.date).toLocaleDateString() : ""} at {m.location}
                        </p>
                      </div>
                      <Badge className={`${statusColors[m.status] ?? ""} text-xs capitalize shrink-0`}>
                        {m.status}
                      </Badge>
                    </div>
                  )) ?? (
                    <p className="text-sm text-[var(--gp-text-muted)] text-center py-4">No meetings scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Log - Admin Only */}
          {role === "admin" && (
            <Card className="border-0 shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[var(--gp-primary)]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "New citizen registered", user: "Sunita Devi", time: "2 hours ago", type: "success" },
                    { action: "Scheme enrollment approved", user: "Ramesh Kumar", time: "4 hours ago", type: "success" },
                    { action: "Tax payment recorded", user: "Sunita Devi", time: "6 hours ago", type: "info" },
                    { action: "Meeting minutes updated", user: "Ramesh Kumar", time: "1 day ago", type: "info" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[var(--gp-bg)] rounded-lg">
                      {activity.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--gp-text)]">{activity.action}</p>
                      </div>
                      <p className="text-xs text-[var(--gp-text-muted)] shrink-0">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
