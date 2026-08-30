import { StyleSheet } from 'react-native';

import { colors } from './colors';

/* Sizes taken from the Figma (393pt width). No style sets `fontFamily`, deliberately:
   the Figma asks for Segoe UI, which neither platform has, and an unresolvable family on
   iOS can stop `fontWeight` applying. Segoe's 350 maps to '300'. */
export const typography = StyleSheet.create({
  /** The one bundled font, used for the wordmark only. No `fontWeight` — the family name
      already encodes it, and setting both can conflict on iOS. */
  logo: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 24,
    color: colors.onChrome,
    lineHeight: 32,
  },
  /** Screen title, e.g. "Vergangene Abstimmungsergebnisse". Centred on most screens. */
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 30,
  },
  /** Section heading inside a screen, e.g. "Letzte Abstimmungen". */
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  },
  /** The muted line under a title, e.g. "Abgestimmt am 26.03.2026". */
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 21,
  },
  /** Heading inside a card, e.g. "E-Mail Benachrichtigungen". */
  cardHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textTitle,
    lineHeight: 25,
  },
  /** The headline of a detail screen's first card. Larger than `cardTitle`. */
  detailTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textTitle,
    lineHeight: 23,
  },
  /** Card headline, e.g. a law's name. */
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTitle,
    lineHeight: 20,
  },
  /** Explanatory copy in a card. Figma uses Segoe's 350 "Semilight". */
  body: {
    fontSize: 14,
    fontWeight: '300',
    color: '#000000',
    lineHeight: 18,
  },
  bodyMuted: {
    fontSize: 14,
    fontWeight: '300',
    color: colors.textMuted,
    lineHeight: 18,
  },
  /** Hint under a card heading, e.g. "nach ausgewählten Interessen". */
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textCaption,
    lineHeight: 16,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onBadge,
    lineHeight: 16,
  },
  chip: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.onAccent,
    lineHeight: 14,
  },
  /** Filter pill label. The Figma draws 16, but that was before the active-filter count. */
  pillLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.onAccent,
  },
  segment: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.56,
  },
  button: {
    fontSize: 16,
    fontWeight: '400',
  },
  tableHead: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPlaceholder,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTitle,
  },
  rowMeta: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  /** Party abbreviation above a vote row, e.g. "FPÖ". */
  partyLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
});
