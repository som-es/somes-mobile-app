import { StyleSheet } from 'react-native';

import { colors } from './colors';

/**
 * Sizes are taken literally from the Figma, which designs at 393pt width.
 * The Figma's font is Segoe UI; we render in the system font (see layout.ts).
 */
export const typography = StyleSheet.create({
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
  /** Metadata chip text. */
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onBadge,
    lineHeight: 16,
  },
  /** Party / topic chip text. */
  chip: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.onAccent,
    lineHeight: 14,
  },
  /** Filter pill label ("Themen", "Parteien", "Filter"). */
  pillLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.onAccent,
  },
  /** Segmented control label. */
  segment: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.56,
  },
  /** Abmelden / Account löschen. */
  button: {
    fontSize: 16,
    fontWeight: '400',
  },
  /** Column header on the Abgeordnete list. */
  tableHead: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPlaceholder,
  },
  /** A person's name in a list row. */
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTitle,
  },
  /** Party and age columns in a list row. */
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
