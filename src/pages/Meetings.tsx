import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Users, FileText } from "lucide-react";

export default function Meetings() {
  const { data } = trpc.meeting.list.useQuery({ limit: 20 });

  const typeColors: Record<string, string> = {
    gram_sabha: "bg-emerald-100 text-emerald-700",
    executive: "bg-blue-100 text-blue-700",
    special: "bg-purple-100 text-purple-700",
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    ongoing: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-serif text-[var(--gp-text)] mb-6">Meetings & Resolutions</h1>

          <div className="space-y-4">
            {data?.items?.map((meeting) => (
              <Card key={meeting.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Date Badge */}
                    <div className="flex items-center lg:flex-col lg:items-center gap-2 lg:gap-0 lg:w-16 shrink-0">
                      <div className="lg:text-center">
                        <div className="text-2xl font-mono font-semibold text-[var(--gp-primary)]">
                          {meeting.date ? new Date(meeting.date).getDate() : "-"}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)]">
                          {meeting.date ? new Date(meeting.date).toLocaleString("default", { month: "short" }) : ""}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--gp-text)]">{meeting.title}</h3>
                        <Badge className={`${typeColors[meeting.type] ?? ""} text-xs capitalize`}>
                          {meeting.type.replace("_", " ")}
                        </Badge>
                        <Badge className={`${statusColors[meeting.status] ?? ""} text-xs capitalize`}>
                          {meeting.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--gp-text-secondary)] mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {meeting.time ?? ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.attendance?.length ?? 0} attendees
                        </span>
                      </div>

                      {/* Agenda */}
                      {Array.isArray(meeting.agenda) && meeting.agenda.length > 0 ? (
                        <div className="mb-3">
                          <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Agenda
                          </p>
                          <ol className="list-decimal list-inside text-sm text-[var(--gp-text-secondary)] space-y-0.5">
                            {(meeting.agenda as string[]).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ol>
                        </div>
                      ) : null}

                      {/* Minutes */}
                      {meeting.minutes && (
                        <div className="mt-3 p-3 bg-[var(--gp-bg)] rounded-lg">
                          <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium mb-1">
                            Meeting Minutes
                          </p>
                          <p className="text-sm text-[var(--gp-text-secondary)] leading-relaxed">{meeting.minutes}</p>
                        </div>
                      )}

                      {/* Attendance Summary */}
                      {meeting.attendance && meeting.attendance.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {meeting.attendance.slice(0, 5).map((a) => (
                            <Badge key={a.id} variant="outline" className="text-xs">
                              {a.present ? "✓" : "✗"} {a.role}
                            </Badge>
                          ))}
                          {meeting.attendance.length > 5 && (
                            <Badge variant="outline" className="text-xs">+{meeting.attendance.length - 5} more</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) ?? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-10 text-center text-[var(--gp-text-muted)]">
                  No meetings found
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
