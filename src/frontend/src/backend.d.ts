import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PassengerVehicle {
    id: bigint;
    heroImageUrl: string;
    vehicleName: string;
    vehicleType: string;
    brochureUrl: string;
    displayOrder: bigint;
    createdAt: bigint;
    slug: string;
    publishStatus: boolean;
    description: string;
    variants: Array<VehicleVariant>;
    ctaButtonLabel: string;
    specTabs: Array<SpecTab>;
    updatedAt: bigint;
    ctaText: string;
    ctaSubtext: string;
    ctaButtonUrl: string;
    titleImageUrl?: string;
    footnotes: Array<string>;
    heroBannerVideoId?: string;
    aftersaleImages: Array<string>;
}
export interface VehicleVariant {
    thumbnailUrl: string;
    hasPremiumOption: boolean;
    variantName: string;
    colors: Array<VehicleColor>;
    price: bigint;
}
export interface MediaAsset {
    id: bigint;
    size: bigint;
    mimeType: string;
    filename: string;
    storageUrl: string;
    uploadedAt: bigint;
    uploadedBy: Principal;
}
export interface VisitorStats {
    visitorsThisWeek: bigint;
    visitorsYesterday: bigint;
    visitorsThisYear: bigint;
    onlineNow: bigint;
    totalVisitors: bigint;
    visitorsToday: bigint;
    pageViewsToday: bigint;
    visitorsThisMonth: bigint;
}
export interface Lead {
    dp: bigint;
    id: string;
    otr: bigint;
    tenor: bigint;
    vehicleType: string;
    source: string;
    name: string;
    createdAt: bigint;
    email: string;
    address: string;
    monthlyInstallment: bigint;
    phone: string;
}
export interface CreditRequirementTab {
    id: string;
    order: bigint;
    tabName: string;
    requirements: Array<CreditRequirementItem>;
}
export interface CreditSettings {
    provisionPercent: number;
    insurancePercent: number;
    adminFee: bigint;
    footnote: string;
    updatedAt: bigint;
    interestRatePerYear: number;
}
export interface BannerImage {
    id: bigint;
    bannerType: BannerImageType;
    size: bigint;
    mimeType: string;
    filename: string;
    storageUrl: string;
    uploadedAt: bigint;
    uploadedBy: Principal;
}
export interface VisitorSession {
    lastActivity: bigint;
    isOnline: boolean;
    firstVisit: bigint;
    sessionId: string;
    ipAddress: string;
}
export interface SpecRow {
    cells: Array<SpecCell>;
}
export interface SpecCell {
    value: string;
    colSpan: bigint;
}
export interface Visit {
    id: string;
    referrer: string;
    visitedAt: bigint;
    pageUrl: string;
    deviceType: string;
    browser: string;
    sessionId: string;
    userAgent: string;
    ipAddress: string;
}
export interface WebsiteSettings {
    mainBannerImageId?: bigint;
    dealerAddress: string;
    salesConsultantPhotoId?: bigint;
    operationalHours: string;
    lastUpdated: bigint;
    mainBannerVideoId?: bigint;
    instagramUrl: string;
    ctaBannerImageId?: bigint;
    siteName: string;
    footerAboutText?: string;
    mainBannerImageId2?: bigint;
    contactEmail: string;
    contactWhatsapp: string;
    youtubeUrl: string;
    facebookUrl: string;
    salesConsultantName?: string;
    homepageBannerMode?: string;
    contactPhone: string;
    tiktokUrl: string;
}
export interface BlogPost {
    id: bigint;
    title: string;
    likeCount: bigint;
    content: string;
    coverImageId: string;
    published: boolean;
    createdAt: bigint;
    slug: string;
    tags: Array<string>;
    publishedAt: bigint;
    author: string;
    updatedAt: bigint;
    authorAvatarId: string;
    excerpt: string;
    commentCount: bigint;
    category: string;
    authorTitle: string;
    readTimeMinutes: bigint;
}
export interface Promotion {
    id: bigint;
    title: string;
    active: boolean;
    endDate: bigint;
    vehicleRef?: string;
    createdAt: bigint;
    slug: string;
    tags: Array<string>;
    description: string;
    vehicleRefType?: string;
    updatedAt: bigint;
    termsAndConditions: string;
    imageId?: string;
    startDate: bigint;
}
export interface BlogComment {
    id: bigint;
    content: string;
    name: string;
    createdAt: bigint;
    email: string;
    approved: boolean;
    parentId?: bigint;
    postId: bigint;
}
export interface SpecTab {
    title: string;
    rows: Array<SpecRow>;
    columns: Array<string>;
}
export interface VehicleColor {
    colorName: string;
    vehicleImage: string;
    price: bigint;
    colorImage: string;
}
export interface CommercialVehicle {
    id: string;
    specifications: Array<CommercialSpecItem>;
    subCategory: string;
    brochureUrl: string;
    isPublished: boolean;
    displayOrder: bigint;
    footnote: string;
    name: string;
    createdAt: bigint;
    slug: string;
    mainImages: Array<string>;
    description: string;
    chassisImage: string;
    heroImage: string;
    chassisPrice: bigint;
    updatedAt: bigint;
    cabinImage: string;
    category: string;
    heroTitle: string;
    heroSubtext: string;
}
export interface CommercialSpecItem {
    key: string;
    value: string;
}
export interface CreditRequirementItem {
    item: string;
}
export interface AdminRecord {
    principal: Principal;
    createdAt: bigint;
    role: UserRole;
    updatedAt: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export interface Testimonial {
    id: bigint;
    customerName: string;
    vehicleName: string;
    active: boolean;
    vehicleRef: string;
    vehicleUrl: string;
    createdAt: bigint;
    vehicleRefType: string;
    updatedAt: bigint;
    message: string;
    rating: bigint;
    customerPhotoId: string;
    customerCity: string;
}
export enum BannerImageType {
    mainBanner = "mainBanner",
    ctaBanner = "ctaBanner"
}
export enum UserRole {
    admin = "admin",
    super_admin = "super_admin"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBlogComment(postId: bigint, parentId: bigint | null, name: string, email: string, content: string): Promise<bigint>;
    addBlogPost(title: string, slug: string, excerpt: string, content: string, coverImageId: string, category: string, tags: Array<string>, author: string, authorTitle: string, authorAvatarId: string, published: boolean): Promise<bigint>;
    addCommercialVehicle(name: string, slug: string, category: string, subCategory: string, description: string, chassisPrice: bigint, heroImage: string, heroTitle: string, heroSubtext: string, mainImages: Array<string>, chassisImage: string, cabinImage: string, brochureUrl: string, footnote: string, specifications: Array<CommercialSpecItem>, isPublished: boolean): Promise<string>;
    addCreditRequirementTab(tabName: string, requirements: Array<CreditRequirementItem>, order: bigint): Promise<CreditRequirementTab>;
    addLead(name: string, address: string, email: string, phone: string, vehicleType: string, otr: bigint, dp: bigint, tenor: bigint, monthlyInstallment: bigint, source: string, createdAt: bigint): Promise<Lead>;
    addPassengerVehicle(vehicleName: string, description: string, heroImageUrl: string, brochureUrl: string, variants: Array<VehicleVariant>, specTabs: Array<SpecTab>, publishStatus: boolean, slug: string, footnotes: Array<string>, aftersaleImages: Array<string>, ctaText: string, ctaSubtext: string, ctaButtonLabel: string, ctaButtonUrl: string, vehicleType: string, titleImageUrl: string | null, heroBannerVideoId: string | null): Promise<bigint>;
    addPromo(title: string, slug: string, description: string, imageId: string | null, vehicleRef: string | null, vehicleRefType: string | null, startDate: bigint, endDate: bigint, termsAndConditions: string, tags: Array<string>, active: boolean): Promise<bigint>;
    addTestimonial(customerName: string, customerPhotoId: string, customerCity: string, rating: bigint, message: string, vehicleRef: string, vehicleRefType: string, vehicleName: string, vehicleUrl: string, active: boolean): Promise<bigint>;
    approveBlogComment(id: bigint): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
    clearAllMediaAssets(): Promise<void>;
    deleteAdmin(principal: Principal): Promise<void>;
    deleteBlogComment(id: bigint): Promise<boolean>;
    deleteBlogPost(id: bigint): Promise<boolean>;
    deleteCommercialVehicle(id: string): Promise<boolean>;
    deleteCreditRequirementTab(id: string): Promise<boolean>;
    deleteLead(id: string): Promise<boolean>;
    deleteMediaAsset(id: bigint): Promise<boolean>;
    deletePassengerVehicle(id: bigint): Promise<boolean>;
    deletePromo(id: bigint): Promise<boolean>;
    deleteTestimonial(id: bigint): Promise<boolean>;
    forceBecomeAdmin(): Promise<string>;
    forceSetMeAsSuperAdmin(): Promise<string>;
    getAdmins(): Promise<Array<AdminRecord>>;
    getAllBlogComments(): Promise<Array<BlogComment>>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllCommercialVehicles(): Promise<Array<CommercialVehicle>>;
    getAllCreditRequirementTabs(): Promise<Array<CreditRequirementTab>>;
    getAllLeads(): Promise<Array<Lead>>;
    getAllMediaAssets(): Promise<Array<MediaAsset>>;
    getAllPassengerVehicles(): Promise<Array<PassengerVehicle>>;
    getAllPromos(): Promise<Array<Promotion>>;
    getAllTestimonials(): Promise<Array<Testimonial>>;
    getAllVisitorSessions(): Promise<Array<VisitorSession>>;
    getAllVisits(): Promise<Array<Visit>>;
    getApprovedCommentsByPostId(postId: bigint): Promise<Array<BlogComment>>;
    getAssetsByDateRange(startDate: bigint, endDate: bigint): Promise<Array<MediaAsset>>;
    getAssetsByUploader(uploader: Principal): Promise<Array<MediaAsset>>;
    getBannerImages(): Promise<Array<BannerImage>>;
    getBlogPostById(id: bigint): Promise<BlogPost | null>;
    getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
    getBlogPostsByCategory(category: string): Promise<Array<BlogPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCommercialVehicleBySlug(categorySlug: string, vehicleSlug: string): Promise<CommercialVehicle | null>;
    getCommercialVehicleCountByCategory(category: string): Promise<bigint>;
    getCommercialVehiclesByCategory(category: string): Promise<Array<CommercialVehicle>>;
    getCreditSettings(): Promise<CreditSettings>;
    getDailyVisitorTrend(): Promise<Array<[bigint, bigint]>>;
    getMediaAssetById(id: bigint): Promise<MediaAsset | null>;
    getMyRole(): Promise<UserRole | null>;
    getOnlineUsers(): Promise<bigint>;
    getPassengerVehicleById(id: bigint): Promise<PassengerVehicle | null>;
    getPromoById(id: bigint): Promise<Promotion | null>;
    getPromoBySlug(slug: string): Promise<Promotion | null>;
    getPublicMediaAssetById(id: bigint): Promise<MediaAsset | null>;
    getPublicVisitorStats(): Promise<VisitorStats>;
    getPublishedBlogPosts(): Promise<Array<BlogPost>>;
    getPublishedCommercialVehicles(): Promise<Array<CommercialVehicle>>;
    getPublishedPassengerVehicles(): Promise<Array<PassengerVehicle>>;
    getPublishedPromos(): Promise<Array<Promotion>>;
    getPublishedTestimonials(): Promise<Array<Testimonial>>;
    getStableVisitorStats(): Promise<VisitorStats>;
    getTestimonialById(id: bigint): Promise<Testimonial | null>;
    getTopPageViews(): Promise<Array<[string, bigint]>>;
    getTotalPageViews(): Promise<bigint>;
    getTotalVisitors(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorStats(): Promise<VisitorStats>;
    getWebsiteSettings(): Promise<WebsiteSettings>;
    initAdmin(): Promise<string>;
    initializeFirstAdmin(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    likeBlogPost(id: bigint): Promise<void>;
    periodicCleanup(): Promise<void>;
    reorderCommercialVehicles(ids: Array<string>): Promise<void>;
    reorderPassengerVehicles(ids: Array<bigint>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    togglePassengerVehiclePublishStatus(id: bigint): Promise<boolean>;
    trackVisitor(sessionId: string, ipAddress: string, userAgent: string, pageUrl: string, referrer: string, deviceType: string, browser: string): Promise<void>;
    updateAdminRole(principal: Principal, newRole: UserRole): Promise<void>;
    updateBlogPost(id: bigint, title: string, slug: string, excerpt: string, content: string, coverImageId: string, category: string, tags: Array<string>, author: string, authorTitle: string, authorAvatarId: string, published: boolean): Promise<void>;
    updateCommercialVehicle(id: string, name: string, slug: string, category: string, subCategory: string, description: string, chassisPrice: bigint, heroImage: string, heroTitle: string, heroSubtext: string, mainImages: Array<string>, chassisImage: string, cabinImage: string, brochureUrl: string, footnote: string, specifications: Array<CommercialSpecItem>, isPublished: boolean): Promise<boolean>;
    updateCreditRequirementTab(id: string, tabName: string, requirements: Array<CreditRequirementItem>, order: bigint): Promise<CreditRequirementTab>;
    updateCreditSettings(adminFee: bigint, interestRatePerYear: number, insurancePercent: number, provisionPercent: number, footnote: string): Promise<CreditSettings>;
    updateMediaAsset(id: bigint, newFilename: string, newMimeType: string, newStorageUrl: string, newSize: bigint): Promise<void>;
    updatePassengerVehicle(id: bigint, vehicleName: string, description: string, heroImageUrl: string, brochureUrl: string, variants: Array<VehicleVariant>, specTabs: Array<SpecTab>, publishStatus: boolean, slug: string, footnotes: Array<string>, aftersaleImages: Array<string>, ctaText: string, ctaSubtext: string, ctaButtonLabel: string, ctaButtonUrl: string, vehicleType: string, titleImageUrl: string | null, heroBannerVideoId: string | null): Promise<void>;
    updatePromo(id: bigint, title: string, slug: string, description: string, imageId: string | null, vehicleRef: string | null, vehicleRefType: string | null, startDate: bigint, endDate: bigint, termsAndConditions: string, tags: Array<string>, active: boolean): Promise<void>;
    updateTestimonial(id: bigint, customerName: string, customerPhotoId: string, customerCity: string, rating: bigint, message: string, vehicleRef: string, vehicleRefType: string, vehicleName: string, vehicleUrl: string, active: boolean): Promise<void>;
    updateWebsiteSettings(newSettings: WebsiteSettings): Promise<void>;
    uploadBannerImage(filename: string, bannerType: BannerImageType, mimeType: string, storageUrl: string, fileSize: bigint): Promise<bigint>;
    uploadMediaAsset(filename: string, mimeType: string, storageUrl: string, fileSize: bigint): Promise<bigint>;
    whoAmI(): Promise<string>;
}
