import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Landmark, Menu, Bell, User, LogOut, Shield, Users, FileText, PieChart, Home, MessageSquare, Calendar, UserCog, Sparkles } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const role = user?.role ?? "guest";

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: Home, roles: ["admin", "secretary", "citizen", "monitor"] },
    { label: "Records", path: "/records", icon: FileText, roles: ["admin", "secretary"] },
    { label: "Schemes", path: "/schemes", icon: Shield, roles: ["admin", "secretary", "citizen", "monitor"] },
    { label: "Smart Services", path: "/smart-services", icon: Sparkles, roles: ["admin", "secretary", "citizen", "monitor"] },
    { label: "Finances", path: "/finances", icon: PieChart, roles: ["admin", "secretary", "monitor"] },
    { label: "Meetings", path: "/meetings", icon: Calendar, roles: ["admin", "secretary", "citizen", "monitor"] },
    { label: "WhatsApp", path: "/whatsapp-grievance", icon: MessageSquare, roles: ["admin", "secretary", "citizen", "monitor"] },
    { label: "Reports", path: "/reports", icon: Users, roles: ["admin", "monitor"] },
    { label: "Grievances", path: "/grievances", icon: MessageSquare, roles: ["admin", "secretary", "citizen"] },
    { label: "Users", path: "/users", icon: UserCog, roles: ["admin"] },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(role));
  const isHome = location.pathname === "/";

  if (isHome && !scrolled && !isAuthenticated) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-[var(--gp-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--gp-primary)] flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-sm uppercase tracking-wider text-[var(--gp-primary)] hidden sm:inline">
              Gram Panchayat
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-xs uppercase tracking-wider font-medium rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "text-[var(--gp-primary)] bg-[var(--gp-bg)]"
                    : "text-[var(--gp-text-secondary)] hover:text-[var(--gp-primary)] hover:bg-[var(--gp-bg)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--gp-text-secondary)] hover:text-[var(--gp-primary)]"
                >
                  <Bell className="w-5 h-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--gp-primary)] flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.charAt(0) ?? "U"}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium text-[var(--gp-text)]">
                        {user?.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-[var(--gp-text-muted)] capitalize">{user?.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-[var(--gp-danger)]">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <div className="flex flex-col gap-1 mt-6">
                      {visibleLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                            location.pathname === link.path
                              ? "text-[var(--gp-primary)] bg-[var(--gp-bg)]"
                              : "text-[var(--gp-text-secondary)] hover:bg-[var(--gp-bg)]"
                          }`}
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/whatsapp-grievance")}
                  className="hidden sm:inline-flex text-green-700 hover:text-green-800"
                >
                  WhatsApp Complaint
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-[var(--gp-text-secondary)]"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="hidden sm:inline-flex bg-[var(--gp-primary)] hover:bg-[var(--gp-primary-light)] text-white"
                >
                  Citizen Registration
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col gap-4 mt-8">
                      <Link to="/" className="text-lg font-medium text-[var(--gp-primary)]">Home</Link>
                      <Link to="/whatsapp-grievance" className="text-lg font-medium text-green-700">WhatsApp Complaint</Link>
                      <Link to="/login" className="text-lg font-medium text-[var(--gp-text-secondary)]">Login</Link>
                      <Link to="/register" className="text-lg font-medium text-[var(--gp-text-secondary)]">Citizen Registration</Link>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
