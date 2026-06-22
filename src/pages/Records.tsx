import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Plus, Pencil, Trash2, Users, Home } from "lucide-react";

export default function Records() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "secretary";

  const [citizenSearch, setCitizenSearch] = useState("");
  const [householdSearch, setHouseholdSearch] = useState("");
  const [citizenPage, setCitizenPage] = useState(1);
  const [householdPage, setHouseholdPage] = useState(1);

  const { data: citizensData, refetch: refetchCitizens } = trpc.citizen.list.useQuery({
    search: citizenSearch || undefined,
    page: citizenPage,
    limit: 10,
  });

  const { data: householdsData, refetch: refetchHouseholds } = trpc.household.list.useQuery({
    search: householdSearch || undefined,
    page: householdPage,
    limit: 10,
  });

  const deleteCitizen = trpc.citizen.delete.useMutation({ onSuccess: () => refetchCitizens() });
  const deleteHousehold = trpc.household.delete.useMutation({ onSuccess: () => refetchHouseholds() });

  const genderColors: Record<string, string> = {
    male: "bg-blue-100 text-blue-700",
    female: "bg-pink-100 text-pink-700",
    other: "bg-gray-100 text-gray-700",
  };

  const categoryColors: Record<string, string> = {
    SC: "bg-orange-100 text-orange-700",
    ST: "bg-amber-100 text-amber-700",
    OBC: "bg-purple-100 text-purple-700",
    General: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-serif text-[var(--gp-text)] mb-6">Records Management</h1>

          <Tabs defaultValue="citizens" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="citizens" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Citizens
              </TabsTrigger>
              <TabsTrigger value="households" className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Households
              </TabsTrigger>
            </TabsList>

            {/* Citizens Tab */}
            <TabsContent value="citizens">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg font-semibold">Citizens Directory</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gp-text-muted)]" />
                        <Input
                          placeholder="Search citizens..."
                          value={citizenSearch}
                          onChange={(e) => { setCitizenSearch(e.target.value); setCitizenPage(1); }}
                          className="pl-9 w-64"
                        />
                      </div>
                      {canEdit && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)]">
                              <Plus className="w-4 h-4 mr-1" /> Add Citizen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add New Citizen</DialogTitle>
                            </DialogHeader>
                            <AddCitizenForm onSuccess={() => refetchCitizens()} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--gp-bg-secondary)] text-xs uppercase tracking-wider text-[var(--gp-text-secondary)]">
                          <th className="text-left p-3 font-semibold">ID</th>
                          <th className="text-left p-3 font-semibold">Name</th>
                          <th className="text-left p-3 font-semibold">Age/Gender</th>
                          <th className="text-left p-3 font-semibold">Category</th>
                          <th className="text-left p-3 font-semibold">Ward</th>
                          <th className="text-left p-3 font-semibold">Phone</th>
                          <th className="text-left p-3 font-semibold">Occupation</th>
                          {canEdit && <th className="text-left p-3 font-semibold">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {citizensData?.items?.map((c) => (
                          <tr key={c.id} className="border-t border-[var(--gp-border)] hover:bg-[var(--gp-bg)] transition-colors">
                            <td className="p-3 font-mono text-[var(--gp-text-muted)]">#{c.id}</td>
                            <td className="p-3 font-medium text-[var(--gp-text)]">{c.fullName}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Badge className={`${genderColors[c.gender] ?? ""} text-xs capitalize`}>{c.gender}</Badge>
                                <span className="text-[var(--gp-text-muted)]">
                                  {c.dob ? new Date().getFullYear() - new Date(c.dob).getFullYear() : "-"} yrs
                                </span>
                              </div>
                            </td>
                            <td className="p-3"><Badge className={`${categoryColors[c.category] ?? ""} text-xs`}>{c.category}</Badge></td>
                            <td className="p-3 text-[var(--gp-text-secondary)]">{c.ward}</td>
                            <td className="p-3 text-[var(--gp-text-secondary)]">{c.phone ?? "-"}</td>
                            <td className="p-3 text-[var(--gp-text-secondary)]">{c.occupation ?? "-"}</td>
                            {canEdit && (
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="w-8 h-8 text-[var(--gp-text-muted)] hover:text-blue-600">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 text-[var(--gp-text-muted)] hover:text-red-600"
                                    onClick={() => { if (confirm("Delete this citizen?")) deleteCitizen.mutate({ id: c.id }); }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {citizensData && citizensData.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--gp-border)]">
                      <p className="text-xs text-[var(--gp-text-muted)]">
                        Showing {(citizenPage - 1) * 10 + 1} to {Math.min(citizenPage * 10, citizensData.total)} of {citizensData.total}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={citizenPage === 1} onClick={() => setCitizenPage(p => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={citizenPage >= citizensData.totalPages} onClick={() => setCitizenPage(p => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Households Tab */}
            <TabsContent value="households">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg font-semibold">Households</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gp-text-muted)]" />
                        <Input
                          placeholder="Search households..."
                          value={householdSearch}
                          onChange={(e) => { setHouseholdSearch(e.target.value); setHouseholdPage(1); }}
                          className="pl-9 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--gp-bg-secondary)] text-xs uppercase tracking-wider text-[var(--gp-text-secondary)]">
                          <th className="text-left p-3 font-semibold">ID</th>
                          <th className="text-left p-3 font-semibold">Head Name</th>
                          <th className="text-left p-3 font-semibold">Members</th>
                          <th className="text-left p-3 font-semibold">Address</th>
                          <th className="text-left p-3 font-semibold">Ward</th>
                          <th className="text-left p-3 font-semibold">Income</th>
                          <th className="text-left p-3 font-semibold">Ration Card</th>
                          {canEdit && <th className="text-left p-3 font-semibold">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {householdsData?.items?.map((h) => (
                          <tr key={h.id} className="border-t border-[var(--gp-border)] hover:bg-[var(--gp-bg)] transition-colors">
                            <td className="p-3 font-mono text-[var(--gp-text-muted)]">#{h.id}</td>
                            <td className="p-3 font-medium text-[var(--gp-text)]">{h.headName}</td>
                            <td className="p-3">{String(h.members)}</td>
                            <td className="p-3 text-[var(--gp-text-secondary)] max-w-[200px] truncate">{h.address}</td>
                            <td className="p-3 text-[var(--gp-text-secondary)]">{h.ward}</td>
                            <td className="p-3"><Badge className="bg-[var(--gp-bg)] text-[var(--gp-text-secondary)] text-xs">{h.incomeCategory}</Badge></td>
                            <td className="p-3 text-[var(--gp-text-secondary)]">{h.rationCardType}</td>
                            {canEdit && (
                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-[var(--gp-text-muted)] hover:text-red-600"
                                  onClick={() => { if (confirm("Delete this household?")) deleteHousehold.mutate({ id: h.id }); }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {householdsData && householdsData.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--gp-border)]">
                      <p className="text-xs text-[var(--gp-text-muted)]">
                        Showing {(householdPage - 1) * 10 + 1} to {Math.min(householdPage * 10, householdsData.total)} of {householdsData.total}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={householdPage === 1} onClick={() => setHouseholdPage(p => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={householdPage >= householdsData.totalPages} onClick={() => setHouseholdPage(p => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function AddCitizenForm({ onSuccess }: { onSuccess: () => void }) {
  const createCitizen = trpc.citizen.create.useMutation({ onSuccess });
  const [form, setForm] = useState({
    fullName: "", fatherName: "", dob: "", gender: "male" as "male" | "female" | "other",
    category: "General" as "SC" | "ST" | "OBC" | "General", phone: "", address: "", ward: "Ward 1",
    occupation: "", education: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCitizen.mutate({ ...form, fatherName: form.fatherName || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Full Name *</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></div>
        <div className="space-y-2"><Label>Father/Spouse Name</Label><Input value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} /></div>
        <div className="space-y-2"><Label>Date of Birth *</Label><Input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} required /></div>
        <div className="space-y-2"><Label>Gender *</Label>
          <Select value={form.gender} onValueChange={(v: "male" | "female" | "other") => setForm({ ...form, gender: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Category *</Label>
          <Select value={form.category} onValueChange={(v: "SC" | "ST" | "OBC" | "General") => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SC">SC</SelectItem>
              <SelectItem value="ST">ST</SelectItem>
              <SelectItem value="OBC">OBC</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-2"><Label>Occupation</Label><Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} /></div>
        <div className="space-y-2"><Label>Education</Label><Input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label>Address *</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></div>
      <div className="space-y-2"><Label>Ward *</Label>
        <Select value={form.ward} onValueChange={(v) => setForm({ ...form, ward: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5"].map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)]" disabled={createCitizen.isPending}>
        {createCitizen.isPending ? "Saving..." : "Save Citizen"}
      </Button>
    </form>
  );
}
