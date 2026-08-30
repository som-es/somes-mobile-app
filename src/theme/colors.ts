export const primary = {
  50: '#e8ecf1',
  100: '#e1e6ec',
  200: '#d9e0e8',
  300: '#c3cdd9',
  400: '#95a7bd',
  500: '#6881a1',
  600: '#5e7491',
  700: '#4e6179',
  800: '#3e4d61',
  900: '#333f4f',
} as const;

export const secondary = {
  50: '#f9ece9',
  100: '#f7e6e2',
  200: '#f5dfdb',
  300: '#efccc5',
  400: '#e4a69a',
  500: '#d8806f',
  600: '#c27364',
  700: '#a26053',
  800: '#824d43',
  900: '#6a3f36',
} as const;

export const tertiary = {
  50: '#fefaf7',
  100: '#fef9f4',
  200: '#fdf7f2',
  300: '#fcf2ea',
  400: '#fae9da',
  500: '#f8dfca',
  600: '#dfc9b6',
  700: '#baa798',
  800: '#958679',
  900: '#7a6d63',
} as const;

export const success = {
  50: '#edf7dc',
  100: '#e6f5d0',
  200: '#e0f2c5',
  300: '#ceeba2',
  400: '#a9db5c',
  500: '#84cc16',
  600: '#77b814',
  700: '#639911',
  800: '#4f7a0d',
  900: '#41640b',
} as const;

export const warning = {
  50: '#fcf4da',
  100: '#fbf0ce',
  200: '#faecc1',
  300: '#f7e19c',
  400: '#f0ca52',
  500: '#eab308',
  600: '#d3a107',
  700: '#b08606',
  800: '#8c6b05',
  900: '#735804',
} as const;

export const error = {
  50: '#f9ddea',
  100: '#f6d1e4',
  200: '#f4c6dd',
  300: '#eea3c8',
  400: '#e15e9f',
  500: '#d41976',
  600: '#bf176a',
  700: '#9f1359',
  800: '#7f0f47',
  900: '#680c3a',
} as const;

export const surface = {
  50: '#dedfe2',
  100: '#d3d4d8',
  200: '#c8c9cf',
  300: '#a7a9b2',
  400: '#666978',
  500: '#24283e',
  600: '#202438',
  700: '#1b1e2f',
  800: '#161825',
  900: '#12141e',
} as const;

/** prefer these over the raw ramp values above, so a change lands in one place */
export const colors = {
  chrome: '#2D3748',
  onChrome: '#FFFFFF',
  onChromeMuted: 'rgba(255, 255, 255, 0.55)',
  tabActive: 'rgba(255, 255, 255, 0.1)',

  screen: '#FAF8FF',
  card: '#DAE2ED',
  cardRaised: '#FFFFFF',
  cardBorder: '#DCDDDF',
  sessionCard: primary[300],
  inset: primary[50],
  /** the rail a stance dot slides along, same tone as inset but a different job */
  rail: primary[50],

  badge: '#FAE9DA',
  onBadge: '#000000',

  accent: '#D77F71',
  onAccent: '#FFFFFF',
  accentMuted: secondary[300],

  chipSelected: '#24283E',

  text: '#2D3748',
  textTitle: '#28292B',
  textMuted: '#47494C',
  textCaption: '#8C8F95',
  textPlaceholder: '#696B6F',
  textInverse: '#FFFFFF',
  inputBorder: '#B3B5B9',

  voteYes: '#1FA14B',
  voteNo: '#DC2626',
  voteAbstain: warning[500],
  voteNone: primary[500],

  danger: '#FF4C4C',
  dangerSurface: 'rgba(255, 141, 141, 0.42)',
  dangerSubtle: '#A65A5A',

  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

export const shadows = {
  card: {
    shadowColor: '#6881A1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
} as const;
