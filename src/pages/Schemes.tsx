import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Search, IndianRupee, Calendar } from "lucide-react";

const categoryColors: Record<string, string> = {
  education: "bg-blue-100 text-blue-700",
  health: "bg-rose-100 text-rose-700",
  agriculture: "bg-amber-100 text-amber-700",
  housing: "bg-emerald-100 text-emerald-700",
  pension: "bg-purple-100 text-purple-700",
  sanitation: "bg-cyan-100 text-cyan-700",
  others: "bg-gray-100 text-gray-700",
};

export default function Schemes() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "secretary";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data } = trpc.scheme.list.useQuery({
    search: search || undefined,
    category: category === "all" ? undefined : category,
    page,
    limit: 9,
  });

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-serif text-[var(--gp-text)]">Welfare Schemes</h1>
            <div className="flex items-center gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {["education", "health", "agriculture", "housing", "pension", "sanitation", "others"].map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gp-text-muted)]" />
                <Input placeholder="Search schemes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
              </div>
              {canEdit && (
                <Button size="sm" className="bg-[var(--gp-accent)] hover:bg-[var(--gp-accent-hover)]">
                  <Shield className="w-4 h-4 mr-1" /> New Scheme
                </Button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map((scheme) => {
              const budget = parseFloat(scheme.budget);
              const utilized = parseFloat(scheme.utilizedBudget ?? "0");
              const percentage = budget > 0 ? Math.round((utilized / budget) * 100) : 0;
              const beneficiaryCount = scheme.enrollments?.length ?? 0;

              return (
                <Card key={scheme.id} className="border-0 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden">
                  <div className={`h-2 ${categoryColors[scheme.category]?.split(" ")[0].replace("bg-", "bg-") ?? "bg-gray-400"}`} style={{ backgroundColor: "var(--gp-primary)" }} />
                  <CardContent className="p-6">
                    <Badge className={`${categoryColors[scheme.category] ?? ""} text-xs capitalize mb-3`}>
                      {scheme.category}
                    </Badge>
                    <h3 className="font-semibold text-lg text-[var(--gp-text)] mb-2">{scheme.name}</h3>
                    <p className="text-sm text-[var(--gp-text-secondary)] line-clamp-3 leading-relaxed mb-4">
                      {scheme.description}
                    </p>
                    <div className="h-1.5 bg-[var(--gp-bg-secondary)] rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-[var(--gp-accent)] rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--gp-text-muted)] mb-4">
                      <span>{percentage}% utilized</span>
                      <span>{beneficiaryCount} enrolled</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--gp-border)]">
                      <div className="flex items-center gap-1 text-xs text-[var(--gp-text-muted)]">
                        <IndianRupee className="w-3 h-3" />
                        {(budget / 100000).toFixed(1)}L budget
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--gp-text-muted)]">
                        <Calendar className="w-3 h-3" />
                        {scheme.startDate ? new Date(scheme.startDate).getFullYear() : ""}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--gp-border)]">
              <p className="text-xs text-[var(--gp-text-muted)]">
                Page {page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
