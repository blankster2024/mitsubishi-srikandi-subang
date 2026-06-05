// Visitor tracking utility functions

const SESSION_ID_KEY = "visitor_session_id";
const SESSION_LAST_ACTIVE_KEY = "visitor_last_active";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function generateSessionId(): string {
  // Generate UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateSessionId(): string {
  const now = Date.now();

  const existingSessionId = localStorage.getItem(SESSION_ID_KEY);
  const lastActiveStr = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
  const lastActive = lastActiveStr ? Number.parseInt(lastActiveStr, 10) : 0;

  // Check if session has expired (30 min inactivity)
  const isExpired = !existingSessionId || now - lastActive > SESSION_TIMEOUT_MS;

  let sessionId: string;
  if (isExpired) {
    // Generate new session ID on expiry or first visit
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    console.log("[Visitor Tracking] New session started:", sessionId);
  } else {
    sessionId = existingSessionId!;
    console.log("[Visitor Tracking] Resuming session:", sessionId);
  }

  // Always update lastActive timestamp
  localStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());

  return sessionId;
}

export function detectDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(
      ua,
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

export function detectBrowser(): string {
  const ua = navigator.userAgent;

  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident") || ua.includes("MSIE")) return "Internet Explorer";

  return "Unknown";
}

export function isBot(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "slurp",
    "bingbot",
    "googlebot",
    "yandexbot",
    "baiduspider",
    "facebookexternalhit",
    "twitterbot",
    "rogerbot",
    "linkedinbot",
    "embedly",
    "quora link preview",
    "showyoubot",
    "outbrain",
    "pinterest",
    "slackbot",
    "vkshare",
    "w3c_validator",
    "redditbot",
    "applebot",
    "whatsapp",
    "flipboard",
    "tumblr",
    "bitlybot",
    "skypeuripreview",
    "nuzzel",
    "discordbot",
    "qwantify",
    "pinterestbot",
    "bitrix link preview",
    "xing-contenttabreceiver",
    "chrome-lighthouse",
    "telegrambot",
  ];

  return botPatterns.some((pattern) => ua.includes(pattern));
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/login");
}

export function getClientIP(): string {
  // In browser environment, we cannot directly get the real IP address
  // This would need to be done server-side or via a service
  // For now, return a placeholder that indicates client-side detection
  return "client-detected";
}
