/*
  Utility to bridge CSS design tokens to runtime JS (e.g., ECharts)
  - Prefer reading CSS variables (data-theme aware)
  - Provide safe fallbacks for SSR/non-DOM and defaults
*/

import * as echarts from "echarts";

export function getCssVarValue(varName: string, fallback = ""): string {
  try {
    if (typeof window !== "undefined" && document?.documentElement) {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (v) return v;
    }
  } catch {
    // ignore
  }
  return fallback;
}

function normalizeHex(hex: string): string {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    return (
      "#" +
      h
        .split("")
        .map((c) => c + c)
        .join("")
    );
  }
  if (h.length === 6) return "#" + h.toLowerCase();
  // not a hex, return as-is (may already be rgb/var)
  return hex;
}

export function hexToRgba(hex: string, alpha: number): string {
  const n = normalizeHex(hex);
  if (!n.startsWith("#") || (n.length !== 7 && n.length !== 4)) {
    // already rgba or css var etc.
    return n;
  }
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Defaults align with current design tokens
const DEFAULTS = {
  primary: "#667eea",
  purpleEnd: "#764ba2",
};

export function getPrimaryColor(): string {
  // Prefer Element Plus primary; fallback to our token; finally default
  return (
    getCssVarValue("--el-color-primary") ||
    getCssVarValue("--primary-color", DEFAULTS.primary)
  );
}

export function getPurpleEndColor(): string {
  // We don't yet expose purple gradient end as a standalone var; fallback to default
  return getCssVarValue("--purple-end-color", DEFAULTS.purpleEnd);
}

export function primaryRgba(alpha: number): string {
  return hexToRgba(getPrimaryColor(), alpha);
}

export function makeGradientStops(start: string, end: string) {
  return [
    { offset: 0, color: start },
    { offset: 1, color: end },
  ];
}

export function purpleGradientStops() {
  return makeGradientStops(getPrimaryColor(), getPurpleEndColor());
}



// Extended semantic colors bridging Element Plus design tokens
export function getSuccessColor(): string {
  return (
    getCssVarValue("--el-color-success") ||
    getCssVarValue("--success-color", "#22c55e")
  );
}

export function getInfoColor(): string {
  return (
    getCssVarValue("--el-color-info") ||
    getCssVarValue("--info-color", "#3b82f6")
  );
}

export function getWarningColor(): string {
  return (
    getCssVarValue("--el-color-warning") ||
    getCssVarValue("--warning-color", "#f59e0b")
  );
}

export function getDangerColor(): string {
  return (
    getCssVarValue("--el-color-danger") ||
    getCssVarValue("--danger-color", "#ef4444")
  );
}

// Resolve CSS variables for ECharts Canvas gradients
// Canvas cannot parse CSS variables like 'var(--primary-color)'
// This function converts them to actual color values
export function resolveChartColor(colorInput: string, alpha = 1): string {
  // If it's already a valid color, return as-is or with alpha
  if (!colorInput.startsWith("var(")) {
    return alpha < 1 ? hexToRgba(colorInput, alpha) : colorInput;
  }

  // Extract variable name from var(--name)
  const match = colorInput.match(/var\((--[^,)]+)(?:,\s*([^)]+))?\)/);
  if (!match) {
    return alpha < 1 ? hexToRgba(colorInput, alpha) : colorInput;
  }

  const varName = match[1];
  const fallback = match[2]?.trim() || "";

  // Get the actual value from CSS
  const resolved = getCssVarValue(varName, fallback);

  // If resolved value is empty or still a var, use fallback
  if (!resolved || resolved.startsWith("var(")) {
    return alpha < 1 ? hexToRgba(fallback || "#667eea", alpha) : fallback || "#667eea";
  }

  // Convert to rgba with alpha if needed
  return alpha < 1 ? hexToRgba(resolved, alpha) : resolved;
}

// ECharts gradient factory using resolved colors
export function makeChartLinearGradient(
  direction: "vertical" | "horizontal" = "vertical",
  startColor: string,
  endColor: string,
  startAlpha = 1,
  endAlpha = 1
) {
  const s = resolveChartColor(startColor, startAlpha);
  const e = resolveChartColor(endColor, endAlpha);

  if (direction === "vertical") {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: s },
      { offset: 1, color: e },
    ]);
  } else {
    return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
      { offset: 0, color: s },
      { offset: 1, color: e },
    ]);
  }
}

// Create gradient object for itemStyle (compatible with ECharts inline style)
// Usage: itemStyle: { color: createGradientItemStyle('var(--primary-color)', 'var(--info-color)') }
export function createGradientItemStyle(
  startColor: string,
  endColor: string,
  direction: "vertical" | "horizontal" = "vertical"
): object {
  return {
    color: {
      type: "linear",
      x: 0,
      y: 0,
      x2: direction === "vertical" ? 0 : 1,
      y2: direction === "vertical" ? 1 : 0,
      colorStops: [
        { offset: 0, color: resolveChartColor(startColor, 1) },
        { offset: 1, color: resolveChartColor(endColor, 1) },
      ],
    },
  };
}
