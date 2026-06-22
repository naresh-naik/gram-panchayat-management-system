import { Landmark, Phone, Mail, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { navigateWithLocalLocation } from "@/lib/locationNavigation";

const quickLinks = [
  { label: "About Us", path: "/#about" },
  { label: "Services", path: "/#services" },
  { label: "Schemes", path: "/#schemes" },
  { label: "Contact", path: "/#contact" },
];

const serviceLinks = [
  { label: "Birth Certificate", path: "/records" },
  { label: "Property Tax", path: "/finances" },
  { label: "Grievance", path: "/grievances" },
  { label: "RTI", path: "/grievances?category=others" },
];

export default function Footer() {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    if (path.startsWith("/#")) {
      navigate(path);
      window.setTimeout(() => {
        document.querySelector(path.slice(1))?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
      return;
    }

    navigateWithLocalLocation(navigate, path);
  };

  return (
    <footer id="contact" className="bg-[var(--gp-bg-dark)] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 - About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--gp-primary-light)] flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-serif text-white">Gram Panchayat</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Serving the community with transparency and dedication. Empowering rural governance through digital transformation.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => goTo(link.path)}
                    className="text-sm text-white/70 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Services */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">
              Services
            </h4>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => goTo(link.path)}
                    className="text-sm text-white/70 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +91 98XXX XXXXX
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail className="w-4 h-4 flex-shrink-0" />
                gp@village.gov.in
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Gram Panchayat Office, Main Road, District
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            2025 Gram Panchayat. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            e-Governance Portal
          </p>
        </div>
      </div>
    </footer>
  );
}
