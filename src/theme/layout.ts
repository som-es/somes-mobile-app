export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 20,
  card: 16,
} as const;

export const radius = {
  card: 15,
  /** Filter pills and the search field. */
  control: 12,
  chip: 12,
  track: 10,
  thumb: 8,
  button: 10,
  badge: 999,
} as const;

export const HEADER_HEIGHT = 60;

/** Tab bar button diameter, the gap between buttons, and the icon inside. */
export const TAB_BUTTON = 48;
export const TAB_GAP = 30;
export const ICON_SIZE = 24;

export const TAB_BAR_HEIGHT = TAB_BUTTON + spacing.sm * 2;
