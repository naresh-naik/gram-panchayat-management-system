import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Landmark,
  MessageCircle,
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
  const selectedCategory = complaintCategories.find((category) => category.id === categoryId) ?? complaintCategories[0];
  const [subcategory, setSubcategory] = useState(selectedCategory.subcategories[0]);
  const [ward, setWard] = useState("Ward 1");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => buildWhatsAppComplaintMessage({
    category: selectedCategory,
    subcategory,
    ward,
    description,
    landmark,
  }), [description, landmark, selectedCategory, subcategory, ward]);

  const whatsappUrl = useMemo(() => getWhatsAppComplaintUrl(message), [message]);
  const canOpenWhatsApp = description.trim().length >= 8 && Boolean(subcategory) && Boolean(ward);

  const chooseCategory = (id: typeof categoryId) => {
    const nextCategory = complaintCategories.find((category) => category.id === id) ?? complaintCategories[0];
    setCategoryId(nextCategory.id);
    setSubcategory(nextCategory.subcategories[0]);
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const openWhatsApp = () => {
    if (!canOpenWhatsApp) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />

      <main className="pt-20 pb-16">
        <section className="bg-[var(--gp-bg-dark)] text-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
              <div>
                <Badge className="bg-green-500/15 text-green-100 border border-green-300/20 mb-5">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  WhatsApp Grievance Intake
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-serif leading-tight">
                  File village complaints through WhatsApp
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mt-4 leading-relaxed">
                  Select the daily problem category, ward, and issue details. The message opens in WhatsApp and reaches the Panchayat complaint workflow connected through Zapier.
                </p>
                <div className="flex flex-wrap gap-3 mt-6 text-sm text-white/70">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    No portal login needed
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                    <ShieldCheck className="w-4 h-4 text-blue-200" />
                    Official number: {formatWhatsAppNumber()}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/8 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Panchayat WhatsApp Desk</p>
                    <p className="text-2xl font-mono">{formatWhatsAppNumber()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {["Category", "Ward", "Problem"].map((item, index) => (
                    <div key={item} className="rounded-lg bg-white/10 p-3">
                      <p className="text-xl font-mono text-white">{index + 1}</p>
                      <p className="text-xs uppercase tracking-wider text-white/55">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid xl:grid-cols-[1fr_420px] gap-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Select the village problem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {complaintCategories.map((category) => {
                      const Icon = category.icon;
                      const isSelected = category.id === selectedCategory.id;

                      return (
                        <button
                          type="button"
                          key={category.id}
                          onClick={() => chooseCategory(category.id)}
                          className={`min-h-36 rounded-lg border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gp-primary)] ${
                            isSelected
                              ? "border-[var(--gp-primary)] bg-white shadow-sm"
                              : "border-[var(--gp-border)] bg-[var(--gp-bg)] hover:border-[var(--gp-primary)]"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${category.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-[var(--gp-text)] mt-3">{category.title}</p>
                          <p className="text-sm text-[var(--gp-text-secondary)] mt-1 leading-snug">
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Complaint details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label>Subcategory</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCategory.subcategories.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={option === subcategory ? "default" : "outline"}
                          onClick={() => setSubcategory(option)}
                          className={option === subcategory ? "bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)]" : ""}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ward">Ward number</Label>
                      <Select value={ward} onValueChange={setWard}>
                        <SelectTrigger id="ward" className="mt-2">
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {wardOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="landmark">Location or landmark</Label>
                      <Input
                        id="landmark"
                        value={landmark}
                        onChange={(event) => setLandmark(event.target.value)}
                        placeholder="Near school, temple, main road"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="problem">Type the problem</Label>
                    <Textarea
                      id="problem"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={selectedCategory.prompt}
                      className="mt-2 min-h-36"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      onClick={openWhatsApp}
                      disabled={!canOpenWhatsApp}
                      className="bg-green-700 hover:bg-green-800 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open WhatsApp
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button type="button" variant="outline" onClick={copyMessage}>
                      <Clipboard className="w-4 h-4 mr-2" />
                      {copied ? "Copied" : "Copy Message"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:sticky xl:top-20 h-fit space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-700" />
                    WhatsApp message preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-[#f0f2f5] p-4">
                    <div className="ml-auto max-w-[92%] rounded-lg bg-[#dcf8c6] px-4 py-3 text-sm text-[#111b21] shadow-sm whitespace-pre-wrap">
                      {message}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-[var(--gp-bg)] p-3">
                      <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)]">Category</p>
                      <p className="font-medium text-[var(--gp-text)] mt-1">{selectedCategory.title}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--gp-bg)] p-3">
                      <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)]">Ward</p>
                      <p className="font-medium text-[var(--gp-text)] mt-1">{ward}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-xl border border-[var(--gp-border)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--gp-text)]">When the citizen sends this message</p>
                <div className="mt-4 space-y-3 text-sm text-[var(--gp-text-secondary)]">
                  {[
                    "Zapier receives the WhatsApp message from the connected business number.",
                    "The webhook records the category, ward, and problem text.",
                    "The citizen receives a complaint reference number on WhatsApp.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
