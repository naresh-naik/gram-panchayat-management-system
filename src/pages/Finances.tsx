import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, TrendingDown, IndianRupee, AlertTriangle } from "lucide-react";

export default function Finances() {
  const { data: overview } = trpc.finance.getOverview.useQuery();
  const { data: taxRecords } = trpc.finance.listTaxRecords.useQuery({ limit: 10 });
  const { data: expenditure } = trpc.finance.getExpenditureBreakdown.useQuery();
  const { data: revenueTrend } = trpc.finance.getRevenueTrend.useQuery();

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  const maxRevenue = Math.max(...(revenueTrend?.map(r => r.amount) ?? [1]));

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-serif text-[var(--gp-text)] mb-6">Financial Management</h1>

          {/* Overview Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Total Revenue</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">
                      Rs. {((overview?.totalRevenue ?? 0) / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Total Expenditure</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">
                      Rs. {((overview?.totalExpenditure ?? 0) / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Balance</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">
                      Rs. {((overview?.balance ?? 0) / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Pending Collections</p>
                    <p className="text-2xl font-mono font-medium text-[var(--gp-text)] mt-1">
                      Rs. {((overview?.pendingCollections ?? 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Expenditure Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Expenditure Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenditure?.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--gp-text)] capitalize">{item.category}</span>
                        <span className="text-sm text-[var(--gp-text-muted)]">
                          Rs. {(item.amount / 100000).toFixed(1)}L ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-[var(--gp-bg-secondary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--gp-primary)] rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  )) ?? <p className="text-sm text-[var(--gp-text-muted)] text-center py-4">No data available</p>}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trend Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {revenueTrend?.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] text-[var(--gp-text-muted)]">
                        {item.amount > 0 ? `Rs.${(item.amount / 1000).toFixed(0)}K` : ""}
                      </div>
                      <div
                        className="w-full bg-[var(--gp-accent)] rounded-t-sm transition-all"
                        style={{
                          height: `${maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0}%`,
                          minHeight: item.amount > 0 ? "4px" : "0",
                        }}
                      />
                      <div className="text-[10px] text-[var(--gp-text-muted)]">{item.month}</div>
                    </div>
                  )) ?? <p className="text-sm text-[var(--gp-text-muted)] text-center py-4 w-full">No data</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tax Records Table */}
          <Card className="border-0 shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Property Tax Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--gp-bg-secondary)] text-xs uppercase tracking-wider text-[var(--gp-text-secondary)]">
                      <th className="text-left p-3 font-semibold">Property ID</th>
                      <th className="text-left p-3 font-semibold">Owner</th>
                      <th className="text-left p-3 font-semibold">Type</th>
                      <th className="text-left p-3 font-semibold">Area</th>
                      <th className="text-left p-3 font-semibold">Assessed Value</th>
                      <th className="text-left p-3 font-semibold">Tax Amount</th>
                      <th className="text-left p-3 font-semibold">Due Date</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRecords?.items?.map((tax) => (
                      <tr key={tax.id} className="border-t border-[var(--gp-border)] hover:bg-[var(--gp-bg)] transition-colors">
                        <td className="p-3 font-mono text-[var(--gp-text-muted)]">{tax.propertyId}</td>
                        <td className="p-3 font-medium text-[var(--gp-text)]">{tax.citizen?.fullName ?? "-"}</td>
                        <td className="p-3 capitalize text-[var(--gp-text-secondary)]">{tax.propertyType}</td>
                        <td className="p-3 text-[var(--gp-text-secondary)]">{tax.area} sq.ft</td>
                        <td className="p-3 text-[var(--gp-text-secondary)]">Rs. {parseFloat(tax.assessedValue).toLocaleString()}</td>
                        <td className="p-3 font-medium text-[var(--gp-text)]">Rs. {parseFloat(tax.taxAmount).toLocaleString()}</td>
                        <td className="p-3 text-[var(--gp-text-secondary)]">{tax.dueDate ? new Date(tax.dueDate).toLocaleDateString() : "-"}</td>
                        <td className="p-3"><Badge className={`${statusColors[tax.status] ?? ""} text-xs capitalize`}>{tax.status}</Badge></td>
                      </tr>
                    ))}
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
