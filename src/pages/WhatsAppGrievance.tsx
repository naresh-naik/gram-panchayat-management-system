import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Landmark,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  buildWhatsAppComplaintMessage,
  complaintCategories,
  formatWhatsAppNumber,
  getWhatsAppComplaintUrl,
  wardOptions,
} from "@/lib/whatsappComplaint";

export default function WhatsAppGrievance() {
  const [categoryId, setCategoryId] = useState(complaintCategories[0].id);
  const category = complaintCategories.find((item) => item.id === categoryId) ?? complaintCategories[0];
  const [subcategory, setSubcategory] = useState(category.subcategories[0]);
  const [ward, setWard] = useState("Ward 1");
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [opened, setOpened] = useState(false);

  const selectedSubcategory = category.subcategories.includes(subcategory)
    ? subcategory
    : category.subcategories[0];

  const complaintMessage = useMemo(() => (
    buildWhatsAppComplaintMessage({
      category,
      subcategory: selectedSubcategory,
      ward,
      description: description || "type your exact problem here",
      landmark,
    })
  ), [category, description, landmark, selectedSubcategory, ward]);

  const canOpenWhatsApp = description.trim().length >= 8;

  const selectCategory = (id: typeof categoryId) => {
    const nextCategory = complaintCategories.find((item) => item.id === id);
    if (!nextCategory) return;
    setCategoryId(id);
    setSubcategory(nextCategory.subcategories[0]);
  };

  const openWhatsApp = () => {
    if (!canOpenWhatsApp) return;
    setOpened(true);
    window.open(getWhatsAppComplaintUrl(complaintMessage), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />

      <main className="pt-20 pb-16">
        <section className="bg-[var(--gp-bg-dark)] text-white">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-5">
                  <MessageCircle className="w-8 h-8 text-green-300" />
                </div>
                <Badge className="bg-green-500/15 text-green-100 border border-green-300/20 mb-5">
                  WhatsApp Grievance Chatbot
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-serif leading-tight">
                  Click, confirm details, send on WhatsApp
                </h1>
                <p className="text-white/72 text-lg max-w-xl mt-4 leading-relaxed">
                  Citizens choose the complaint type on this page, then WhatsApp opens with a complete official message. Zapier receives it and sends the acknowledgement when Meta permits outgoing replies.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Button
                    type="button"
                    onClick={openWhatsApp}
                    disabled={!canOpenWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-semibold disabled:opacity-60"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Open WhatsApp Complaint
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

              <div className="rounded-xl border border-white/12 bg-[#0c1f18] shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 bg-[#18392d] border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Gram Panchayat Helpdesk</p>
                    <p className="text-xs text-white/60">WhatsApp complaint preview</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="max-w-[85%] rounded-lg bg-white/10 px-4 py-3 text-sm text-white/82">
                    Select the category, ward, and problem below. The final message will open in WhatsApp.
                  </div>
                  <div className="ml-auto max-w-[90%] rounded-lg bg-green-700 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                    {complaintMessage}
                  </div>
                  {opened && (
                    <div className="max-w-[90%] rounded-lg bg-white/10 px-4 py-3 text-sm text-white/82">
                      Complaint message opened in WhatsApp. After the citizen taps send, Zapier receives it and posts it to the portal webhook.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--gp-text-muted)]">Complaint assistant</p>
                    <h2 className="text-2xl font-serif text-[var(--gp-primary)]">Choose the daily village problem</h2>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {complaintCategories.map((item, index) => {
                    const Icon = item.icon;
                    const active = item.id === category.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectCategory(item.id)}
                        className={`text-left rounded-lg border p-4 transition-colors ${
                          active
                            ? "border-green-700 bg-green-50"
                            : "border-[var(--gp-border)] bg-white hover:bg-[var(--gp-bg)]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-mono text-[var(--gp-text-muted)]">{index + 1}</p>
                            <p className="font-medium text-[var(--gp-text)]">{item.title}</p>
                            <p className="text-xs text-[var(--gp-text-secondary)] mt-1 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="ward" className="text-sm font-medium text-[var(--gp-text)]">Ward number</label>
                    <select
                      id="ward"
                      value={ward}
                      onChange={(event) => setWard(event.target.value)}
                      className="w-full h-11 rounded-md border border-[var(--gp-border)] bg-white px-3 text-sm"
                    >
                      {wardOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="landmark" className="text-sm font-medium text-[var(--gp-text)]">Location or landmark</label>
                    <Input
                      id="landmark"
                      value={landmark}
                      onChange={(event) => setLandmark(event.target.value)}
                      placeholder="Near school, temple, main road"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-[var(--gp-text)] mb-2">Subcategory</p>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSubcategory(item)}
                        className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                          selectedSubcategory === item
                            ? "border-green-700 bg-green-700 text-white"
                            : "border-[var(--gp-border)] bg-white text-[var(--gp-text-secondary)] hover:bg-[var(--gp-bg)]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label htmlFor="problem" className="text-sm font-medium text-[var(--gp-text)]">Describe the problem</label>
                  <Textarea
                    id="problem"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={category.prompt}
                    className="min-h-28 bg-white"
                  />
                  {!canOpenWhatsApp && (
                    <p className="text-xs text-[var(--gp-text-muted)]">Type at least 8 characters before opening WhatsApp.</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={openWhatsApp}
                  disabled={!canOpenWhatsApp}
                  className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-6 text-base font-semibold disabled:opacity-60"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Open WhatsApp with this complaint
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-lg bg-[var(--gp-bg)] flex items-center justify-center">
                      <Landmark className="w-6 h-6 text-[var(--gp-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--gp-text-muted)]">Portal link</p>
                      <h2 className="text-2xl font-serif text-[var(--gp-primary)]">How it reaches staff</h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      "Citizen taps the website WhatsApp button.",
                      "The complaint opens in WhatsApp with the correct format.",
                      "Citizen taps send to the official WhatsApp Business number.",
                      "Zapier catches the incoming message and posts it to /api/zapier-whatsapp.",
                      "The portal returns a reference number and acknowledgement text.",
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

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-950 leading-relaxed">
                  Meta is currently blocking automatic outgoing WhatsApp replies until the phone number display name is approved. This page still lets citizens submit a clean WhatsApp complaint now; the reply step will start working after Meta approval.
                </p>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <p className="text-sm text-green-900 leading-relaxed">
                  For the Zapier reply step, map <span className="font-semibold">Message text</span> to the webhook field <span className="font-semibold">replyText</span>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
