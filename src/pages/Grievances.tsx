import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-700",
  under_review: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};



export default function Grievances() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "secretary";
  const [searchRef, setSearchRef] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: grievancesData, refetch } = trpc.grievance.list.useQuery(
    activeTab === "all" ? { limit: 20 } : { status: activeTab, limit: 20 }
  );

  const { data: trackedGrievance } = trpc.grievance.getByRef.useQuery(
    { referenceNumber: searchRef },
    { enabled: searchRef.length >= 5 }
  );

  const updateStatus = trpc.grievance.updateStatus.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-serif text-[var(--gp-text)] mb-6">Grievances</h1>

          {/* Track Grievance */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-[var(--gp-accent)]" />
                Track Your Grievance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter reference number (e.g., GRV-ABC123)"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="max-w-md"
                />
              </div>
              {trackedGrievance && (
                <div className="mt-4 p-4 bg-[var(--gp-bg)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[var(--gp-text)]">{trackedGrievance.subject}</h4>
                    <Badge className={`${statusColors[trackedGrievance.status] ?? ""} text-xs capitalize`}>
                      {trackedGrievance.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--gp-text-secondary)] mb-3">{trackedGrievance.description}</p>
                  <p className="text-xs text-[var(--gp-text-muted)]">Ref: {trackedGrievance.referenceNumber}</p>
                  {trackedGrievance.resolution && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-green-700">Resolution</p>
                      <p className="text-sm text-green-600">{trackedGrievance.resolution}</p>
                    </div>
                  )}
                </div>
              )}
              {searchRef.length >= 5 && !trackedGrievance && (
                <p className="mt-4 text-sm text-[var(--gp-text-muted)]">No grievance found with this reference number.</p>
              )}
            </CardContent>
          </Card>

          {/* Grievances List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="under_review">Under Review</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="space-y-3">
                {grievancesData?.items?.map((g) => (
                  <Card key={g.id} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--gp-bg-secondary)] flex items-center justify-center shrink-0">
                          <AlertCircle className="w-5 h-5 text-[var(--gp-accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[var(--gp-text)]">{g.subject}</h4>
                            <Badge className={`${statusColors[g.status] ?? ""} text-xs capitalize`}>
                              {g.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">{g.category.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm text-[var(--gp-text-secondary)] mb-2">{g.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--gp-text-muted)]">
                            <span>Ref: {g.referenceNumber}</span>
                            <span>By: {g.citizen?.fullName ?? "Unknown"}</span>
                            <span>{g.createdAt ? new Date(g.createdAt).toLocaleDateString() : ""}</span>
                          </div>
                          {g.resolution && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <p className="text-xs font-medium text-green-700">Resolution</p>
                              <p className="text-sm text-green-600">{g.resolution}</p>
                            </div>
                          )}
                        </div>
                        {canManage && g.status !== "resolved" && g.status !== "rejected" && (
                          <div className="flex gap-2 shrink-0">
                            {g.status === "submitted" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus.mutate({ id: g.id, status: "under_review" })}
                              >
                                Review
                              </Button>
                            )}
                            {g.status === "under_review" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus.mutate({ id: g.id, status: "assigned" })}
                              >
                                Assign
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="bg-[var(--gp-success)] hover:bg-green-700"
                              onClick={() => {
                                const resolution = prompt("Enter resolution:");
                                if (resolution) updateStatus.mutate({ id: g.id, status: "resolved", resolution });
                              }}
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )) ?? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-10 text-center text-[var(--gp-text-muted)]">
                      No grievances found in this category.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
