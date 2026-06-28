import type { LucideIcon } from "lucide-react";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  Droplets,
  GraduationCap,
  HeartPulse,
  LandPlot,
  Lightbulb,
  Route,
  Trash2,
} from "lucide-react";

export type ComplaintCategoryId =
  | "drinking-water"
  | "sanitation-drainage"
  | "garbage-waste"
  | "roads-pathways"
  | "street-lights-electricity"
  | "health-mosquito"
  | "welfare-ration"
  | "school-anganwadi"
  | "mgnrega-livelihood"
  | "land-assets";

export type ComplaintCategory = {
  id: ComplaintCategoryId;
  title: string;
  backendCategory: "water" | "roads" | "electricity" | "sanitation" | "land_dispute" | "welfare" | "others";
  icon: LucideIcon;
  color: string;
  description: string;
  subcategories: string[];
  prompt: string;
};

export const WHATSAPP_BUSINESS_NUMBER = (
  import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || "919515019840"
).replace(/\D/g, "");

export const complaintCategories: ComplaintCategory[] = [
  {
    id: "drinking-water",
    title: "Drinking Water",
    backendCategory: "water",
    icon: Droplets,
    color: "text-sky-700 bg-sky-50 border-sky-100",
    description: "No supply, leakage, dirty water, pump or borewell failure.",
    subcategories: ["No water supply", "Dirty or smelly water", "Pipeline leakage", "Hand pump or borewell repair", "Low water pressure"],
    prompt: "Describe the water issue, affected street, duration, and whether drinking water is unsafe.",
  },
  {
    id: "sanitation-drainage",
    title: "Sanitation & Drainage",
    backendCategory: "sanitation",
    icon: Trash2,
    color: "text-emerald-700 bg-emerald-50 border-emerald-100",
    description: "Blocked drains, sewage overflow, stagnant water, public toilet issues.",
    subcategories: ["Blocked drainage", "Sewage overflow", "Public toilet repair", "Stagnant water", "Mosquito breeding spot"],
    prompt: "Describe where the drain or toilet issue is, how long it has continued, and nearby houses or landmarks.",
  },
  {
    id: "garbage-waste",
    title: "Garbage & Waste",
    backendCategory: "sanitation",
    icon: Trash2,
    color: "text-lime-700 bg-lime-50 border-lime-100",
    description: "Garbage collection, dumping points, waste burning, animal waste.",
    subcategories: ["Garbage not collected", "Illegal dumping", "Waste burning", "Dead animal removal", "Dustbin required"],
    prompt: "Mention the waste location, collection delay, and any health or smell problem.",
  },
  {
    id: "roads-pathways",
    title: "Roads & Pathways",
    backendCategory: "roads",
    icon: Route,
    color: "text-stone-700 bg-stone-50 border-stone-100",
    description: "Potholes, muddy roads, broken culverts, footpath or access issues.",
    subcategories: ["Potholes", "Muddy road", "Broken culvert", "Road waterlogging", "Footpath repair"],
    prompt: "Describe the road stretch, exact landmark, risk to people, and whether vehicles are blocked.",
  },
  {
    id: "street-lights-electricity",
    title: "Street Lights & Electricity",
    backendCategory: "electricity",
    icon: Lightbulb,
    color: "text-amber-700 bg-amber-50 border-amber-100",
    description: "Street lights, poles, unsafe wires, transformer and power supply issues.",
    subcategories: ["Street light not working", "New street light needed", "Unsafe electric wire", "Pole damaged", "Transformer issue"],
    prompt: "Mention pole number if visible, street name, safety risk, and whether the area is dark at night.",
  },
  {
    id: "health-mosquito",
    title: "Health & Mosquito Control",
    backendCategory: "sanitation",
    icon: HeartPulse,
    color: "text-rose-700 bg-rose-50 border-rose-100",
    description: "Fogging, fever clusters, unsafe water, village health camp requests.",
    subcategories: ["Mosquito fogging needed", "Fever cases in area", "Unsafe drinking water", "Health camp request", "Stray animal health risk"],
    prompt: "Describe the health concern, number of affected families if known, and urgent risk.",
  },
  {
    id: "welfare-ration",
    title: "Welfare, Ration & Pension",
    backendCategory: "welfare",
    icon: BadgeIndianRupee,
    color: "text-violet-700 bg-violet-50 border-violet-100",
    description: "Ration card, pension, housing, benefits and scheme enrollment issues.",
    subcategories: ["Ration card problem", "Old age pension", "Widow pension", "PM Awas issue", "Scheme benefit pending"],
    prompt: "Mention the scheme name, beneficiary name if safe to share, and what is pending.",
  },
  {
    id: "school-anganwadi",
    title: "School & Anganwadi",
    backendCategory: "welfare",
    icon: GraduationCap,
    color: "text-indigo-700 bg-indigo-50 border-indigo-100",
    description: "Midday meal, building repair, drinking water, child services, supplies.",
    subcategories: ["Anganwadi repair", "Midday meal issue", "School toilet repair", "Drinking water at school", "Child nutrition service"],
    prompt: "Mention the school or anganwadi name, ward, and issue affecting children.",
  },
  {
    id: "mgnrega-livelihood",
    title: "MGNREGA & Livelihood",
    backendCategory: "welfare",
    icon: BriefcaseBusiness,
    color: "text-teal-700 bg-teal-50 border-teal-100",
    description: "Job card, attendance, wage payment, work demand and SHG support.",
    subcategories: ["Job card issue", "Wage payment pending", "Attendance mismatch", "Work demand", "SHG support"],
    prompt: "Mention job card or SHG details if available, work site, and pending payment or work request.",
  },
  {
    id: "land-assets",
    title: "Land & Public Assets",
    backendCategory: "land_dispute",
    icon: LandPlot,
    color: "text-orange-700 bg-orange-50 border-orange-100",
    description: "Encroachment, ponds, community halls, playgrounds and public property.",
    subcategories: ["Public land encroachment", "Pond maintenance", "Community hall repair", "Playground issue", "Boundary dispute"],
    prompt: "Describe the public asset or land location, people affected, and any immediate safety concern.",
  },
];

export const wardOptions = [
  "Ward 1",
  "Ward 2",
  "Ward 3",
  "Ward 4",
  "Ward 5",
  "Ward 6",
  "Ward 7",
  "Ward 8",
  "Ward 9",
  "Ward 10",
  "Ward not sure",
];

export function buildWhatsAppComplaintMessage(input: {
  category: ComplaintCategory;
  subcategory: string;
  ward: string;
  description: string;
  landmark?: string;
}) {
  const lines = [
    "GP_COMPLAINT",
    `Category: ${input.category.title}`,
    `System Category: ${input.category.backendCategory}`,
    `Subcategory: ${input.subcategory}`,
    `Ward: ${input.ward}`,
    `Problem: ${input.description.trim()}`,
  ];

  const landmark = input.landmark?.trim();
  if (landmark) lines.push(`Location/Landmark: ${landmark}`);

  return lines.join("\n");
}

export function getWhatsAppComplaintUrl(message: string) {
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatWhatsAppNumber(number = WHATSAPP_BUSINESS_NUMBER) {
  const value = number.replace(/\D/g, "");
  if (value.startsWith("91") && value.length === 12) {
    return `+91 ${value.slice(2, 7)} ${value.slice(7)}`;
  }
  return `+${value}`;
}
