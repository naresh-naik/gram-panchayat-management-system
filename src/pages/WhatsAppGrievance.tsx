import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Landmark, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { complaintCategories, formatWhatsAppNumber, getWhatsAppComplaintUrl } from "@/lib/whatsappComplaint";

const startMessage = "START GP_COMPLAINT";

export default function WhatsAppGrievance() {
  const openWhatsApp = () => {
    window.open(getWhatsAppComplaintUrl(startMessage), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />

      <main className="pt-20 pb-16">
        <section className="bg-[var(--gp-bg-dark)] text-white">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-14 lg:py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-8 h-8 text-green-300" />
            </div>
            <Badge className="bg-green-500/15 text-green-100 border border-green-300/20 mb-5">
              WhatsApp Complaint Desk
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-serif leading-tight">
              File a Gram Panchayat grievance on WhatsApp
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Citizens only need to tap the button. WhatsApp opens with the Panchayat number, then the complaint assistant sends category templates step by step.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button
                type="button"
                onClick={openWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-semibold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Complaint on WhatsApp
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a href={`tel:${formatWhatsAppNumber().replace(/\s/g, "")}`}>
                <Button type="button" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base">
                  <Phone className="w-5 h-5 mr-2" />
                  {formatWhatsAppNumber()}
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--gp-text-muted)]">How it works</p>
                    <h2 className="text-2xl font-serif text-[var(--gp-primary)]">Inside WhatsApp</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "Tap the WhatsApp button and send the pre-filled start message.",
                    "The assistant replies with 10 daily village problem categories.",
                    "Reply with a category number to get the correct complaint template.",
                    "Send the ward and problem details in WhatsApp.",
                    "The system sends a reference number and the complaint reaches the portal workflow.",
                  ].map((step, index) => (
                    <div key={step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[var(--gp-primary)] text-white flex items-center justify-center text-sm font-mono shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-[var(--gp-text-secondary)] leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-lg bg-[var(--gp-bg)] flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-[var(--gp-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--gp-text-muted)]">Available complaint categories</p>
                    <h2 className="text-2xl font-serif text-[var(--gp-primary)]">The assistant will ask these</h2>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {complaintCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.id} className="rounded-lg border border-[var(--gp-border)] bg-[var(--gp-bg)] p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${category.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-mono text-[var(--gp-text-muted)]">{index + 1}</p>
                            <p className="font-medium text-[var(--gp-text)]">{category.title}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <p className="text-sm text-green-900">
              Auto-replies are sent by Zapier using the webhook response. For permanent dashboard storage, add `DATABASE_URL` in Vercel.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
