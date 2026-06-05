import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Int "mo:core/Int";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";




actor {
  include MixinObjectStorage();

  // V1: old type matching the existing canister stable var — used only for migration
  type WebsiteSettingsV1 = {
    siteName : Text;
    contactPhone : Text;
    contactWhatsapp : Text;
    contactEmail : Text;
    dealerAddress : Text;
    operationalHours : Text;
    facebookUrl : Text;
    instagramUrl : Text;
    tiktokUrl : Text;
    youtubeUrl : Text;
    mainBannerImageId : ?Nat;
    ctaBannerImageId : ?Nat;
    lastUpdated : Int;
  };

  // Base type used for stable storage — must NOT change fields to preserve upgrade compatibility
  type WebsiteSettingsBase = {
    siteName : Text;
    contactPhone : Text;
    contactWhatsapp : Text;
    contactEmail : Text;
    dealerAddress : Text;
    operationalHours : Text;
    facebookUrl : Text;
    instagramUrl : Text;
    tiktokUrl : Text;
    youtubeUrl : Text;
    mainBannerImageId : ?Nat;
    ctaBannerImageId : ?Nat;
    lastUpdated : Int;
    salesConsultantName : ?Text;
    salesConsultantPhotoId : ?Nat;
    footerAboutText : ?Text;
  };

  // Full public API type — includes the 3 new fields stored in separate stable vars
  public type WebsiteSettings = {
    siteName : Text;
    contactPhone : Text;
    contactWhatsapp : Text;
    contactEmail : Text;
    dealerAddress : Text;
    operationalHours : Text;
    facebookUrl : Text;
    instagramUrl : Text;
    tiktokUrl : Text;
    youtubeUrl : Text;
    mainBannerImageId : ?Nat;
    ctaBannerImageId : ?Nat;
    lastUpdated : Int;
    salesConsultantName : ?Text;
    salesConsultantPhotoId : ?Nat;
    footerAboutText : ?Text;
    mainBannerImageId2 : ?Nat;
    mainBannerVideoId : ?Nat;
    homepageBannerMode : ?Text;
  };


  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let variants = Map.empty<Nat, Variant>();
  let colors = Map.empty<Nat, Color>();
  let variantColorMappings = Map.empty<Nat, VariantColorMapping>();
  let vehicleImages = Map.empty<Nat, VehicleImage>();
  let specifications = Map.empty<Nat, Specification>();
  let features = Map.empty<Nat, Feature>();
  let promotions = Map.empty<Nat, Promotion>();
  let testimonials = Map.empty<Nat, Testimonial>();
  let blogPosts = Map.empty<Nat, BlogPost>();
  let blogComments = Map.empty<Nat, BlogComment>();
  let commercialVehicleCategories = Map.empty<Nat, CommercialVehicleCategory>();
  let idMapping = Map.empty<Text, Nat>();
  let vehicles = Map.empty<Nat, Vehicle>();
  let creditSimulations = Map.empty<Nat, CreditSimulation>();
  let bannerImages = Map.empty<Nat, BannerImage>();
  let metaStore = Map.empty<Text, MetaEntry>();

  // ============================================================
  // PASSENGER VEHICLE — Runtime maps
  // `passengerVehicles` keeps old V3 type name to load old canister state on upgrade
  // `passengerVehiclesData` is the live map with current V4 schema
  // ============================================================
  let passengerVehicles = Map.empty<Nat, PassengerVehicleV3>();
  let passengerVehiclesData = Map.empty<Nat, PassengerVehicle>();

  // ============================================================
  // COMMERCIAL VEHICLE — Runtime map
  // ============================================================
  let commercialVehicles = Map.empty<Text, CommercialVehicle>();

  // ============================================================
  // CREDIT REQUIREMENT TABS — Runtime map
  // ============================================================
  let creditRequirementTabs = Map.empty<Text, CreditRequirementTab>();

  // ============================================================
  // LEADS — Runtime map
  // ============================================================
  let leadsMap = Map.empty<Text, Lead>();

  // ============================================================
  // MEDIA MANAGER — Runtime map (restored from stable on upgrade)
  // ============================================================
  let mediaAssets = Map.empty<Nat, MediaAsset>();

  // Old stable var — kept so Motoko can deserialize existing canister state on upgrade.
  stable var websiteSettings : WebsiteSettingsV1 = {
    siteName = "";
    contactPhone = "";
    contactWhatsapp = "";
    contactEmail = "";
    dealerAddress = "";
    operationalHours = "";
    facebookUrl = "";
    instagramUrl = "";
    tiktokUrl = "";
    youtubeUrl = "";
    mainBannerImageId = null;
    ctaBannerImageId = null;
    lastUpdated = -1;
  };

  stable var websiteSettings_v2 : ?WebsiteSettingsBase = null;

  stable var ws_ext_mainBannerImageId2 : ?Nat = null;
  stable var ws_ext_mainBannerVideoId : ?Nat = null;
  stable var ws_ext_homepageBannerMode : Text = "1 image";

  // ============================================================
  // MEDIA MANAGER — Stable storage (survives canister upgrades)
  // ============================================================
  stable var stableMediaAssets : [MediaAsset] = [];
  stable var stableMediaAssetIdCounter : Nat = 1;

  // ============================================================
  // PASSENGER VEHICLE — Stable storage
  // v2: old schema (no titleImageUrl, no displayOrder) — kept for migration only
  // v3: schema with titleImageUrl/displayOrder but no heroBannerVideoId — kept for migration
  // v4: current schema (includes heroBannerVideoId)
  // ============================================================
  stable var stablePassengerVehicles_v2 : [PassengerVehicleV2] = [];
  stable var stablePassengerVehicles_v3 : [PassengerVehicleV3] = [];
  stable var stablePassengerVehicles_v4 : [PassengerVehicle] = [];
  stable var stablePassengerVehicleIdCounter : Nat = 1;

  // ============================================================
  // PROMOTION — Stable storage
  // ============================================================
  stable var stablePromotions : [(Nat, Promotion)] = [];
  stable var stablePromotionIdCounter : Nat = 1;

  // ============================================================
  // TESTIMONIAL — Stable storage
  // ============================================================
  stable var stableTestimonials : [(Nat, Testimonial)] = [];
  stable var stableTestimonialIdCounter : Nat = 1;

  // ============================================================
  // BLOG POST — Stable storage
  // ============================================================
  stable var stableBlogPosts : [(Nat, BlogPost)] = [];
  stable var stableBlogPostIdCounter : Nat = 1;

  // ============================================================
  // BLOG COMMENT — Stable storage
  // ============================================================
  stable var stableBlogComments : [(Nat, BlogComment)] = [];
  stable var stableBlogCommentIdCounter : Nat = 1;

  // ============================================================
  // COMMERCIAL VEHICLE — Stable storage
  // ============================================================
  stable var stableCommercialVehicles : [(Text, CommercialVehicle)] = [];
  stable var stableCommercialVehicleIdCounter : Nat = 1;

  // ============================================================
  // CREDIT SETTINGS — Stable storage
  // ============================================================
  stable var creditSettings : ?CreditSettings = null;

  // ============================================================
  // CREDIT REQUIREMENT TABS — Stable storage
  // ============================================================
  stable var stableCreditRequirementTabs : [(Text, CreditRequirementTab)] = [];

  // ============================================================
  // LEADS — Stable storage
  // ============================================================
  stable var stableLeads : [(Text, Lead)] = [];

  var _websiteSettingsRuntime : WebsiteSettingsBase = {
    siteName = "";
    contactPhone = "";
    contactWhatsapp = "";
    contactEmail = "";
    dealerAddress = "";
    operationalHours = "";
    facebookUrl = "";
    instagramUrl = "";
    tiktokUrl = "";
    youtubeUrl = "";
    mainBannerImageId = null;
    ctaBannerImageId = null;
    lastUpdated = -1;
    salesConsultantName = null;
    salesConsultantPhotoId = null;
    footerAboutText = null;
  };

  let productLikes = Map.empty<Nat, ProductLike>();
  let productShares = Map.empty<Nat, ProductShare>();
  let articleComments = Map.empty<Nat, ArticleComment>();
  let contactSubmissions = Map.empty<Nat, ContactSubmission>();

  let visitorSessions = Map.empty<Text, VisitorSession>();
  let visits = Map.empty<Text, Visit>();
  let pageViewsMap = Map.empty<Text, Nat>();
  let dailySessionSet = Map.empty<Text, Bool>();

  var visitorStats : VisitorStats = {
    totalVisitors = 0;
    visitorsToday = 0;
    visitorsYesterday = 0;
    visitorsThisWeek = 0;
    visitorsThisMonth = 0;
    visitorsThisYear = 0;
    onlineNow = 0;
    pageViewsToday = 0;
  };

  let dailyStats = Map.empty<Int, DailyStats>();

  public type UserRole = {
    #super_admin;
    #admin;
  };

  public type AdminRecord = {
    principal : Principal;
    role : UserRole;
    createdAt : Int;
    updatedAt : Int;
  };

  stable var adminStore : [(Principal, AdminRecord)] = [];
  let userProfiles = Map.empty<Principal, UserProfile>();

  var variantIdCounter = 1;
  var colorIdCounter = 1;
  var mappingIdCounter = 1;
  var imageIdCounter = 1;
  var specIdCounter = 1;
  var featureIdCounter = 1;
  var promotionIdCounter = 1;
  var testimonialIdCounter = 1;
  var blogPostIdCounter = 1;
  var blogCommentIdCounter = 1;
  // Media asset ID counter — runtime, synced with stable on upgrade
  var mediaAssetIdCounter : Nat = 1;
  var commercialCategoryIdCounter = 1;
  var vehicleIdCounter = 1;
  var creditSimCounter = 1;
  var bannerImageIdCounter = 1;
  var likeCounter = 1;
  var shareCounter = 1;
  var commentCounter = 1;
  var contactCounter = 1;
  var visitIdCounter = 1;
  // Passenger vehicle ID counter — runtime, synced with stable on upgrade
  var passengerVehicleIdCounter : Nat = 1;
  // Commercial vehicle ID counter — runtime, synced with stable on upgrade
  var commercialVehicleIdCounter : Nat = 1;
  var creditRequirementTabIdCounter : Nat = 1;
  var leadIdCounter : Nat = 1;

  public type DailyStats = {
    date : Int;
    visitors : Nat;
    pageViews : Nat;
  };

  public type VisitorSession = {
    sessionId : Text;
    ipAddress : Text;
    firstVisit : Int;
    lastActivity : Int;
    isOnline : Bool;
  };

  public type Visit = {
    id : Text;
    sessionId : Text;
    ipAddress : Text;
    userAgent : Text;
    pageUrl : Text;
    referrer : Text;
    deviceType : Text;
    browser : Text;
    visitedAt : Int;
  };

  public type Variant = {
    id : Nat;
    vehicleId : Nat;
    name : Text;
    displayOrder : Nat;
    overridePrice : ?Nat;
  };

  public type Color = {
    id : Nat;
    vehicleId : Nat;
    name : Text;
    colorCode : ?Text;
    active : Bool;
  };

  public type VariantColorMapping = {
    id : Nat;
    vehicleId : Nat;
    variantId : Nat;
    colorId : Nat;
    available : Bool;
  };

  public type ArticleComment = {
    id : Nat;
    userId : Principal;
    articleId : Nat;
    content : Text;
    timestamp : Int;
  };

  public type VehicleImage = {
    id : Nat;
    vehicleId : Nat;
    variantId : ?Nat;
    colorId : ?Nat;
    imageId : Text;
    default : Bool;
  };

  public type Specification = {
    id : Nat;
    vehicleId : Nat;
    name : Text;
    value : Text;
  };

  public type Feature = {
    id : Nat;
    vehicleId : Nat;
    name : Text;
    description : Text;
  };

  public type CreditSimulation = {
    id : Nat;
    userId : Principal;
    vehicleId : Nat;
    amount : Nat;
    term : Nat;
    timestamp : Int;
  };

  public type ProductLike = {
    id : Nat;
    userId : Principal;
    vehicleId : Nat;
    timestamp : Int;
  };

  public type ProductShare = {
    id : Nat;
    userId : Principal;
    vehicleId : Nat;
    timestamp : Int;
  };

  public type ContactSubmission = {
    id : Nat;
    userId : ?Principal;
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  public type Vehicle = {
    id : Nat;
    vehicleName : Text;
    description : Text;
    basePrice : Nat;
    publishStatus : Bool;
  };

  public type VehicleCatalog = {
    vehicle : Vehicle;
    variants : [Variant];
    colors : [Color];
    variantColorMappings : [VariantColorMapping];
    images : [VehicleImage];
    specifications : [Specification];
    features : [Feature];
  };

  public type Promotion = {
    id : Nat;
    title : Text;
    slug : Text;
    description : Text;
    imageId : ?Text;
    vehicleRef : ?Text;
    vehicleRefType : ?Text;
    startDate : Int;
    endDate : Int;
    termsAndConditions : Text;
    tags : [Text];
    active : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Testimonial = {
    id : Nat;
    customerName : Text;
    customerPhotoId : Text;
    customerCity : Text;
    rating : Nat;
    message : Text;
    vehicleRef : Text;
    vehicleRefType : Text;
    vehicleName : Text;
    vehicleUrl : Text;
    active : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type BlogPost = {
    id : Nat;
    title : Text;
    slug : Text;
    excerpt : Text;
    content : Text;
    coverImageId : Text;
    category : Text;
    tags : [Text];
    author : Text;
    authorTitle : Text;
    authorAvatarId : Text;
    published : Bool;
    publishedAt : Int;
    createdAt : Int;
    updatedAt : Int;
    likeCount : Nat;
    commentCount : Nat;
    readTimeMinutes : Nat;
  };

  public type BlogComment = {
    id : Nat;
    postId : Nat;
    parentId : ?Nat;
    name : Text;
    email : Text;
    content : Text;
    approved : Bool;
    createdAt : Int;
  };

  // ============================================================
  // MEDIA ASSET TYPE
  // Supports: images (jpg/png/webp), videos (mp4/webm/mov), PDFs
  // ============================================================
  public type MediaAsset = {
    id : Nat;
    filename : Text;
    mimeType : Text;
    size : Nat;
    uploadedBy : Principal;
    uploadedAt : Int;
    storageUrl : Text;
  };

  public type CommercialVehicleCategory = {
    id : Nat;
    name : Text;
    description : Text;
    imageId : ?Text;
    displayOrder : Nat;
  };

  public type BannerImageType = {
    #mainBanner;
    #ctaBanner;
  };

  public type BannerImage = {
    id : Nat;
    filename : Text;
    bannerType : BannerImageType;
    mimeType : Text;
    size : Nat;
    uploadedBy : Principal;
    uploadedAt : Int;
    storageUrl : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  public type VisitorStats = {
    totalVisitors : Nat;
    visitorsToday : Nat;
    visitorsYesterday : Nat;
    visitorsThisWeek : Nat;
    visitorsThisMonth : Nat;
    visitorsThisYear : Nat;
    onlineNow : Nat;
    pageViewsToday : Nat;
  };

  public type MetaEntry = {
    key : Text;
    value : Text;
    lastUpdated : Int;
  };

  // ============================================================
  // PASSENGER VEHICLE MODULE TYPES
  // ============================================================
  public type VehicleColor = {
    colorName : Text;
    colorImage : Text;
    vehicleImage : Text;
    price : Nat;
  };

  public type VehicleVariant = {
    variantName : Text;
    hasPremiumOption : Bool;
    thumbnailUrl : Text;
    price : Nat;
    colors : [VehicleColor];
  };

  public type SpecCell = {
    value : Text;
    colSpan : Nat;
  };

  public type SpecRow = {
    cells : [SpecCell];
  };

  public type SpecTab = {
    title : Text;
    columns : [Text];
    rows : [SpecRow];
  };

  // V2: old schema — kept only for migration from stablePassengerVehicles_v2
  type PassengerVehicleV2 = {
    id : Nat;
    vehicleName : Text;
    description : Text;
    heroImageUrl : Text;
    brochureUrl : Text;
    variants : [VehicleVariant];
    specTabs : [SpecTab];
    publishStatus : Bool;
    createdAt : Int;
    updatedAt : Int;
    slug : Text;
    footnotes : [Text];
    aftersaleImages : [Text];
    ctaText : Text;
    ctaSubtext : Text;
    ctaButtonLabel : Text;
    ctaButtonUrl : Text;
    vehicleType : Text;
  };

  // V3: schema with titleImageUrl and displayOrder but without heroBannerVideoId — kept for migration
  type PassengerVehicleV3 = {
    id : Nat;
    vehicleName : Text;
    description : Text;
    heroImageUrl : Text;
    brochureUrl : Text;
    variants : [VehicleVariant];
    specTabs : [SpecTab];
    publishStatus : Bool;
    createdAt : Int;
    updatedAt : Int;
    slug : Text;
    footnotes : [Text];
    aftersaleImages : [Text];
    ctaText : Text;
    ctaSubtext : Text;
    ctaButtonLabel : Text;
    ctaButtonUrl : Text;
    vehicleType : Text;
    titleImageUrl : ?Text;
    displayOrder : Nat;
  };

  public type PassengerVehicle = {
    id : Nat;
    vehicleName : Text;
    description : Text;
    heroImageUrl : Text;
    brochureUrl : Text;
    variants : [VehicleVariant];
    specTabs : [SpecTab];
    publishStatus : Bool;
    createdAt : Int;
    updatedAt : Int;
    slug : Text;
    footnotes : [Text];
    aftersaleImages : [Text];
    ctaText : Text;
    ctaSubtext : Text;
    ctaButtonLabel : Text;
    ctaButtonUrl : Text;
    vehicleType : Text;
    titleImageUrl : ?Text;
    heroBannerVideoId : ?Text;
    displayOrder : Nat;
  };

  // ============================================================
  // COMMERCIAL VEHICLE MODULE TYPES
  // ============================================================
  public type CommercialSpecItem = {
    key : Text;
    value : Text;
  };

  // ============================================================
  // CREDIT SIMULATION & LEADS MODULE TYPES
  // ============================================================
  public type CreditRequirementItem = { item : Text };

  public type CreditSettings = {
    adminFee : Nat;
    interestRatePerYear : Float;
    insurancePercent : Float;
    provisionPercent : Float;
    footnote : Text;
    updatedAt : Int;
  };

  public type CreditRequirementTab = {
    id : Text;
    tabName : Text;
    requirements : [CreditRequirementItem];
    order : Nat;
  };

  public type Lead = {
    id : Text;
    name : Text;
    address : Text;
    email : Text;
    phone : Text;
    vehicleType : Text;
    otr : Nat;
    dp : Nat;
    tenor : Nat;
    monthlyInstallment : Nat;
    source : Text;
    createdAt : Int;
  };

  public type CommercialVehicle = {
    id : Text;
    name : Text;
    slug : Text;
    category : Text;
    subCategory : Text;
    description : Text;
    chassisPrice : Nat;
    heroImage : Text;
    heroTitle : Text;
    heroSubtext : Text;
    mainImages : [Text];
    chassisImage : Text;
    cabinImage : Text;
    brochureUrl : Text;
    footnote : Text;
    specifications : [CommercialSpecItem];
    displayOrder : Nat;
    isPublished : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  // ============================================================
  // HELPER: check if MIME type is allowed
  // Allowed: images, videos, PDF
  // ============================================================
  func isAllowedMimeType(mimeType : Text) : Bool {
    mimeType == "image/jpeg" or
    mimeType == "image/jpg" or
    mimeType == "image/png" or
    mimeType == "image/webp" or
    mimeType == "image/gif" or
    mimeType == "video/mp4" or
    mimeType == "video/webm" or
    mimeType == "video/quicktime" or
    mimeType == "application/pdf"
  };

  func promoteToSuperAdmin(caller : Principal) {
    let currentAdmins = adminStore.map(
      func((principal, record)) {
        if (principal == caller) {
          (principal, { record with role = #super_admin });
        } else {
          (principal, record);
        };
      }
    );
    adminStore := currentAdmins;
  };

  func superAdminCount() : Nat {
    adminStore.filter(func((_, record)) { record.role == #super_admin }).size();
  };

  func bootstrapIfEmpty(caller : Principal) : Bool {
    if (adminStore.size() == 0) {
      let now = Time.now();
      let newAdmin : AdminRecord = {
        principal = caller;
        role = #super_admin;
        createdAt = now;
        updatedAt = now;
      };
      adminStore := [(caller, newAdmin)];
      return true;
    };
    false;
  };

  func recoverSuperAdminIfNeeded(caller : Principal) {
    if (superAdminCount() == 0) {
      switch (findAdminRecord(caller)) {
        case (?(_, _)) {
          promoteToSuperAdmin(caller);
        };
        case (null) {};
      };
    };
  };

  func findAdminRecord(p : Principal) : ?(Principal, AdminRecord) {
    adminStore.find(
      func((principal, _)) { principal == p }
    );
  };

  func callerIsSuperAdmin(caller : Principal) : Bool {
    switch (findAdminRecord(caller)) {
      case (?(_, record)) { record.role == #super_admin };
      case (null) { false };
    };
  };

  func callerIsAnyAdmin(caller : Principal) : Bool {
    switch (findAdminRecord(caller)) {
      case (?(_, _)) { true };
      case (null) { false };
    };
  };

  func isSuperAdmin(p : Principal) : Bool {
    switch (findAdminRecord(p)) {
      case (?(_, record)) { record.role == #super_admin };
      case (null) { false };
    };
  };

  func isToday(timestamp : Int, now : Int) : Bool {
    let nowNanos = now;
    let dayNanos = 24 * 60 * 60 * 1_000_000_000;
    (timestamp >= (nowNanos - dayNanos) and timestamp <= nowNanos);
  };

  func isYesterday(timestamp : Int, now : Int) : Bool {
    let nowNanos = now;
    let dayNanos = 24 * 60 * 60 * 1_000_000_000;
    let yesterdayStart = nowNanos - (2 * dayNanos);
    (timestamp >= yesterdayStart and timestamp < (yesterdayStart + dayNanos));
  };

  func isThisWeek(timestamp : Int, now : Int) : Bool {
    let nowNanos = now;
    let weekNanos = 7 * 24 * 60 * 60 * 1_000_000_000;
    (timestamp >= (nowNanos - weekNanos));
  };

  func isThisMonth(timestamp : Int, now : Int) : Bool {
    let nowNanos = now;
    let monthNanos = 30 * 24 * 60 * 60 * 1_000_000_000;
    (timestamp >= (nowNanos - monthNanos));
  };

  func isThisYear(timestamp : Int, now : Int) : Bool {
    let nowNanos = now;
    let yearNanos = 365 * 24 * 60 * 60 * 1_000_000_000;
    (timestamp >= (nowNanos - yearNanos));
  };

  func cleanupExpiredSessionsInternal() {
    let currentTime = Time.now();
    let timeout = 5 * 60 * 1_000_000_000;

    for ((sessionId, session) in visitorSessions.entries()) {
      if (currentTime - session.lastActivity > timeout and session.isOnline) {
        let updatedSession = { session with isOnline = false };
        visitorSessions.add(sessionId, updatedSession);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user)) and not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user)) and not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared func trackVisitor(
    sessionId : Text,
    ipAddress : Text,
    userAgent : Text,
    pageUrl : Text,
    referrer : Text,
    deviceType : Text,
    browser : Text,
  ) : async () {
    let currentTime = Time.now();

    let visit : Visit = {
      id = visitIdCounter.toText();
      sessionId;
      ipAddress;
      userAgent;
      pageUrl;
      referrer;
      deviceType;
      browser;
      visitedAt = currentTime;
    };
    visits.add(visit.id, visit);
    visitIdCounter += 1;

    let updatedSession = switch (visitorSessions.get(sessionId)) {
      case (?existingSession) {
        {
          existingSession with
          lastActivity = currentTime;
          isOnline = true;
        };
      };
      case (null) {
        {
          sessionId;
          ipAddress;
          firstVisit = currentTime;
          lastActivity = currentTime;
          isOnline = true;
        };
      };
    };
    visitorSessions.add(sessionId, updatedSession);

    let currentViewCount = switch (pageViewsMap.get(pageUrl)) {
      case (?count) { count };
      case (null) { 0 };
    };
    pageViewsMap.add(pageUrl, currentViewCount + 1);

    let dayKey = Int.abs(currentTime / (24 * 60 * 60 * 1_000_000_000)).toText();
    let dedupKey = sessionId # "-" # dayKey;
    let isNewSession = switch (dailySessionSet.get(dedupKey)) {
      case (null) {
        dailySessionSet.add(dedupKey, true);
        true;
      };
      case (?_) { false };
    };
    updateDailyStats(currentTime, isNewSession);

    visitorStats := recalculateStats();
  };

  func updateDailyStats(timestamp : Int, isNewSession : Bool) {
    let day = Int.abs((timestamp / (24 * 60 * 60 * 1_000_000_000)) * (24 * 60 * 60 * 1_000_000_000));
    switch (dailyStats.get(day)) {
      case (?existingStats) {
        let updatedStats = {
          existingStats with
          pageViews = existingStats.pageViews + 1;
          visitors = if (isNewSession) { existingStats.visitors + 1 } else { existingStats.visitors };
        };
        dailyStats.add(day, updatedStats);
      };
      case (null) {
        let newStats = {
          date = day;
          visitors = if (isNewSession) { 1 } else { 0 };
          pageViews = 1;
        };
        dailyStats.add(day, newStats);
      };
    };
  };

  public shared ({ caller }) func cleanupExpiredSessions() : async () {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can cleanup expired sessions");
    };
    cleanupExpiredSessionsInternal();
  };

  func recalculateStats() : VisitorStats {
    let currentTime = Time.now();

    let todayVisitors = visitorSessions.values().toArray().filter(
      func(session) { isToday(session.firstVisit, currentTime) }
    ).size();

    let yesterdayVisitors = visitorSessions.values().toArray().filter(
      func(session) { isYesterday(session.firstVisit, currentTime) }
    ).size();

    let thisWeekVisitors = visitorSessions.values().toArray().filter(
      func(session) { isThisWeek(session.firstVisit, currentTime) }
    ).size();

    let thisMonthVisitors = visitorSessions.values().toArray().filter(
      func(session) { isThisMonth(session.firstVisit, currentTime) }
    ).size();

    let thisYearVisitors = visitorSessions.values().toArray().filter(
      func(session) { isThisYear(session.firstVisit, currentTime) }
    ).size();

    let pageViewsToday = visits.values().toArray().filter(
      func(visit) { isToday(visit.visitedAt, currentTime) }
    ).size();

    let onlineCount = visitorSessions.values().toArray().filter(
      func(session) {
        currentTime - session.lastActivity <= 5 * 60 * 1_000_000_000
      }
    ).size();

    {
      visitorStats with
      visitorsToday = todayVisitors;
      visitorsYesterday = yesterdayVisitors;
      visitorsThisWeek = thisWeekVisitors;
      visitorsThisMonth = thisMonthVisitors;
      visitorsThisYear = thisYearVisitors;
      onlineNow = onlineCount;
      pageViewsToday;
      totalVisitors = visitorSessions.size();
    };
  };

  public query ({ caller }) func getTotalVisitors() : async Nat {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view visitor statistics");
    };
    visitorSessions.size();
  };

  public query ({ caller }) func getOnlineUsers() : async Nat {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view visitor statistics");
    };

    let currentTime = Time.now();
    let timeout = 5 * 60 * 1_000_000_000;

    visitorSessions.values().toArray().filter(func(session) {
      currentTime - session.lastActivity <= timeout and session.isOnline
    }).size();
  };

  public query ({ caller }) func getTotalPageViews() : async Nat {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view visitor statistics");
    };

    visits.size();
  };

  public query ({ caller }) func getVisitorStats() : async VisitorStats {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view visitor statistics");
    };
    visitorStats;
  };

  public query func getPublicVisitorStats() : async VisitorStats {
    visitorStats;
  };

  public query func getDailyVisitorTrend() : async [(Int, Nat)] {
    let currentTime = Time.now();
    let trendList = dailyStats.toArray().filter(
      func((day, _)) { day >= (currentTime - 30 * 24 * 60 * 60 * 1_000_000_000) }
    );

    trendList.map(func((timestamp, stats)) { (timestamp, stats.visitors) });
  };

  public query func getTopPageViews() : async [(Text, Nat)] {
    let sorted = pageViewsMap.toArray().sort(
      func(a : (Text, Nat), b : (Text, Nat)) : { #less; #equal; #greater } {
        if (a.1 > b.1) { #less } else if (a.1 < b.1) { #greater } else {
          #equal;
        };
      }
    );
    let len = if (sorted.size() < 10) { sorted.size() } else { 10 };
    Array.tabulate<(Text, Nat)>(
      len,
      func(i) { sorted[i] }
    );
  };

  public shared ({ caller }) func periodicCleanup() : async () {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can trigger periodic cleanup");
    };
    cleanupExpiredSessionsInternal();
  };

  public query ({ caller }) func getAllVisitorSessions() : async [VisitorSession] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all visitor sessions");
    };
    visitorSessions.values().toArray();
  };

  public query ({ caller }) func getAllVisits() : async [Visit] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all visits");
    };
    visits.values().toArray();
  };

  public query ({ caller }) func getStableVisitorStats() : async VisitorStats {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view visitor statistics");
    };
    visitorStats;
  };

  // ============================================================
  // MEDIA MANAGER — Upload
  //
  // Supports: image/jpeg, image/png, image/webp, image/gif,
  //           video/mp4, video/webm, video/quicktime,
  //           application/pdf
  //
  // Returns: Nat — the assigned asset ID
  // Storage: stored in runtime map + persisted via stable storage
  // ============================================================
  public shared ({ caller }) func uploadMediaAsset(
    filename : Text,
    mimeType : Text,
    storageUrl : Text,
    fileSize : Nat,
  ) : async Nat {
    // Bootstrap admin store if empty (handles first call after fresh deployment)
    ignore bootstrapIfEmpty(caller);
    
    // Only logged-in admins can upload
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can upload media assets");
    };

    // Reject empty storageUrl
    if (storageUrl == "") {
      Runtime.trap("Upload failed: storageUrl is empty");
    };

    // Validate MIME type
    if (not isAllowedMimeType(mimeType)) {
      Runtime.trap("Upload failed: unsupported file type. Allowed: images (jpg/png/webp), videos (mp4/webm/mov), PDF");
    };

    // Assign ID
    let assetId : Nat = mediaAssetIdCounter;

    // Build asset record
    let asset : MediaAsset = {
      id = assetId;
      filename = filename;
      mimeType = mimeType;
      size = fileSize;
      uploadedBy = caller;
      uploadedAt = Time.now();
      storageUrl = storageUrl;
    };

    // Insert into runtime map
    mediaAssets.add(assetId, asset);

    // Increment counter AFTER insert
    mediaAssetIdCounter += 1;

    // Return the assigned ID so frontend can reference this asset
    assetId;
  };

  // ============================================================
  // MEDIA MANAGER — List all assets
  // Returns all stored media assets ordered by upload time (newest first)
  // ============================================================
  public query ({ caller }) func getAllMediaAssets() : async [MediaAsset] {
    if (not callerIsAnyAdmin(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can list media assets");
    };
    let all = mediaAssets.values().toArray();
    // Sort by uploadedAt descending (newest first)
    all.sort(func(a : MediaAsset, b : MediaAsset) : { #less; #equal; #greater } {
      if (a.uploadedAt > b.uploadedAt) { #less }
      else if (a.uploadedAt < b.uploadedAt) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // MEDIA MANAGER — Get single asset by ID (authenticated)
  // ============================================================
  public query ({ caller }) func getMediaAssetById(id : Nat) : async ?MediaAsset {
    if (not callerIsAnyAdmin(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can access media assets");
    };
    mediaAssets.get(id);
  };

  // ============================================================
  // MEDIA MANAGER — Get single asset by ID (public, no auth)
  // Used by public pages to render banner images / videos
  // ============================================================
  public query func getPublicMediaAssetById(id : Nat) : async ?MediaAsset {
    mediaAssets.get(id);
  };

  // ============================================================
  // MEDIA MANAGER — Delete asset
  // Only the admin who uploaded OR any admin can delete
  // ============================================================
  public shared ({ caller }) func deleteMediaAsset(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can delete media assets");
    };
    switch (mediaAssets.get(id)) {
      case (null) {
        Runtime.trap("Media asset not found");
      };
      case (?_) {
        mediaAssets.remove(id);
        true;
      };
    };
  };


  // ============================================================
  // MEDIA MANAGER — Clear all media assets
  // ============================================================
  public shared ({ caller }) func clearAllMediaAssets() : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can clear media assets");
    };
    for ((id, _) in mediaAssets.entries()) {
      mediaAssets.remove(id);
    };
    stableMediaAssets := [];
    mediaAssetIdCounter := 0;
  };
  // ============================================================
  // MEDIA MANAGER — Update asset metadata
  // ============================================================
  public shared ({ caller }) func updateMediaAsset(
    id : Nat,
    newFilename : Text,
    newMimeType : Text,
    newStorageUrl : Text,
    newSize : Nat,
  ) : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can update media assets");
    };
    switch (mediaAssets.get(id)) {
      case (null) {
        Runtime.trap("Media asset not found");
      };
      case (?existing) {
        let updated : MediaAsset = {
          existing with
          filename = newFilename;
          mimeType = newMimeType;
          storageUrl = newStorageUrl;
          size = newSize;
        };
        mediaAssets.remove(id);
        mediaAssets.add(id, updated);
      };
    };
  };

  // ============================================================
  // MEDIA MANAGER — Assets by uploader (admin only)
  // ============================================================
  public query ({ caller }) func getAssetsByUploader(uploader : Principal) : async [MediaAsset] {
    if (not callerIsAnyAdmin(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can query assets by uploader");
    };
    mediaAssets.values().toArray().filter(
      func(asset : MediaAsset) : Bool { asset.uploadedBy == uploader }
    );
  };

  // ============================================================
  // MEDIA MANAGER — Assets by date range (admin only)
  // ============================================================
  public query ({ caller }) func getAssetsByDateRange(startDate : Int, endDate : Int) : async [MediaAsset] {
    if (not callerIsAnyAdmin(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can query assets by date");
    };
    mediaAssets.values().toArray().filter(
      func(asset : MediaAsset) : Bool {
        asset.uploadedAt >= startDate and asset.uploadedAt <= endDate
      }
    );
  };

  // ============================================================
  // Banner images (separate from Media Manager)
  // ============================================================
  public shared ({ caller }) func uploadBannerImage(
    filename : Text,
    bannerType : BannerImageType,
    mimeType : Text,
    storageUrl : Text,
    fileSize : Nat,
  ) : async Nat {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can upload banner images");
    };

    let uploadedAt = Time.now();
    let bannerImage : BannerImage = {
      id = bannerImageIdCounter;
      filename;
      bannerType;
      mimeType;
      size = fileSize;
      storageUrl;
      uploadedBy = caller;
      uploadedAt;
    };

    bannerImages.add(bannerImageIdCounter, bannerImage);
    let returnId = bannerImageIdCounter;
    bannerImageIdCounter += 1;
    returnId;
  };

  public query func getBannerImages() : async [BannerImage] {
    bannerImages.values().toArray();
  };

  public shared ({ caller }) func updateWebsiteSettings(newSettings : WebsiteSettings) : async () {
    switch (findAdminRecord(caller)) {
      case (?(_, admin)) {
        switch (admin.role) {
          case (#super_admin) { /* allow */ };
          case (_) { Runtime.trap("Unauthorized: super admin only can update website settings") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: not an admin") };
    };
    _websiteSettingsRuntime := {
      siteName = newSettings.siteName;
      contactPhone = newSettings.contactPhone;
      contactWhatsapp = newSettings.contactWhatsapp;
      contactEmail = newSettings.contactEmail;
      dealerAddress = newSettings.dealerAddress;
      operationalHours = newSettings.operationalHours;
      facebookUrl = newSettings.facebookUrl;
      instagramUrl = newSettings.instagramUrl;
      tiktokUrl = newSettings.tiktokUrl;
      youtubeUrl = newSettings.youtubeUrl;
      mainBannerImageId = newSettings.mainBannerImageId;
      ctaBannerImageId = newSettings.ctaBannerImageId;
      lastUpdated = Time.now();
      salesConsultantName = newSettings.salesConsultantName;
      salesConsultantPhotoId = newSettings.salesConsultantPhotoId;
      footerAboutText = newSettings.footerAboutText;
    };
    ws_ext_mainBannerImageId2 := newSettings.mainBannerImageId2;
    ws_ext_mainBannerVideoId := newSettings.mainBannerVideoId;
    ws_ext_homepageBannerMode := switch (newSettings.homepageBannerMode) {
      case (?m) { m };
      case (null) { "1 image" };
    };
  };

  public query func getWebsiteSettings() : async WebsiteSettings {
    {
      _websiteSettingsRuntime with
      mainBannerImageId2 = ws_ext_mainBannerImageId2;
      mainBannerVideoId = ws_ext_mainBannerVideoId;
      homepageBannerMode = ?ws_ext_homepageBannerMode;
    }
  };

  public shared ({ caller }) func getAdmins() : async [AdminRecord] {
    ignore bootstrapIfEmpty(caller);
    recoverSuperAdminIfNeeded(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view the admin list");
    };
    adminStore.map(func((_, record)) { record });
  };

  public shared ({ caller }) func updateAdminRole(principal : Principal, newRole : UserRole) : async () {
    switch (findAdminRecord(caller)) {
      case (?(_, admin)) {
        switch (admin.role) {
          case (#super_admin) { /* allow */ };
          case (_) { Runtime.trap("Unauthorized: super admin only") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: not an admin") };
    };
    ignore bootstrapIfEmpty(caller);
    recoverSuperAdminIfNeeded(caller);
    switch (findAdminRecord(principal)) {
      case (null) {
        Runtime.trap("Admin not found for the given principal");
      };
      case (?(_, existingRecord)) {
        let now = Time.now();
        let updatedRecord : AdminRecord = {
          existingRecord with
          role = newRole;
          updatedAt = now;
        };
        adminStore := adminStore.map(func((p, record)) {
          if (p == principal) {
            (p, updatedRecord);
          } else {
            (p, record);
          };
        });
      };
    };
  };

  public shared ({ caller }) func deleteAdmin(principal : Principal) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super_admins can delete admins");
    };
    ignore bootstrapIfEmpty(caller);
    recoverSuperAdminIfNeeded(caller);
    if (adminStore.size() <= 1) {
      Runtime.trap("Cannot delete the last remaining admin");
    };
    switch (findAdminRecord(principal)) {
      case (null) {
        Runtime.trap("Admin not found for the given principal");
      };
      case (?_) {
        adminStore := adminStore.filter(func((p, _)) { p != principal });
      };
    };
  };

  public shared ({ caller }) func getMyRole() : async ?UserRole {
    ignore bootstrapIfEmpty(caller);
    recoverSuperAdminIfNeeded(caller);
    switch (findAdminRecord(caller)) {
      case (?(_, record)) { ?record.role };
      case (null) { null };
    };
  };

  public shared ({ caller }) func whoAmI() : async Text {
    caller.toText();
  };

  public shared ({ caller }) func forceSetMeAsSuperAdmin() : async Text {
    let found = findAdminRecord(caller);
    switch (found) {
      case (?(_p, _existingAdmin)) {
        adminStore := adminStore.map(
          func((p, adminRecord)) {
            if (p == caller) {
              (p, { adminRecord with role = #super_admin });
            } else {
              (p, adminRecord);
            };
          }
        );
        "Caller " # caller.toText() # " is now super_admin.";
      };
      case (null) {
        let now = Time.now();
        let newAdmin = {
          principal = caller;
          role = #super_admin;
          createdAt = now;
          updatedAt = now;
        };
        adminStore := Array.empty<(Principal, AdminRecord)>().concat([(caller, newAdmin)]);
        "Created new super admin " # caller.toText();
      };
    };
  };

  public shared ({ caller }) func initializeFirstAdmin() : async Text {
    if (adminStore.size() > 0) {
      return "Admin already initialized";
    };
    let now = Time.now();
    let newAdmin : AdminRecord = {
      principal = caller;
      role = #super_admin;
      createdAt = now;
      updatedAt = now;
    };
    adminStore := [(caller, newAdmin)];
    "First admin initialized: " # caller.toText();
  };

  // ============================================================
  // INIT ADMIN — Safe bootstrap via AccessControl
  // Uses AccessControl.initialize with an empty token so the first
  // authenticated caller gets the #admin role in the in-memory state.
  // ============================================================
  public shared ({ caller }) func initAdmin() : async Text {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return "Already admin";
    };
    // initialize() assigns #admin to the first caller when adminAssigned = false
    AccessControl.initialize(accessControlState, caller);
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return "First admin initialized";
    };
    return "Admin already exists, contact existing admin";
  };

  // ============================================================
  // FORCE BECOME ADMIN — Dev/recovery escape hatch
  // Directly assigns #admin role via assignRole using caller as both
  // the authority and the target (bypasses the isAdmin guard in a
  // fresh in-memory state by calling initialize first).
  // ============================================================
  public shared ({ caller }) func forceBecomeAdmin() : async Text {
    // Reset adminAssigned so initialize() will grant admin to caller
    accessControlState.adminAssigned := false;
    AccessControl.initialize(accessControlState, caller);
    return "You are now admin";
  };

  // ============================================================
  // PASSENGER VEHICLE — Add
  // ============================================================
  public shared ({ caller }) func addPassengerVehicle(
    vehicleName : Text,
    description : Text,
    heroImageUrl : Text,
    brochureUrl : Text,
    variants : [VehicleVariant],
    specTabs : [SpecTab],
    publishStatus : Bool,
    slug : Text,
    footnotes : [Text],
    aftersaleImages : [Text],
    ctaText : Text,
    ctaSubtext : Text,
    ctaButtonLabel : Text,
    ctaButtonUrl : Text,
    vehicleType : Text,
    titleImageUrl : ?Text,
    heroBannerVideoId : ?Text,
  ) : async Nat {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add passenger vehicles");
    };
    // Compute next displayOrder = max existing displayOrder + 1
    var maxOrder : Nat = 0;
    for (v in passengerVehiclesData.values()) {
      if (v.displayOrder > maxOrder) {
        maxOrder := v.displayOrder;
      };
    };
    let now = Time.now();
    let id = passengerVehicleIdCounter;
    let vehicle : PassengerVehicle = {
      id;
      vehicleName;
      description;
      heroImageUrl;
      brochureUrl;
      variants;
      specTabs;
      publishStatus;
      createdAt = now;
      updatedAt = now;
      slug;
      footnotes;
      aftersaleImages;
      ctaText;
      ctaSubtext;
      ctaButtonLabel;
      ctaButtonUrl;
      vehicleType;
      titleImageUrl;
      heroBannerVideoId;
      displayOrder = maxOrder + 1;
    };
    passengerVehiclesData.add(id, vehicle);
    passengerVehicleIdCounter += 1;
    id;
  };

  // ============================================================
  // PASSENGER VEHICLE — Update
  // ============================================================
  public shared ({ caller }) func updatePassengerVehicle(
    id : Nat,
    vehicleName : Text,
    description : Text,
    heroImageUrl : Text,
    brochureUrl : Text,
    variants : [VehicleVariant],
    specTabs : [SpecTab],
    publishStatus : Bool,
    slug : Text,
    footnotes : [Text],
    aftersaleImages : [Text],
    ctaText : Text,
    ctaSubtext : Text,
    ctaButtonLabel : Text,
    ctaButtonUrl : Text,
    vehicleType : Text,
    titleImageUrl : ?Text,
    heroBannerVideoId : ?Text,
  ) : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update passenger vehicles");
    };
    switch (passengerVehiclesData.get(id)) {
      case (null) {
        Runtime.trap("Passenger vehicle not found");
      };
      case (?existing) {
        let updated : PassengerVehicle = {
          existing with
          vehicleName;
          description;
          heroImageUrl;
          brochureUrl;
          variants;
          specTabs;
          publishStatus;
          updatedAt = Time.now();
          slug;
          footnotes;
          aftersaleImages;
          ctaText;
          ctaSubtext;
          ctaButtonLabel;
          ctaButtonUrl;
          vehicleType;
          titleImageUrl;
          heroBannerVideoId;
        };
        passengerVehiclesData.add(id, updated);
      };
    };
  };

  // ============================================================
  // PASSENGER VEHICLE — Delete
  // ============================================================
  public shared ({ caller }) func deletePassengerVehicle(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete passenger vehicles");
    };
    switch (passengerVehiclesData.get(id)) {
      case (null) {
        Runtime.trap("Passenger vehicle not found");
      };
      case (?_) {
        passengerVehiclesData.remove(id);
        true;
      };
    };
  };

  // ============================================================
  // PASSENGER VEHICLE — Toggle publish status
  // ============================================================
  public shared ({ caller }) func togglePassengerVehiclePublishStatus(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle passenger vehicle publish status");
    };
    switch (passengerVehiclesData.get(id)) {
      case (null) {
        Runtime.trap("Passenger vehicle not found");
      };
      case (?existing) {
        let newStatus = not existing.publishStatus;
        let updated : PassengerVehicle = {
          existing with
          publishStatus = newStatus;
          updatedAt = Time.now();
        };
        passengerVehiclesData.add(id, updated);
        newStatus;
      };
    };
  };

  // ============================================================
  // PASSENGER VEHICLE — Get all (admin only)
  // ============================================================
  public query ({ caller }) func getAllPassengerVehicles() : async [PassengerVehicle] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all passenger vehicles");
    };
    let all = passengerVehiclesData.values().toArray();
    all.sort(func(a : PassengerVehicle, b : PassengerVehicle) : { #less; #equal; #greater } {
      if (a.displayOrder < b.displayOrder) { #less }
      else if (a.displayOrder > b.displayOrder) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // PASSENGER VEHICLE — Get published (public)
  // ============================================================
  public query func getPublishedPassengerVehicles() : async [PassengerVehicle] {
    let published = passengerVehiclesData.values().toArray().filter(
      func(v : PassengerVehicle) : Bool { v.publishStatus }
    );
    published.sort(func(a : PassengerVehicle, b : PassengerVehicle) : { #less; #equal; #greater } {
      if (a.displayOrder < b.displayOrder) { #less }
      else if (a.displayOrder > b.displayOrder) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // PASSENGER VEHICLE — Get by ID (public)
  // ============================================================
  public query func getPassengerVehicleById(id : Nat) : async ?PassengerVehicle {
    passengerVehiclesData.get(id);
  };

  // ============================================================
  // PASSENGER VEHICLE — Reorder (admin only)
  // ids: ordered array of vehicle IDs; index+1 becomes displayOrder
  // ============================================================
  public shared ({ caller }) func reorderPassengerVehicles(ids : [Nat]) : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can reorder passenger vehicles");
    };
    var i : Nat = 0;
    while (i < ids.size()) {
      let vehicleId = ids[i];
      switch (passengerVehiclesData.get(vehicleId)) {
        case (?existing) {
          passengerVehiclesData.add(vehicleId, { existing with displayOrder = i + 1 });
        };
        case (null) {}; // skip missing IDs
      };
      i += 1;
    };
  };

  // ============================================================
  // SLUG GENERATION HELPER
  // ============================================================
  func generateSlug(text : Text) : Text {
    // Lowercase and convert non-alphanumeric chars to hyphens
    let lower = text.map(func(c : Char) : Char {
      if (c >= 'A' and c <= 'Z') {
        Char.fromNat32(c.toNat32() + 32)
      } else { c }
    });
    let slug = lower.map(func(c : Char) : Char {
      if ((c >= 'a' and c <= 'z') or (c >= '0' and c <= '9')) { c }
      else { '-' }
    });
    // Collapse consecutive hyphens and trim leading/trailing hyphens
    var result = "";
    var lastWasHyphen = true; // start true to trim leading hyphens
    for (c in slug.chars()) {
      if (c == '-') {
        if (not lastWasHyphen) {
          result #= "-";
          lastWasHyphen := true;
        };
      } else {
        result #= Text.fromChar(c);
        lastWasHyphen := false;
      };
    };
    // Trim trailing hyphen
    if (result.size() > 0 and result.endsWith(#char '-')) {
      let chars = result.chars().toArray();
      var trimmed = "";
      var i = 0;
      while (i + 1 < chars.size()) {
        trimmed #= Text.fromChar(chars[i]);
        i += 1;
      };
      trimmed
    } else {
      result
    }
  };

  // ============================================================
  // PROMOTION — Add
  // ============================================================
  public shared ({ caller }) func addPromo(
    title : Text,
    slug : Text,
    description : Text,
    imageId : ?Text,
    vehicleRef : ?Text,
    vehicleRefType : ?Text,
    startDate : Int,
    endDate : Int,
    termsAndConditions : Text,
    tags : [Text],
    active : Bool,
  ) : async Nat {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add promos");
    };
    let finalSlug = if (slug.trim(#char ' ').size() == 0) { generateSlug(title) } else { generateSlug(slug) };
    let now = Time.now();
    let id = promotionIdCounter;
    let promo : Promotion = {
      id;
      title;
      slug = finalSlug;
      description;
      imageId;
      vehicleRef;
      vehicleRefType;
      startDate;
      endDate;
      termsAndConditions;
      tags;
      active;
      createdAt = now;
      updatedAt = now;
    };
    promotions.add(id, promo);
    promotionIdCounter += 1;
    id;
  };

  // ============================================================
  // PROMOTION — Update
  // ============================================================
  public shared ({ caller }) func updatePromo(
    id : Nat,
    title : Text,
    slug : Text,
    description : Text,
    imageId : ?Text,
    vehicleRef : ?Text,
    vehicleRefType : ?Text,
    startDate : Int,
    endDate : Int,
    termsAndConditions : Text,
    tags : [Text],
    active : Bool,
  ) : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update promos");
    };
    switch (promotions.get(id)) {
      case (null) { Runtime.trap("Promo not found") };
      case (?existing) {
        let updated : Promotion = {
          existing with
          title;
          slug = if (slug.trim(#char ' ').size() == 0) { existing.slug } else { generateSlug(slug) };
          description;
          imageId;
          vehicleRef;
          vehicleRefType;
          startDate;
          endDate;
          termsAndConditions;
          tags;
          active;
          updatedAt = Time.now();
        };
        promotions.add(id, updated);
      };
    };
  };

  // ============================================================
  // PROMOTION — Delete
  // ============================================================
  public shared ({ caller }) func deletePromo(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete promos");
    };
    switch (promotions.get(id)) {
      case (null) { false };
      case (?_) {
        promotions.remove(id);
        true;
      };
    };
  };

  // ============================================================
  // PROMOTION — Get all (admin)
  // ============================================================
  public query ({ caller }) func getAllPromos() : async [Promotion] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all promos");
    };
    promotions.values().toArray();
  };

  // ============================================================
  // PROMOTION — Get published (public, sorted by startDate desc)
  // ============================================================
  public query func getPublishedPromos() : async [Promotion] {
    let active = promotions.values().toArray().filter(
      func(p : Promotion) : Bool { p.active }
    );
    active.sort(func(a : Promotion, b : Promotion) : { #less; #equal; #greater } {
      if (a.startDate > b.startDate) { #less }
      else if (a.startDate < b.startDate) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // PROMOTION — Get by slug (public)
  // ============================================================
  public query func getPromoBySlug(slug : Text) : async ?Promotion {
    promotions.values().toArray().find(func(p : Promotion) : Bool { p.slug == generateSlug(slug) });
  };

  // ============================================================
  // PROMOTION — Get by ID (public)
  // ============================================================
  public query func getPromoById(id : Nat) : async ?Promotion {
    promotions.get(id);
  };

  // ============================================================
  // TESTIMONIAL — Add
  // ============================================================
  public shared ({ caller }) func addTestimonial(
    customerName : Text,
    customerPhotoId : Text,
    customerCity : Text,
    rating : Nat,
    message : Text,
    vehicleRef : Text,
    vehicleRefType : Text,
    vehicleName : Text,
    vehicleUrl : Text,
    active : Bool,
  ) : async Nat {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add testimonials");
    };
    let now = Time.now();
    let id = testimonialIdCounter;
    let testimonial : Testimonial = {
      id;
      customerName;
      customerPhotoId;
      customerCity;
      rating;
      message;
      vehicleRef;
      vehicleRefType;
      vehicleName;
      vehicleUrl;
      active;
      createdAt = now;
      updatedAt = now;
    };
    testimonials.add(id, testimonial);
    testimonialIdCounter += 1;
    id;
  };

  // ============================================================
  // TESTIMONIAL — Update
  // ============================================================
  public shared ({ caller }) func updateTestimonial(
    id : Nat,
    customerName : Text,
    customerPhotoId : Text,
    customerCity : Text,
    rating : Nat,
    message : Text,
    vehicleRef : Text,
    vehicleRefType : Text,
    vehicleName : Text,
    vehicleUrl : Text,
    active : Bool,
  ) : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update testimonials");
    };
    switch (testimonials.get(id)) {
      case (null) { Runtime.trap("Testimonial not found") };
      case (?existing) {
        let updated : Testimonial = {
          existing with
          customerName;
          customerPhotoId;
          customerCity;
          rating;
          message;
          vehicleRef;
          vehicleRefType;
          vehicleName;
          vehicleUrl;
          active;
          updatedAt = Time.now();
        };
        testimonials.add(id, updated);
      };
    };
  };

  // ============================================================
  // TESTIMONIAL — Delete
  // ============================================================
  public shared ({ caller }) func deleteTestimonial(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete testimonials");
    };
    switch (testimonials.get(id)) {
      case (null) { false };
      case (?_) {
        testimonials.remove(id);
        true;
      };
    };
  };

  // ============================================================
  // TESTIMONIAL — Get all (admin)
  // ============================================================
  public query ({ caller }) func getAllTestimonials() : async [Testimonial] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all testimonials");
    };
    testimonials.values().toArray();
  };

  // ============================================================
  // TESTIMONIAL — Get published (public, sorted by createdAt desc)
  // ============================================================
  public query func getPublishedTestimonials() : async [Testimonial] {
    let active = testimonials.values().toArray().filter(
      func(t : Testimonial) : Bool { t.active }
    );
    active.sort(func(a : Testimonial, b : Testimonial) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // TESTIMONIAL — Get by ID (public)
  // ============================================================
  public query func getTestimonialById(id : Nat) : async ?Testimonial {
    testimonials.get(id);
  };

  // ============================================================
  // BLOG POST — Add
  // ============================================================
  public shared ({ caller }) func addBlogPost(
    title : Text,
    slug : Text,
    excerpt : Text,
    content : Text,
    coverImageId : Text,
    category : Text,
    tags : [Text],
    author : Text,
    authorTitle : Text,
    authorAvatarId : Text,
    published : Bool,
  ) : async Nat {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add blog posts");
    };
    let finalSlug = if (slug.trim(#char ' ').size() == 0) { generateSlug(title) } else { generateSlug(slug) };
    let now = Time.now();
    let id = blogPostIdCounter;
    let rawMinutes = content.size() / 1000;
    let readTimeMinutes = if (rawMinutes < 1) { 1 } else { rawMinutes };
    let post : BlogPost = {
      id;
      title;
      slug = finalSlug;
      excerpt;
      content;
      coverImageId;
      category;
      tags;
      author;
      authorTitle;
      authorAvatarId;
      published;
      publishedAt = if (published) { now } else { 0 };
      createdAt = now;
      updatedAt = now;
      likeCount = 0;
      commentCount = 0;
      readTimeMinutes;
    };
    blogPosts.add(id, post);
    blogPostIdCounter += 1;
    id;
  };

  // ============================================================
  // BLOG POST — Update
  // ============================================================
  public shared ({ caller }) func updateBlogPost(
    id : Nat,
    title : Text,
    slug : Text,
    excerpt : Text,
    content : Text,
    coverImageId : Text,
    category : Text,
    tags : [Text],
    author : Text,
    authorTitle : Text,
    authorAvatarId : Text,
    published : Bool,
  ) : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update blog posts");
    };
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?existing) {
        let now = Time.now();
        let rawMinutes = content.size() / 1000;
        let readTimeMinutes = if (rawMinutes < 1) { 1 } else { rawMinutes };
        // Set publishedAt only when transitioning from draft to published
        let newPublishedAt = if (published and not existing.published) { now } else { existing.publishedAt };
        let updated : BlogPost = {
          existing with
          title;
          slug = if (slug.trim(#char ' ').size() == 0) { existing.slug } else { generateSlug(slug) };
          excerpt;
          content;
          coverImageId;
          category;
          tags;
          author;
          authorTitle;
          authorAvatarId;
          published;
          publishedAt = newPublishedAt;
          updatedAt = now;
          readTimeMinutes;
        };
        blogPosts.add(id, updated);
      };
    };
  };

  // ============================================================
  // BLOG POST — Delete (also removes all comments for this post)
  // ============================================================
  public shared ({ caller }) func deleteBlogPost(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete blog posts");
    };
    switch (blogPosts.get(id)) {
      case (null) { false };
      case (?_) {
        blogPosts.remove(id);
        // Remove all comments for this post
        let toDelete = blogComments.values().toArray().filter(
          func(c : BlogComment) : Bool { c.postId == id }
        );
        for (comment in toDelete.vals()) {
          blogComments.remove(comment.id);
        };
        true;
      };
    };
  };

  // ============================================================
  // BLOG POST — Get all (admin, sorted by createdAt desc)
  // ============================================================
  public query ({ caller }) func getAllBlogPosts() : async [BlogPost] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all blog posts");
    };
    let all = blogPosts.values().toArray();
    all.sort(func(a : BlogPost, b : BlogPost) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // BLOG POST — Get published (public, sorted by publishedAt desc)
  // ============================================================
  public query func getPublishedBlogPosts() : async [BlogPost] {
    let published = blogPosts.values().toArray().filter(
      func(p : BlogPost) : Bool { p.published }
    );
    published.sort(func(a : BlogPost, b : BlogPost) : { #less; #equal; #greater } {
      if (a.publishedAt > b.publishedAt) { #less }
      else if (a.publishedAt < b.publishedAt) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // BLOG POST — Get by slug (public, any status)
  // ============================================================
  public query func getBlogPostBySlug(slug : Text) : async ?BlogPost {
    blogPosts.values().toArray().find(
      func(p : BlogPost) : Bool { p.slug == generateSlug(slug) }
    );
  };

  // ============================================================
  // BLOG POST — Get by ID (admin, any status)
  // ============================================================
  public query func getBlogPostById(id : Nat) : async ?BlogPost {
    blogPosts.get(id);
  };

  // ============================================================
  // BLOG POST — Get by category (public, only published)
  // ============================================================
  public query func getBlogPostsByCategory(category : Text) : async [BlogPost] {
    let filtered = blogPosts.values().toArray().filter(
      func(p : BlogPost) : Bool { p.published and p.category == category }
    );
    filtered.sort(func(a : BlogPost, b : BlogPost) : { #less; #equal; #greater } {
      if (a.publishedAt > b.publishedAt) { #less }
      else if (a.publishedAt < b.publishedAt) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // BLOG POST — Like (public update, increments likeCount)
  // ============================================================
  public shared func likeBlogPost(id : Nat) : async () {
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?existing) {
        let updated : BlogPost = { existing with likeCount = existing.likeCount + 1 };
        blogPosts.add(id, updated);
      };
    };
  };

  // ============================================================
  // BLOG COMMENT — Add (public, approved = false)
  // ============================================================
  public shared func addBlogComment(
    postId : Nat,
    parentId : ?Nat,
    name : Text,
    email : Text,
    content : Text,
  ) : async Nat {
    let id = blogCommentIdCounter;
    let comment : BlogComment = {
      id;
      postId;
      parentId;
      name;
      email;
      content;
      approved = false;
      createdAt = Time.now();
    };
    blogComments.add(id, comment);
    blogCommentIdCounter += 1;
    id;
  };

  // ============================================================
  // BLOG COMMENT — Approve (admin, also increments post commentCount)
  // ============================================================
  public shared ({ caller }) func approveBlogComment(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can approve comments");
    };
    switch (blogComments.get(id)) {
      case (null) { false };
      case (?existing) {
        if (existing.approved) { return true };
        let updated : BlogComment = { existing with approved = true };
        blogComments.add(id, updated);
        // Increment commentCount on the related post
        switch (blogPosts.get(existing.postId)) {
          case (?post) {
            let updatedPost : BlogPost = { post with commentCount = post.commentCount + 1 };
            blogPosts.add(post.id, updatedPost);
          };
          case (null) {};
        };
        true;
      };
    };
  };

  // ============================================================
  // BLOG COMMENT — Delete (admin, also deletes all replies)
  // ============================================================
  public shared ({ caller }) func deleteBlogComment(id : Nat) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete comments");
    };
    switch (blogComments.get(id)) {
      case (null) { false };
      case (?_) {
        blogComments.remove(id);
        // Delete all replies (comments with parentId == id)
        let replies = blogComments.values().toArray().filter(
          func(c : BlogComment) : Bool {
            switch (c.parentId) {
              case (?pid) { pid == id };
              case (null) { false };
            };
          }
        );
        for (reply in replies.vals()) {
          blogComments.remove(reply.id);
        };
        true;
      };
    };
  };

  // ============================================================
  // BLOG COMMENT — Get all (admin)
  // ============================================================
  public query ({ caller }) func getAllBlogComments() : async [BlogComment] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all blog comments");
    };
    blogComments.values().toArray();
  };

  // ============================================================
  // BLOG COMMENT — Get approved comments for a post (public, sorted by createdAt asc)
  // ============================================================
  public query func getApprovedCommentsByPostId(postId : Nat) : async [BlogComment] {
    let approved = blogComments.values().toArray().filter(
      func(c : BlogComment) : Bool { c.postId == postId and c.approved }
    );
    approved.sort(func(a : BlogComment, b : BlogComment) : { #less; #equal; #greater } {
      if (a.createdAt < b.createdAt) { #less }
      else if (a.createdAt > b.createdAt) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Add
  // ============================================================
  public shared ({ caller }) func addCommercialVehicle(
    name : Text,
    slug : Text,
    category : Text,
    subCategory : Text,
    description : Text,
    chassisPrice : Nat,
    heroImage : Text,
    heroTitle : Text,
    heroSubtext : Text,
    mainImages : [Text],
    chassisImage : Text,
    cabinImage : Text,
    brochureUrl : Text,
    footnote : Text,
    specifications : [CommercialSpecItem],
    isPublished : Bool,
  ) : async Text {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add commercial vehicles");
    };
    // Compute next displayOrder = max existing displayOrder + 1
    var maxOrder : Nat = 0;
    for (v in commercialVehicles.values()) {
      if (v.displayOrder > maxOrder) {
        maxOrder := v.displayOrder;
      };
    };
    let now = Time.now();
    let id = commercialVehicleIdCounter.toText();
    let finalSlug = if (slug.trim(#char ' ').size() == 0) { generateSlug(name) } else { generateSlug(slug) };
    let vehicle : CommercialVehicle = {
      id;
      name;
      slug = finalSlug;
      category;
      subCategory;
      description;
      chassisPrice;
      heroImage;
      heroTitle;
      heroSubtext;
      mainImages;
      chassisImage;
      cabinImage;
      brochureUrl;
      footnote;
      specifications;
      displayOrder = maxOrder + 1;
      isPublished;
      createdAt = now;
      updatedAt = now;
    };
    commercialVehicles.add(id, vehicle);
    commercialVehicleIdCounter += 1;
    id;
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Update
  // ============================================================
  public shared ({ caller }) func updateCommercialVehicle(
    id : Text,
    name : Text,
    slug : Text,
    category : Text,
    subCategory : Text,
    description : Text,
    chassisPrice : Nat,
    heroImage : Text,
    heroTitle : Text,
    heroSubtext : Text,
    mainImages : [Text],
    chassisImage : Text,
    cabinImage : Text,
    brochureUrl : Text,
    footnote : Text,
    specifications : [CommercialSpecItem],
    isPublished : Bool,
  ) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update commercial vehicles");
    };
    switch (commercialVehicles.get(id)) {
      case (null) { false };
      case (?existing) {
        let finalSlug = if (slug.trim(#char ' ').size() == 0) { existing.slug } else { generateSlug(slug) };
        let updated : CommercialVehicle = {
          existing with
          name;
          slug = finalSlug;
          category;
          subCategory;
          description;
          chassisPrice;
          heroImage;
          heroTitle;
          heroSubtext;
          mainImages;
          chassisImage;
          cabinImage;
          brochureUrl;
          footnote;
          specifications;
          isPublished;
          updatedAt = Time.now();
        };
        commercialVehicles.add(id, updated);
        true;
      };
    };
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Delete
  // ============================================================
  public shared ({ caller }) func deleteCommercialVehicle(id : Text) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete commercial vehicles");
    };
    switch (commercialVehicles.get(id)) {
      case (null) { false };
      case (?_) {
        commercialVehicles.remove(id);
        true;
      };
    };
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Get all (admin only), sorted by displayOrder asc
  // ============================================================
  public query ({ caller }) func getAllCommercialVehicles() : async [CommercialVehicle] {
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all commercial vehicles");
    };
    let all = commercialVehicles.values().toArray();
    all.sort(func(a : CommercialVehicle, b : CommercialVehicle) : { #less; #equal; #greater } {
      if (a.displayOrder < b.displayOrder) { #less }
      else if (a.displayOrder > b.displayOrder) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Get published (public), sorted by displayOrder asc
  // ============================================================
  public query func getPublishedCommercialVehicles() : async [CommercialVehicle] {
    let published = commercialVehicles.values().toArray().filter(
      func(v : CommercialVehicle) : Bool { v.isPublished }
    );
    published.sort(func(a : CommercialVehicle, b : CommercialVehicle) : { #less; #equal; #greater } {
      if (a.displayOrder < b.displayOrder) { #less }
      else if (a.displayOrder > b.displayOrder) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Get by category (public), sorted by displayOrder asc
  // ============================================================
  public query func getCommercialVehiclesByCategory(category : Text) : async [CommercialVehicle] {
    let normalizedCategory = generateSlug(category);
    let filtered = commercialVehicles.values().toArray().filter(
      func(v : CommercialVehicle) : Bool {
        v.isPublished and generateSlug(v.category) == normalizedCategory
      }
    );
    filtered.sort(func(a : CommercialVehicle, b : CommercialVehicle) : { #less; #equal; #greater } {
      if (a.displayOrder < b.displayOrder) { #less }
      else if (a.displayOrder > b.displayOrder) { #greater }
      else { #equal };
    });
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Get by slug + category (public)
  // Both params normalized via generateSlug before comparison
  // ============================================================
  public query func getCommercialVehicleBySlug(categorySlug : Text, vehicleSlug : Text) : async ?CommercialVehicle {
    let normalizedCategory = generateSlug(categorySlug);
    let normalizedSlug = generateSlug(vehicleSlug);
    commercialVehicles.values().toArray().find(
      func(v : CommercialVehicle) : Bool {
        generateSlug(v.category) == normalizedCategory and generateSlug(v.slug) == normalizedSlug
      }
    );
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Count published by category (public)
  // ============================================================
  public query func getCommercialVehicleCountByCategory(category : Text) : async Nat {
    let normalizedCategory = generateSlug(category);
    commercialVehicles.values().toArray().filter(
      func(v : CommercialVehicle) : Bool {
        v.isPublished and generateSlug(v.category) == normalizedCategory
      }
    ).size();
  };

  // ============================================================
  // COMMERCIAL VEHICLE — Reorder (admin only)
  // ids: ordered array of vehicle IDs (Text); index+1 becomes displayOrder
  // ============================================================
  public shared ({ caller }) func reorderCommercialVehicles(ids : [Text]) : async () {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can reorder commercial vehicles");
    };
    var i : Nat = 0;
    while (i < ids.size()) {
      let vehicleId = ids[i];
      switch (commercialVehicles.get(vehicleId)) {
        case (?existing) {
          commercialVehicles.add(vehicleId, { existing with displayOrder = i + 1 });
        };
        case (null) {}; // skip missing IDs
      };
      i += 1;
    };
  };

  // ============================================================
  // CREDIT SETTINGS
  // ============================================================

  // getCreditSettings — returns stored record or default values (public)
  public query func getCreditSettings() : async CreditSettings {
    switch (creditSettings) {
      case (?settings) { settings };
      case null {
        {
          adminFee = 500000;
          interestRatePerYear = 5.0;
          insurancePercent = 0.5;
          provisionPercent = 1.0;
          footnote = "*Simulasi ini bersifat perkiraan. Besaran biaya administrasi, bunga, asuransi, dan provisi dapat berbeda pada setiap leasing dan dapat berubah sesuai kebijakan yang berlaku.";
          updatedAt = 0;
        }
      };
    }
  };

  // updateCreditSettings — admin only
  public shared ({ caller }) func updateCreditSettings(
    adminFee : Nat,
    interestRatePerYear : Float,
    insurancePercent : Float,
    provisionPercent : Float,
    footnote : Text,
  ) : async CreditSettings {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update credit settings");
    };
    let now = Time.now();
    let settings : CreditSettings = {
      adminFee;
      interestRatePerYear;
      insurancePercent;
      provisionPercent;
      footnote;
      updatedAt = now;
    };
    creditSettings := ?settings;
    settings
  };

  // ============================================================
  // CREDIT REQUIREMENT TABS
  // ============================================================

  // getAllCreditRequirementTabs — public, sorted by order asc
  public query func getAllCreditRequirementTabs() : async [CreditRequirementTab] {
    let arr = creditRequirementTabs.values().toArray();
    arr.sort(func(a : CreditRequirementTab, b : CreditRequirementTab) : { #less; #equal; #greater } {
      if (a.order < b.order) { #less }
      else if (a.order > b.order) { #greater }
      else { #equal };
    });
  };

  // addCreditRequirementTab — admin only
  public shared ({ caller }) func addCreditRequirementTab(
    tabName : Text,
    requirements : [CreditRequirementItem],
    order : Nat,
  ) : async CreditRequirementTab {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add credit requirement tabs");
    };
    creditRequirementTabIdCounter += 1;
    let id = "crt_" # creditRequirementTabIdCounter.toText();
    let tab : CreditRequirementTab = { id; tabName; requirements; order };
    creditRequirementTabs.add(id, tab);
    tab
  };

  // updateCreditRequirementTab — admin only
  public shared ({ caller }) func updateCreditRequirementTab(
    id : Text,
    tabName : Text,
    requirements : [CreditRequirementItem],
    order : Nat,
  ) : async CreditRequirementTab {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update credit requirement tabs");
    };
    switch (creditRequirementTabs.get(id)) {
      case null { Runtime.trap("Tab not found") };
      case (?_) {
        let tab : CreditRequirementTab = { id; tabName; requirements; order };
        creditRequirementTabs.add(id, tab);
        tab
      };
    }
  };

  // deleteCreditRequirementTab — admin only
  public shared ({ caller }) func deleteCreditRequirementTab(id : Text) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete credit requirement tabs");
    };
    creditRequirementTabs.remove(id);
    true
  };

  // ============================================================
  // LEADS
  // ============================================================

  // addLead — NO AUTH REQUIRED (called from public pages)
  public func addLead(
    name : Text,
    address : Text,
    email : Text,
    phone : Text,
    vehicleType : Text,
    otr : Nat,
    dp : Nat,
    tenor : Nat,
    monthlyInstallment : Nat,
    source : Text,
    createdAt : Int,
  ) : async Lead {
    leadIdCounter += 1;
    let id = "lead_" # leadIdCounter.toText();
    let lead : Lead = { id; name; address; email; phone; vehicleType; otr; dp; tenor; monthlyInstallment; source; createdAt };
    leadsMap.add(id, lead);
    lead
  };

  // getAllLeads — admin only, sorted by createdAt descending
  public shared ({ caller }) func getAllLeads() : async [Lead] {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view leads");
    };
    let arr = leadsMap.values().toArray();
    arr.sort(func(a : Lead, b : Lead) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
  };

  // deleteLead — admin only
  public shared ({ caller }) func deleteLead(id : Text) : async Bool {
    ignore bootstrapIfEmpty(caller);
    if (not callerIsAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    leadsMap.remove(id);
    true
  };

  // ============================================================
  // STABLE UPGRADE HOOKS
  //
  // preupgrade:  save runtime state → stable vars
  // postupgrade: restore stable vars → runtime state
  // ============================================================
  system func preupgrade() {
    // Persist website settings
    websiteSettings_v2 := ?_websiteSettingsRuntime;

    // Persist ALL media assets to stable storage
    stableMediaAssets := mediaAssets.values().toArray();
    stableMediaAssetIdCounter := mediaAssetIdCounter;

    // Persist passenger vehicles (v4 — adds heroBannerVideoId)
    stablePassengerVehicles_v4 := passengerVehiclesData.values().toArray();
    // Clear v3 to avoid stale data on next upgrade
    stablePassengerVehicles_v3 := [];
    stablePassengerVehicleIdCounter := passengerVehicleIdCounter;

    // Persist promotions
    stablePromotions := promotions.toArray();
    stablePromotionIdCounter := promotionIdCounter;

    // Persist testimonials
    stableTestimonials := testimonials.toArray();
    stableTestimonialIdCounter := testimonialIdCounter;

    // Persist blog posts
    stableBlogPosts := blogPosts.toArray();
    stableBlogPostIdCounter := blogPostIdCounter;

    // Persist blog comments
    stableBlogComments := blogComments.toArray();
    stableBlogCommentIdCounter := blogCommentIdCounter;

    // Persist commercial vehicles
    stableCommercialVehicles := commercialVehicles.toArray();
    stableCommercialVehicleIdCounter := commercialVehicleIdCounter;

    // Persist credit requirement tabs
    stableCreditRequirementTabs := creditRequirementTabs.toArray();

    // Persist leads
    stableLeads := leadsMap.toArray();
  };

  system func postupgrade() {
    // Restore website settings
    switch (websiteSettings_v2) {
      case (?saved) {
        _websiteSettingsRuntime := saved;
      };
      case (null) {
        // First upgrade: migrate from V1
        _websiteSettingsRuntime := {
          siteName = websiteSettings.siteName;
          contactPhone = websiteSettings.contactPhone;
          contactWhatsapp = websiteSettings.contactWhatsapp;
          contactEmail = websiteSettings.contactEmail;
          dealerAddress = websiteSettings.dealerAddress;
          operationalHours = websiteSettings.operationalHours;
          facebookUrl = websiteSettings.facebookUrl;
          instagramUrl = websiteSettings.instagramUrl;
          tiktokUrl = websiteSettings.tiktokUrl;
          youtubeUrl = websiteSettings.youtubeUrl;
          mainBannerImageId = websiteSettings.mainBannerImageId;
          ctaBannerImageId = websiteSettings.ctaBannerImageId;
          lastUpdated = websiteSettings.lastUpdated;
          salesConsultantName = null;
          salesConsultantPhotoId = null;
          footerAboutText = null;
        };
        websiteSettings_v2 := ?_websiteSettingsRuntime;
      };
    };

    // Restore media assets from stable storage into runtime map
    for (asset in stableMediaAssets.vals()) {
      mediaAssets.add(asset.id, asset);
    };
    // Restore counter — ensures new uploads get unique IDs
    if (stableMediaAssetIdCounter > 0) {
      mediaAssetIdCounter := stableMediaAssetIdCounter;
    };

    // Restore passenger vehicles — try v4 first, then migration source (old BTree with V3 type), then v3 array, then v2
    if (stablePassengerVehicles_v4.size() > 0) {
      for (vehicle in stablePassengerVehicles_v4.vals()) {
        passengerVehiclesData.add(vehicle.id, vehicle);
      };
    } else if (passengerVehicles.size() > 0) {
      // Migrate from old BTree stable map (V3 type, no heroBannerVideoId)
      for (vehicle in passengerVehicles.values()) {
        let migrated : PassengerVehicle = {
          id = vehicle.id;
          vehicleName = vehicle.vehicleName;
          description = vehicle.description;
          heroImageUrl = vehicle.heroImageUrl;
          brochureUrl = vehicle.brochureUrl;
          variants = vehicle.variants;
          specTabs = vehicle.specTabs;
          publishStatus = vehicle.publishStatus;
          createdAt = vehicle.createdAt;
          updatedAt = vehicle.updatedAt;
          slug = vehicle.slug;
          footnotes = vehicle.footnotes;
          aftersaleImages = vehicle.aftersaleImages;
          ctaText = vehicle.ctaText;
          ctaSubtext = vehicle.ctaSubtext;
          ctaButtonLabel = vehicle.ctaButtonLabel;
          ctaButtonUrl = vehicle.ctaButtonUrl;
          vehicleType = vehicle.vehicleType;
          titleImageUrl = vehicle.titleImageUrl;
          heroBannerVideoId = null;
          displayOrder = vehicle.displayOrder;
        };
        passengerVehiclesData.add(migrated.id, migrated);
      };
    } else if (stablePassengerVehicles_v3.size() > 0) {
      // Migrate from v3: add heroBannerVideoId = null
      for (vehicle in stablePassengerVehicles_v3.vals()) {
        let migrated : PassengerVehicle = {
          id = vehicle.id;
          vehicleName = vehicle.vehicleName;
          description = vehicle.description;
          heroImageUrl = vehicle.heroImageUrl;
          brochureUrl = vehicle.brochureUrl;
          variants = vehicle.variants;
          specTabs = vehicle.specTabs;
          publishStatus = vehicle.publishStatus;
          createdAt = vehicle.createdAt;
          updatedAt = vehicle.updatedAt;
          slug = vehicle.slug;
          footnotes = vehicle.footnotes;
          aftersaleImages = vehicle.aftersaleImages;
          ctaText = vehicle.ctaText;
          ctaSubtext = vehicle.ctaSubtext;
          ctaButtonLabel = vehicle.ctaButtonLabel;
          ctaButtonUrl = vehicle.ctaButtonUrl;
          vehicleType = vehicle.vehicleType;
          titleImageUrl = vehicle.titleImageUrl;
          heroBannerVideoId = null;
          displayOrder = vehicle.displayOrder;
        };
        passengerVehiclesData.add(migrated.id, migrated);
      };
    } else {
      // Migrate from v2 schema: add titleImageUrl = null and displayOrder = index+1
      var order : Nat = 1;
      for (vehicle in stablePassengerVehicles_v2.vals()) {
        let migrated : PassengerVehicle = {
          id = vehicle.id;
          vehicleName = vehicle.vehicleName;
          description = vehicle.description;
          heroImageUrl = vehicle.heroImageUrl;
          brochureUrl = vehicle.brochureUrl;
          variants = vehicle.variants;
          specTabs = vehicle.specTabs;
          publishStatus = vehicle.publishStatus;
          createdAt = vehicle.createdAt;
          updatedAt = vehicle.updatedAt;
          slug = vehicle.slug;
          footnotes = vehicle.footnotes;
          aftersaleImages = vehicle.aftersaleImages;
          ctaText = vehicle.ctaText;
          ctaSubtext = vehicle.ctaSubtext;
          ctaButtonLabel = vehicle.ctaButtonLabel;
          ctaButtonUrl = vehicle.ctaButtonUrl;
          vehicleType = vehicle.vehicleType;
          titleImageUrl = null;
          heroBannerVideoId = null;
          displayOrder = order;
        };
        passengerVehiclesData.add(migrated.id, migrated);
        order += 1;
      };
    };
    if (stablePassengerVehicleIdCounter > 0) {
      passengerVehicleIdCounter := stablePassengerVehicleIdCounter;
    };

    // Restore promotions
    for ((k, v) in stablePromotions.vals()) {
      promotions.add(k, v);
    };
    if (stablePromotionIdCounter > 0) {
      promotionIdCounter := stablePromotionIdCounter;
    };

    // Restore testimonials
    for ((k, v) in stableTestimonials.vals()) {
      testimonials.add(k, v);
    };
    if (stableTestimonialIdCounter > 0) {
      testimonialIdCounter := stableTestimonialIdCounter;
    };

    // Restore blog posts
    for ((k, v) in stableBlogPosts.vals()) {
      blogPosts.add(k, v);
    };
    if (stableBlogPostIdCounter > 0) {
      blogPostIdCounter := stableBlogPostIdCounter;
    };

    // Restore blog comments
    for ((k, v) in stableBlogComments.vals()) {
      blogComments.add(k, v);
    };
    if (stableBlogCommentIdCounter > 0) {
      blogCommentIdCounter := stableBlogCommentIdCounter;
    };

    // Restore commercial vehicles
    for ((k, v) in stableCommercialVehicles.vals()) {
      commercialVehicles.add(k, v);
    };
    if (stableCommercialVehicleIdCounter > 0) {
      commercialVehicleIdCounter := stableCommercialVehicleIdCounter;
    };

    // Restore credit requirement tabs
    for ((k, v) in stableCreditRequirementTabs.vals()) {
      creditRequirementTabs.add(k, v);
    };

    // Restore leads
    for ((k, v) in stableLeads.vals()) {
      leadsMap.add(k, v);
    };
  };
};
