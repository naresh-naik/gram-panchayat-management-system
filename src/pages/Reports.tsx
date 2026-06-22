import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Shield, IndianRupee, MessageSquare, TrendingUp, PieChart } from "lucide-react";

export default function Reports() {
  const { data: stats } = trpc.report.getDashboardStats.useQuery();
  const { data: demographics } = trpc.report.getDemographics.useQuery();
  const { data: schemeUtil } = trpc.report.getSchemeUtilization.useQuery();
  const { data: taxTrend } = trpc.report.getTaxCollectionTrend.useQuery();

  const maxTax = Math.max(...(taxTrend?.map(t => t.collected) ?? [1]), 1);

  const ageColors = ["bg-blue-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-purple-400"];
  const genderColors: Record<string, string> = { male: "bg-blue-400", female: "bg-pink-400", other: "bg-gray-400" };

  const totalCitizens = Object.values(demographics?.gender ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-serif text-[var(--gp-text)] mb-6">Government Reports & Analytics</h1>

          {/* Stats Overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Total Citizens</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">{stats?.totalCitizens ?? 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Active Schemes</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">{stats?.activeSchemes ?? 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-600" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Total Revenue</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">Rs. {((stats?.totalRevenue ?? 0) / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><IndianRupee className="w-5 h-5 text-amber-600" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Grievances</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">{stats?.totalGrievances ?? 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-rose-600" /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Demographics - Age Groups */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[var(--gp-primary)]" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(demographics?.ageGroups && Object.entries(demographics.ageGroups).map(([age, count], i) => (
                    <div key={age}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--gp-text)]">{age} years</span>
                        <span className="text-sm text-[var(--gp-text-muted)]">{count} ({totalCitizens > 0 ? ((count / totalCitizens) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="h-2.5 bg-[var(--gp-bg-secondary)] rounded-full overflow-hidden">
                        <div className={`h-full ${ageColors[i]} rounded-full`} style={{ width: `${totalCitizens > 0 ? (count / totalCitizens) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))) || <p className="text-sm text-[var(--gp-text-muted)] text-center py-4">No data</p>}
                </div>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--gp-primary)]" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(demographics?.gender && Object.entries(demographics.gender).map(([gender, count]) => (
                    <div key={gender}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--gp-text)] capitalize">{gender}</span>
                        <span className="text-sm text-[var(--gp-text-muted)]">{count} ({totalCitizens > 0 ? ((count / totalCitizens) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="h-2.5 bg-[var(--gp-bg-secondary)] rounded-full overflow-hidden">
                        <div className={`h-full ${genderColors[gender] ?? "bg-gray-400"} rounded-full`} style={{ width: `${totalCitizens > 0 ? (count / totalCitizens) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))) || <p className="text-sm text-[var(--gp-text-muted)] text-center py-4">No data</p>}
                </div>
                {/* Category Pie */}
                <div className="mt-6 pt-4 border-t border-[var(--gp-border)]">
                  <p className="text-sm font-medium text-[var(--gp-text)] mb-3">Category Distribution</p>
                  <div className="flex flex-wrap gap-3">
                    {demographics?.category && Object.entries(demographics.category).map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--gp-primary)]" />
                        <span className="text-xs text-[var(--gp-text-secondary)]">{cat}: {count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scheme Utilization */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--gp-primary)]" />
                Scheme Utilization Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--gp-bg-secondary)] text-xs uppercase tracking-wider text-[var(--gp-text-secondary)]">
                      <th className="text-left p-3 font-semibold">Scheme Name</th>
                      <th className="text-left p-3 font-semibold">Category</th>
                      <th className="text-left p-3 font-semibold">Budget</th>
                      <th className="text-left p-3 font-semibold">Utilized</th>
                      <th className="text-left p-3 font-semibold">%</th>
                      <th className="text-left p-3 font-semibold">Beneficiaries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemeUtil?.map((s) => (
                      <tr key={s.id} className="border-t border-[var(--gp-border)] hover:bg-[var(--gp-bg)] transition-colors">
                        <td className="p-3 font-medium text-[var(--gp-text)]">{s.name}</td>
                        <td className="p-3 capitalize text-[var(--gp-text-secondary)]">{s.category}</td>
                        <td className="p-3 text-[var(--gp-text-secondary)]">Rs. {(s.budget / 100000).toFixed(1)}L</td>
                        <td className="p-3 text-[var(--gp-text-secondary)]">Rs. {(s.utilized / 100000).toFixed(1)}L</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[var(--gp-bg-secondary)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--gp-accent)] rounded-full" style={{ width: `${Math.min(s.percentage, 100)}%` }} />
                            </div>
                            <span className="text-xs text-[var(--gp-text-muted)]">{s.percentage}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-[var(--gp-text-secondary)]">{s.beneficiaries}</td>
                      </tr>
                    )) ?? <tr><td colSpan={6} className="p-6 text-center text-[var(--gp-text-muted)]">No data</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tax Collection Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[var(--gp-primary)]" />
                Monthly Tax Collection vs Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-56">
                {taxTrend?.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] text-[var(--gp-text-muted)]">
                      {item.collected > 0 ? `Rs.${(item.collected / 1000).toFixed(0)}K` : ""}
                    </div>
                    <div className="w-full flex flex-col gap-0.5">
                      <div
                        className="w-full bg-emerald-400 rounded-t-sm"
                        style={{
                          height: `${maxTax > 0 ? (item.collected / maxTax) * 140 : 0}px`,
                          minHeight: item.collected > 0 ? "4px" : "0",
                        }}
                      />
                      <div
                        className="w-full bg-[var(--gp-bg-secondary)] rounded-none"
                        style={{
                          height: `${maxTax > 0 ? ((item.target - item.collected) / maxTax) * 140 : 0}px`,
                          minHeight: item.collected < item.target ? "4px" : "0",
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--gp-text-muted)]">{item.month}</div>
                  </div>
                )) ?? <p className="text-sm text-[var(--gp-text-muted)] text-center py-4 w-full">No data</p>}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--gp-border)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded" />
                  <span className="text-xs text-[var(--gp-text-muted)]">Collected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[var(--gp-bg-secondary)] rounded" />
                  <span className="text-xs text-[var(--gp-text-muted)]">Remaining Target</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
