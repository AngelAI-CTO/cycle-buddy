// Sci-fi Minimalist Theme — dark, cold, tactical
export const COLORS = {
  // Base
  bg: "#0a0e17",           // Deep space black
  surface: "#111827",       // Dark panel
  surfaceLight: "#1a2332",  // Slightly lighter panel
  border: "#1e2d3d",        // Subtle grid lines
  borderActive: "#00d4ff",  // Cyan glow

  // Text
  textPrimary: "#e2e8f0",   // Cool white
  textSecondary: "#64748b",  // Muted steel
  textMuted: "#475569",      // Dark steel

  // Accents
  cyan: "#00d4ff",           // Primary accent — HUD cyan
  cyanDim: "#0891b2",        // Dimmed cyan
  red: "#ef4444",            // Alert red
  redDim: "#991b1b",         // Dimmed red
  green: "#10b981",          // Status green
  greenDim: "#065f46",       // Dimmed green
  amber: "#f59e0b",          // Warning amber
  amberDim: "#92400e",       // Dimmed amber
  violet: "#8b5cf6",         // Phase violet
  violetDim: "#4c1d95",      // Dimmed violet
  orange: "#f97316",         // PMS alert

  // Phase colors
  phases: {
    menstruation: "#ef4444",
    follicular: "#10b981",
    ovulation: "#f59e0b",
    luteal: "#8b5cf6",
    pms: "#f97316",
  } as Record<string, string>,
};

export const FONTS = {
  mono: "monospace",
};
