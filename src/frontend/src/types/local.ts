// Local type definitions for types not exported by backend
// These should match the backend types but are defined here for frontend use

import type { Principal } from "@dfinity/principal";
import type { UserRole } from "../backend";

// ============================================================
// PASSENGER VEHICLE TYPES
// ============================================================

export interface VehicleColor {
  colorName: string;
  colorImage: string; // swatch thumbnail
  vehicleImage: string; // main interactive vehicle image
  price: bigint;
}

export interface VehicleVariant {
  variantName: string;
  hasPremiumOption: boolean;
  thumbnailUrl: string;
  price: bigint;
  colors: VehicleColor[];
}

export interface SpecCell {
  value: string;
  colSpan: number;
}

export interface SpecRow {
  cells: SpecCell[];
}

export interface SpecTab {
  title: string;
  columns: string[];
  rows: SpecRow[];
}

export interface PassengerVehicle {
  id: bigint;
  vehicleName: string;
  description: string;
  slug: string;
  heroImageUrl: string;
  brochureUrl: string;
  variants: VehicleVariant[];
  specTabs: SpecTab[];
  footnotes: string[];
  aftersaleImages: string[];
  ctaText: string;
  ctaSubtext: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
  publishStatus: boolean;
  vehicleType: string;
  titleImageUrl?: string;
  heroBannerVideoId?: string;
  displayOrder: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

// ============================================================
// EXISTING VEHICLE TYPES (updated with new fields)
// ============================================================

export interface Vehicle {
  id: bigint;
  vehicleName: string;
  description: string;
  publishStatus: boolean;
  heroImageUrl: string;
  brochureUrl: string;
  variants: VehicleVariant[];
}

export interface Variant {
  id: bigint;
  vehicleId: bigint;
  name: string;
  displayOrder: bigint;
  overridePrice?: bigint;
}

export interface Color {
  id: bigint;
  vehicleId: bigint;
  name: string;
  colorCode?: string;
  active: boolean;
}

export interface VehicleImage {
  id: bigint;
  vehicleId: bigint;
  variantId?: bigint;
  colorId?: bigint;
  imageId: string;
  default: boolean;
}

export interface Specification {
  id: bigint;
  vehicleId: bigint;
  name: string;
  value: string;
}

export interface Feature {
  id: bigint;
  vehicleId: bigint;
  name: string;
  description: string;
}

// VehicleCatalog — DO NOT MODIFY
export interface VehicleCatalog {
  vehicle: Vehicle;
  variants: Variant[];
  colors: Color[];
  images: VehicleImage[];
  specifications: Specification[];
  features: Feature[];
}

export interface Promotion {
  id: bigint;
  title: string;
  slug: string;
  description: string;
  // Candid ?Text comes back as [] | [string] from backend
  imageId: [] | [string];
  vehicleRef: [] | [string];
  vehicleRefType: [] | [string];
  startDate: bigint;
  endDate: bigint;
  termsAndConditions: string;
  tags: string[];
  active: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Testimonial {
  id: bigint;
  customerName: string;
  customerPhotoId: string;
  customerCity: string;
  rating: number;
  message: string;
  vehicleRef: string;
  vehicleRefType: string;
  vehicleName: string;
  vehicleUrl: string;
  active: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface BlogPost {
  id: bigint;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageId: string;
  category: string;
  tags: string[];
  author: string;
  authorTitle: string;
  authorAvatarId: string;
  published: boolean;
  publishedAt: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  likeCount: bigint;
  commentCount: bigint;
  readTimeMinutes: bigint;
}

export interface BlogComment {
  id: bigint;
  postId: bigint;
  parentId: bigint | null;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: bigint;
  replies: BlogComment[];
}

export interface MediaAsset {
  id: bigint;
  filename: string;
  storageUrl: string;
  mimeType: string;
  size: bigint;
  uploadedBy: Principal;
  uploadedAt: bigint;
}

export interface WebsiteSettings {
  siteName: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  dealerAddress: string;
  operationalHours: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  mainBannerImageId?: bigint;
  ctaBannerImageId?: bigint;
  lastUpdated: bigint;
}

// Updated to match the new Principal-based AdminRecord from the backend.
// Fields: principal, role, createdAt, updatedAt — no name, email, or password.
export interface AdminUser {
  principal: Principal;
  role: UserRole;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface ContactSubmission {
  id: bigint;
  userId?: Principal;
  name: string;
  email: string;
  message: string;
  timestamp: bigint;
}

export interface CreditSimulation {
  id: bigint;
  userId: Principal;
  vehicleId: bigint;
  amount: bigint;
  term: bigint;
  timestamp: bigint;
}

export interface VisitorStats {
  totalVisitors: bigint;
  todayVisitors: bigint;
  yesterdayVisitors: bigint;
  weeklyVisitors: bigint;
  monthlyVisitors: bigint;
  yearlyVisitors: bigint;
  onlineUsers: bigint;
  pageViews: bigint;
}

export interface CommercialVehicleCategory {
  id: bigint;
  name: string;
  description: string;
  imageId?: string;
  displayOrder: bigint;
}

// ============================================================
// COMMERCIAL VEHICLE TYPES
// ============================================================

export interface CommercialSpecItem {
  key: string;
  value: string;
}

export interface CommercialVehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  description: string;
  chassisPrice: number;
  heroImage: string;
  heroTitle: string;
  heroSubtext: string;
  mainImages: string[];
  chassisImage: string;
  cabinImage: string;
  brochureUrl: string;
  footnote: string;
  specifications: CommercialSpecItem[];
  displayOrder: number;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
}

// ============================================================
// CREDIT SIMULATION TYPES
// ============================================================

export interface CreditSettings {
  adminFee: number;
  interestRatePerYear: number;
  insurancePercent: number;
  provisionPercent: number;
  footnote: string;
  updatedAt: number;
}

export type CreditRequirementItem = {
  item: string;
};

export interface CreditRequirementTab {
  id: string;
  tabName: string;
  requirements: { item: string }[];
  order: number;
}

export interface Lead {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  vehicleType: string;
  otr: number;
  dp: number;
  tenor: number;
  monthlyInstallment: number;
  source: string;
  createdAt: number;
}
