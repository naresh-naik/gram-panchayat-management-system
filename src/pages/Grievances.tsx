import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  Download,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const statusColors: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-700",
  under_review: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-cyan-100 text-cyan-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const sourceColors: Record<string, string> = {
  web: "bg-emerald-100 text-emerald-700",
  whatsapp: "bg-green-100 text-green-700",
  office: "bg-stone-100 text-stone-700",
};

const categoryOptions = [
  "water",
  "roads",
  "electricity",
  "sanitation",
  "land_dispute",
  "welfare",
  "others",
] as const;

function label(value?: string | null) {
  return value ? value.replace(/_/g, " ") : "-";
}

function formatDate(value?: Date | string | null) {
  return value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "-";
}

export default function Grievances() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const canManage = user?.role === "admin" || user?.role === "secretary";
  const [searchRef, setSearchRef] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [complaintForm, setComplaintForm] = useState({
    citizenId: user?.role === "citizen" ? 8 : 1,
    category: "others",
    subject: "",
    description: "",
    ward: "Ward 2",
  });
  const [whatsAppForm, setWhatsAppForm] = useState({
    whatsappNumber: "9090909090",
    citizenName: "Farida Begum",
    ward: "Ward 4",
    message: "Drainage is blocked near the community hall and stagnant water is creating mosquito problem. Please treat this as urgent.",
  });

  const filters = useMemo(() => ({
    status: activeTab === "all" ? undefined : activeTab,
    source: sourceFilter === "all" ? undefined : sourceFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    search: search || undefined,
    limit: 30,
  }), [activeTab, sourceFilter, priorityFilter, search]);

  const { data: grievancesData, refetch } = trpc.grievance.list.useQuery(filters);
  const { data: trackedGrievance } = trpc.grievance.getByRef.useQuery(
    { referenceNumber: searchRef.trim() },
    { enabled: searchRef.trim().length >= 5 }
  );
  const exportCsv = trpc.grievance.exportCsv.useQuery(filters, { enabled: false });

  const invalidate = async () => {
    await utils.grievance.list.invalidate();
    await refetch();
  };

  const updateStatus = trpc.grievance.updateStatus.useMutation({ onSuccess: invalidate });
  const createComplaint = trpc.grievance.create.useMutation({
    onSuccess: (result) => {
      setFeedback(`Complaint registered with reference ${result.referenceNumber}.`);
      setComplaintForm((current) => ({ ...current, subject: "", description: "" }));
      void invalidate();
    },
  });
  const createWhatsApp = trpc.grievance.createWhatsApp.useMutation({
    onSuccess: (result) => {
      setFeedback(result.reply);
      void invalidate();
    },
  });

  const items = grievancesData?.items ?? [];
  const whatsappCount = items.filter((item) => item.source === "whatsapp").length;
  const urgentCount = items.filter((item) => item.priority === "critical" || item.priority === "high").length;
  const pendingCount = items.filter((item) => item.status !== "resolved" && item.status !== "rejected").length;
  const resolvedCount = items.filter((item) => item.status === "resolved").length;

  const handleCsvExport = async () => {
    const result = await exportCsv.refetch();
    if (!result.data) return;
    const blob = new Blob([result.data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grievance-register-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-serif text-[var(--gp-text)]">Complaint & Grievance Management</h1>
              <p className="text-sm text-[var(--gp-text-secondary)] mt-1">
                WhatsApp intake, automated triage, officer workflow, tracking, and exportable register.
              </p>
            </div>
            {canManage && (
              <Button variant="outline" onClick={handleCsvExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Open Cases", value: pendingCount, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "WhatsApp Cases", value: whatsappCount, icon: MessageCircle, color: "text-green-600", bg: "bg-green-50" },
              { label: "High Priority", value: urgentCount, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
              { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((stat) => (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-mono text-[var(--gp-text)]">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] mt-1">{stat.label}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {feedback && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {feedback}
            </div>
          )}

          <div className="grid xl:grid-cols-[1fr_420px] gap-6 mb-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Search className="w-5 h-5 text-[var(--gp-accent)]" />
                    Track by Reference Number
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Enter reference number, for example GRV-ABC123"
                    value={searchRef}
                    onChange={(event) => setSearchRef(event.target.value)}
                    className="max-w-md"
                  />
                  {trackedGrievance && (
                    <div className="mt-4 p-4 bg-[var(--gp-bg)] rounded-lg">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-[var(--gp-text)]">{trackedGrievance.subject}</h4>
                        <Badge className={`${statusColors[trackedGrievance.status] ?? ""} text-xs capitalize`}>
                          {label(trackedGrievance.status)}
                        </Badge>
                        <Badge className={`${priorityColors[trackedGrievance.priority ?? "medium"] ?? ""} text-xs capitalize`}>
                          {trackedGrievance.priority ?? "medium"}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--gp-text-secondary)]">{trackedGrievance.latestUpdate ?? trackedGrievance.description}</p>
                      <p className="text-xs text-[var(--gp-text-muted)] mt-2">
                        Ref: {trackedGrievance.referenceNumber} · SLA: {formatDate(trackedGrievance.slaDueAt)}
                      </p>
                    </div>
                  )}
                  {searchRef.trim().length >= 5 && !trackedGrievance && (
                    <p className="mt-4 text-sm text-[var(--gp-text-muted)]">No grievance found with this reference number.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[var(--gp-primary)]" />
                    File a Web Complaint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid sm:grid-cols-2 gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      createComplaint.mutate({
                        ...complaintForm,
                        category: complaintForm.category as (typeof categoryOptions)[number],
                        source: "web",
                      });
                    }}
                  >
                    <Input
                      type="number"
                      min={1}
                      value={complaintForm.citizenId}
                      onChange={(event) => setComplaintForm((current) => ({ ...current, citizenId: Number(event.target.value) }))}
                      placeholder="Citizen ID"
                    />
                    <Input
                      value={complaintForm.ward}
                      onChange={(event) => setComplaintForm((current) => ({ ...current, ward: event.target.value }))}
                      placeholder="Ward"
                    />
                    <Select
                      value={complaintForm.category}
                      onValueChange={(value) => setComplaintForm((current) => ({ ...current, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category} className="capitalize">{label(category)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={complaintForm.subject}
                      onChange={(event) => setComplaintForm((current) => ({ ...current, subject: event.target.value }))}
                      placeholder="Complaint subject"
                      required
                    />
                    <Textarea
                      value={complaintForm.description}
                      onChange={(event) => setComplaintForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Describe the issue"
                      className="sm:col-span-2 min-h-24"
                      required
                    />
                    <Button className="sm:col-span-2 bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)]">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Complaint
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  WhatsApp Webhook Test Console
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createWhatsApp.mutate(whatsAppForm);
                  }}
                >
                  <Input
                    value={whatsAppForm.whatsappNumber}
                    onChange={(event) => setWhatsAppForm((current) => ({ ...current, whatsappNumber: event.target.value }))}
                    placeholder="Registered WhatsApp number"
                    required
                  />
                  <Input
                    value={whatsAppForm.citizenName}
                    onChange={(event) => setWhatsAppForm((current) => ({ ...current, citizenName: event.target.value }))}
                    placeholder="Citizen name"
                  />
                  <Input
                    value={whatsAppForm.ward}
                    onChange={(event) => setWhatsAppForm((current) => ({ ...current, ward: event.target.value }))}
                    placeholder="Ward"
                  />
                  <Textarea
                    value={whatsAppForm.message}
                    onChange={(event) => setWhatsAppForm((current) => ({ ...current, message: event.target.value }))}
                    className="min-h-36"
                    placeholder="Paste a sample WhatsApp complaint message"
                    required
                  />
                  <Button className="w-full bg-green-700 hover:bg-green-800">
                    <Bot className="w-4 h-4 mr-2" />
                    Test Webhook Intake
                  </Button>
                </form>
                <div className="mt-4 rounded-lg bg-[var(--gp-bg)] p-4 text-sm text-[var(--gp-text-secondary)]">
                  In production, villagers send complaints to the official WhatsApp Business number and Meta posts them to
                  /api/whatsapp/webhook automatically. This console lets staff test the same intake flow from the website.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between mb-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="under_review">Under Review</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search register"
                className="sm:w-56"
              />
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value={activeTab}>
              <div className="space-y-3">
                {items.length > 0 ? items.map((g) => (
                  <Card key={g.id} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--gp-bg-secondary)] flex items-center justify-center shrink-0">
                          {g.source === "whatsapp" ? (
                            <MessageCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-[var(--gp-accent)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-[var(--gp-text)]">{g.subject}</h4>
                            <Badge className={`${statusColors[g.status] ?? ""} text-xs capitalize`}>{label(g.status)}</Badge>
                            <Badge className={`${priorityColors[g.priority ?? "medium"] ?? ""} text-xs capitalize`}>
                              {g.priority ?? "medium"}
                            </Badge>
                            <Badge className={`${sourceColors[g.source ?? "web"] ?? ""} text-xs capitalize`}>
                              {g.source ?? "web"}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">{label(g.category)}</Badge>
                          </div>
                          <p className="text-sm text-[var(--gp-text-secondary)] mb-3">{g.description}</p>
                          <div className="grid md:grid-cols-2 gap-3 mb-3">
                            <div className="rounded-lg bg-[var(--gp-bg)] p-3">
                              <p className="text-xs font-medium text-[var(--gp-text-muted)] flex items-center gap-1">
                                <Bot className="w-3 h-3" /> Automated triage
                              </p>
                              <p className="text-sm text-[var(--gp-text)] mt-1">{g.aiSummary ?? "No summary available"}</p>
                              <p className="text-xs text-[var(--gp-text-muted)] mt-1">Category: {g.aiCategory ?? label(g.category)}</p>
                            </div>
                            <div className="rounded-lg bg-[var(--gp-bg)] p-3">
                              <p className="text-xs font-medium text-[var(--gp-text-muted)] flex items-center gap-1">
                                <Clock className="w-3 h-3" /> SLA and updates
                              </p>
                              <p className="text-sm text-[var(--gp-text)] mt-1">Due: {formatDate(g.slaDueAt)}</p>
                              <p className="text-xs text-[var(--gp-text-muted)] mt-1">{g.latestUpdate ?? "Awaiting first official update"}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--gp-text-muted)]">
                            <span>Ref: {g.referenceNumber}</span>
                            <span>By: {g.citizen?.fullName ?? "Unknown"}</span>
                            <span>Ward: {g.ward ?? g.citizen?.ward ?? "-"}</span>
                            {g.whatsappNumber && <span>WhatsApp: {g.whatsappNumber}</span>}
                            <span>Assigned: {g.assignee?.name ?? "Not assigned"}</span>
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
                          <div className="flex xl:flex-col gap-2 shrink-0">
                            {g.status === "submitted" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus.mutate({ id: g.id, status: "under_review", latestUpdate: "Case accepted for secretary review." })}
                              >
                                <ShieldCheck className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            )}
                            {g.status !== "assigned" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus.mutate({ id: g.id, status: "assigned", latestUpdate: "Assigned to ward officer for field action." })}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Assign
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="bg-[var(--gp-success)] hover:bg-green-700"
                              onClick={() => {
                                const resolution = prompt("Enter resolution:");
                                if (resolution) {
                                  updateStatus.mutate({
                                    id: g.id,
                                    status: "resolved",
                                    resolution,
                                    latestUpdate: "Resolved and closure update sent to citizen.",
                                  });
                                }
                              }}
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-10 text-center text-[var(--gp-text-muted)]">
                      No grievances found for the selected filters.
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
