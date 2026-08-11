import { Platform } from 'react-native';

/** 4pt grid, matching the web app's `--spacing: 0.25rem`. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  /** Horizontal padding on every screen — the Figma frames are 393 wide with 20pt gutters. */
  screen: 20,
  /** Inner padding of a Card. */
  card: 16,
} as const;

/**
 * Radii from the Figma. Note there is no generic "pill" here on purpose: the
 * only fully-round element in the design is the metadata badge. Filter pills
 * and party/topic chips are 12pt rounded rectangles despite the name.
 */
export const radius = {
  card: 15,
  /** Filter pills and the search field. */
  control: 12,
  /** Party and topic chips. */
  chip: 12,
  /** Segmented control track / thumb. */
  track: 10,
  thumb: 8,
  /** Abmelden, Account löschen. */
  button: 10,
  /** Metadata badges only. */
  badge: 999,
} as const;

/** Content heights, excluding safe-area insets. */
export const HEADER_HEIGHT = 56;
export const TAB_BAR_HEIGHT = 68;

/**
 * The web frontend uses plain `system-ui` with no bundled font files, so the
 * app follows suit: SF Pro on iOS, Roboto on Android. The Figma specifies
 * Segoe UI, which is Microsoft-proprietary and cannot be shipped; its
 * "Semilight" 350 maps to the nearest available weight, '300'.
 */
export const fontFamily = Platform.select({
  ios: 'system-ui',
  default: undefined,
});
