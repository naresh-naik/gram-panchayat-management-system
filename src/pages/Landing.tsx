import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Landmark, Users, FileText, Shield, TrendingUp, MessageSquare, Calendar, PieChart,
  Quote, MessageCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { navigateWithLocalLocation } from "@/lib/locationNavigation";

const services = [
  { icon: Users, title: "Citizen Records", description: "Manage citizen profiles, households, and demographics with ease.", path: "/records" },
  { icon: Shield, title: "Welfare Schemes", description: "Track and manage government welfare scheme enrollments.", path: "/schemes" },
  { icon: FileText, title: "Property Tax", description: "Efficient property tax assessment, collection, and tracking.", path: "/finances" },
  { icon: Calendar, title: "Meetings", description: "Schedule Gram Sabha meetings and track attendance.", path: "/meetings" },
  { icon: MessageCircle, title: "WhatsApp Grievance", description: "Guide citizens to file structured complaints through WhatsApp.", path: "/whatsapp-grievance" },
  { icon: MessageSquare, title: "Grievances", description: "Public grievance filing and tracking system.", path: "/grievances" },
  { icon: TrendingUp, title: "Reports & Analytics", description: "Comprehensive analytics for government monitoring.", path: "/reports" },
  { icon: PieChart, title: "Financial Management", description: "Budget tracking, expenditure monitoring, and fund management.", path: "/finances" },
  { icon: Landmark, title: "e-Governance", description: "Digital platform for transparent village governance.", path: "/dashboard" },
];

const stats = [
  { value: "5,240+", label: "Citizens Registered" },
  { value: "47", label: "Active Schemes" },
  { value: "Rs. 2.4Cr", label: "Funds Utilized" },
  { value: "98.2%", label: "Service Satisfaction" },
];

const testimonials = [
  {
    quote: "The Gram Panchayat Management System has transformed how we serve our community. All records are now accessible digitally, making governance transparent.",
    name: "Ramesh Kumar",
    role: "Sarpanch, Gram Panchayat",
  },
  {
    quote: "As a secretary, this system has made my work so much easier. Managing welfare schemes and tracking applications is now streamlined and efficient.",
    name: "Sunita Devi",
    role: "Panchayat Secretary",
  },
  {
    quote: "I was able to track my grievance about water supply and it got resolved within a week. The transparency of the system gives citizens confidence.",
    name: "Mohan Singh",
    role: "Village Citizen",
  },
];

const schemes = [
  { name: "PM Awas Yojana", category: "Housing", budget: "Rs. 50L", beneficiaries: "1,240", color: "bg-emerald-500" },
  { name: "Ayushman Bharat", category: "Health", budget: "Rs. 30L", beneficiaries: "2,100", color: "bg-blue-500" },
  { name: "PM Kisan Samman", category: "Agriculture", budget: "Rs. 45L", beneficiaries: "890", color: "bg-amber-500" },
  { name: "MGNREGA", category: "Employment", budget: "Rs. 80L", beneficiaries: "3,200", color: "bg-rose-500" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--gp-bg)]">
      <Navbar />

      {/* Hero Section */}
      <section id="about" className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--gp-accent)]">
                Government of India
              </p>
              <h1 className="text-4xl lg:text-6xl font-serif text-[var(--gp-text)] leading-tight">
                Empowering Rural Governance Through Digital Transformation
              </h1>
              <p className="text-lg text-[var(--gp-text-secondary)] max-w-lg leading-relaxed">
                Access village records, welfare schemes, and government services — all in one unified platform designed for transparency and efficiency.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate("/whatsapp-grievance")}
                  className="bg-green-700 hover:bg-green-800 text-white px-8 py-6 text-sm font-semibold rounded-lg"
                >
                  WhatsApp Complaint
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[var(--gp-accent)] hover:bg-[var(--gp-accent-hover)] text-white px-8 py-6 text-sm font-semibold rounded-lg"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="border-[var(--gp-border)] text-[var(--gp-text)] px-8 py-6 text-sm font-semibold rounded-lg hover:bg-[var(--gp-bg-secondary)]"
                >
                  Citizen Registration
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-4 text-sm text-[var(--gp-text-muted)]">
                <span className="font-medium">5,240+ Citizens</span>
                <span className="w-1 h-1 rounded-full bg-[var(--gp-text-muted)]" />
                <span className="font-medium">47 Schemes Active</span>
                <span className="w-1 h-1 rounded-full bg-[var(--gp-text-muted)]" />
                <span className="font-medium">12 Departments</span>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-[420px] h-[520px] rounded-2xl bg-gradient-to-br from-[var(--gp-primary)] to-[var(--gp-primary-light)] flex items-center justify-center shadow-2xl">
                  <Landmark className="w-32 h-32 text-white/30" />
                </div>
                <Card className="absolute -bottom-6 -left-8 w-56 shadow-lg border-0">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-wider text-[var(--gp-text-muted)] font-medium">Total Welfare Disbursed</p>
                    <p className="text-2xl font-semibold text-[var(--gp-primary)] mt-1">Rs. 2.4 Cr</p>
                    <div className="mt-3 h-2 bg-[var(--gp-bg-secondary)] rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-[var(--gp-accent)] rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif text-[var(--gp-primary)] mb-4">Our Services</h2>
            <p className="text-[var(--gp-text-secondary)] max-w-lg mx-auto">
              Everything you need to engage with your village governance
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <button
                type="button"
                key={i}
                onClick={() => navigateWithLocalLocation(navigate, service.path)}
                className="group bg-[var(--gp-bg)] border border-transparent text-left rounded-xl py-6 shadow-sm hover:border-[var(--gp-border)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gp-primary)]"
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-5">
                    <service.icon className="w-6 h-6 text-[var(--gp-primary)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--gp-text)] mb-2">{service.title}</h3>
                  <p className="text-sm text-[var(--gp-text-secondary)] leading-relaxed">{service.description}</p>
                  <p className="text-sm font-medium text-[var(--gp-accent)] mt-4 group-hover:underline">
                    Learn more →
                  </p>
                </CardContent>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Counter */}
      <section className="py-16 lg:py-24 bg-[var(--gp-bg-dark)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-3xl lg:text-5xl font-mono text-white font-medium">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Schemes Preview */}
      <section id="schemes" className="py-16 lg:py-24 bg-[var(--gp-bg)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-serif text-[var(--gp-primary)] mb-4">Active Welfare Schemes</h2>
            <p className="text-[var(--gp-text-secondary)] max-w-lg">
              Benefit from government programs designed for rural development
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {schemes.map((scheme, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`h-2 ${scheme.color}`} />
                <CardContent className="p-6">
                  <span className="inline-block px-3 py-1 bg-[var(--gp-bg)] rounded-full text-xs font-medium text-[var(--gp-text-secondary)] uppercase tracking-wider">
                    {scheme.category}
                  </span>
                  <h3 className="font-semibold text-lg text-[var(--gp-text)] mt-3">{scheme.name}</h3>
                  <p className="text-sm text-[var(--gp-text-secondary)] mt-2 leading-relaxed">
                    Providing essential support to eligible families across all wards.
                  </p>
                  <div className="mt-4 h-1.5 bg-[var(--gp-bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full w-[67%] bg-[var(--gp-accent)] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-[var(--gp-text-muted)]">
                    <span>{scheme.beneficiaries} beneficiaries</span>
                    <span>Budget: {scheme.budget}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-3xl lg:text-4xl font-serif text-[var(--gp-primary)] text-center mb-12">
            What Citizens Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-0 shadow-sm bg-[var(--gp-bg)]">
                <CardContent className="p-8 relative">
                  <Quote className="w-10 h-10 text-[var(--gp-primary)]/10 absolute top-4 left-4" />
                  <p className="text-lg font-serif italic text-[var(--gp-text)] leading-relaxed relative z-10 pt-6">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--gp-border)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--gp-primary)] flex items-center justify-center text-white text-sm font-medium">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--gp-text)]">{t.name}</p>
                      <p className="text-xs text-[var(--gp-text-secondary)]">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[var(--gp-bg)]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <div className="bg-[var(--gp-primary-light)] rounded-2xl p-10 lg:p-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-serif text-white mb-4">
              Ready to Access Village Services?
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              Register or login to explore all services, track applications, and stay updated.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate("/login")}
                className="bg-white text-[var(--gp-primary)] hover:bg-white/90 px-8 py-6 text-sm font-semibold rounded-lg"
              >
                Login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/register")}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-sm font-semibold rounded-lg"
              >
                Citizen Registration
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
