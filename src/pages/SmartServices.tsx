import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle,
  FileCheck2,
  HandCoins,
  Landmark,
  ReceiptText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const certificateRequests = [
  { id: "CERT-2026-041", type: "Residence Certificate", applicant: "Anita Sharma", ward: "Ward 2", status: "verification", eta: "2 days" },
  { id: "CERT-2026-038", type: "Income Certificate", applicant: "Biren Murmu", ward: "Ward 5", status: "approved", eta: "Ready" },
  { id: "CERT-2026-033", type: "Birth Certificate", applicant: "Lakshmi Sharma", ward: "Ward 2", status: "submitted", eta: "4 days" },
];

const workScheme = [
  { worker: "Biren Murmu", jobCard: "MGN-005-219", ward: "Ward 5", attendance: 82, wageDue: 6840, lastPaid: "2026-06-18" },
  { worker: "Sita Devi", jobCard: "MGN-001-144", ward: "Ward 1", attendance: 76, wageDue: 5120, lastPaid: "2026-06-14" },
  { worker: "Shyam Lal Gupta", jobCard: "MGN-003-087", ward: "Ward 3", attendance: 91, wageDue: 7280, lastPaid: "2026-06-20" },
];

const shgGroups = [
  { name: "Maa Durga SHG", members: 14, project: "Tailoring unit", loan: 125000, repayment: 68, status: "active" },
  { name: "Ujjwala SHG", members: 11, project: "Backyard poultry", loan: 90000, repayment: 74, status: "active" },
  { name: "Sakhi SHG", members: 16, project: "Vermi compost", loan: 150000, repayment: 52, status: "training" },
];

const paymentServices = [
  { label: "Water Tax", amount: "Rs. 18,400", status: "82% collected" },
  { label: "Residence Tax", amount: "Rs. 31,700", status: "76% collected" },
  { label: "Property Tax", amount: "Rs. 27,700", status: "Pending: Rs. 6,500" },
];

const statusColors: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-700",
  verification: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  active: "bg-emerald-100 text-emerald-700",
  training: "bg-purple-100 text-purple-700",
};

function money(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function SmartServices() {
  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-[var(--gp-text)]">Smart Village Services</h1>
            <p className="text-sm text-[var(--gp-text-secondary)] mt-1">
              Digital service modules requested from the reference papers: certificates, MGNREGA work tracking, SHG management, and tax payments.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Certificate Requests", value: "36", icon: FileCheck2, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "MGNREGA Workers", value: "214", icon: BriefcaseBusiness, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "SHG Members", value: "103", icon: UsersRound, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Digital Collections", value: "Rs. 77.8K", icon: BadgeIndianRupee, color: "text-rose-600", bg: "bg-rose-50" },
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

          <div className="grid xl:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[var(--gp-primary)]" />
                  Certificate Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certificateRequests.map((request) => (
                  <div key={request.id} className="rounded-lg bg-[var(--gp-bg)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-[var(--gp-text)]">{request.type}</p>
                        <p className="text-xs text-[var(--gp-text-muted)]">{request.id} · {request.applicant} · {request.ward}</p>
                      </div>
                      <Badge className={`${statusColors[request.status] ?? ""} capitalize`}>{request.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm text-[var(--gp-text-secondary)]">
                      <ShieldCheck className="w-4 h-4 text-[var(--gp-accent)]" />
                      Verification SLA: {request.eta}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">Open Certificate Register</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  100-Days Work Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workScheme.map((worker) => (
                  <div key={worker.jobCard}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-[var(--gp-text)]">{worker.worker}</p>
                        <p className="text-xs text-[var(--gp-text-muted)]">{worker.jobCard} · {worker.ward}</p>
                      </div>
                      <p className="text-sm font-medium text-[var(--gp-text)]">{money(worker.wageDue)}</p>
                    </div>
                    <Progress value={worker.attendance} className="h-2" />
                    <div className="flex justify-between mt-1 text-xs text-[var(--gp-text-muted)]">
                      <span>{worker.attendance}% attendance verified</span>
                      <span>Last paid {worker.lastPaid}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HandCoins className="w-5 h-5 text-purple-600" />
                  Women Self Help Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shgGroups.map((group) => (
                  <div key={group.name} className="rounded-lg bg-[var(--gp-bg)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="font-medium text-[var(--gp-text)]">{group.name}</p>
                        <p className="text-xs text-[var(--gp-text-muted)]">{group.members} members · {group.project}</p>
                      </div>
                      <Badge className={`${statusColors[group.status] ?? ""} capitalize`}>{group.status}</Badge>
                    </div>
                    <Progress value={group.repayment} className="h-2" />
                    <div className="flex justify-between mt-1 text-xs text-[var(--gp-text-muted)]">
                      <span>Loan {money(group.loan)}</span>
                      <span>{group.repayment}% repaid</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-rose-600" />
                  Domestic Tax and Payment Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentServices.map((service) => (
                  <div key={service.label} className="rounded-lg bg-[var(--gp-bg)] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-[var(--gp-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--gp-text)]">{service.label}</p>
                        <p className="text-xs text-[var(--gp-text-muted)]">{service.status}</p>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-[var(--gp-text)]">{service.amount}</p>
                  </div>
                ))}
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    UPI/card/net banking payment modes are represented in the financial module and can be connected to a live payment gateway during deployment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
