import { StyleSheet } from 'react-native';

import { colors } from './colors';

/* no style sets fontfamily on purpose, the design asks for segoe ui which neither
   platform has, and an unresolvable family on ios can stop fontweight from applying */
export const typography = StyleSheet.create({
  /** the one bundled font, used for the wordmark only, no fontweight since the family
      name already encodes it and setting both can conflict on ios */
  logo: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 24,
    color: colors.onChrome,
    lineHeight: 32,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 21,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textTitle,
    lineHeight: 25,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textTitle,
    lineHeight: 23,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTitle,
    lineHeight: 20,
  },
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
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textCaption,
    lineHeight: 16,
  },
  badge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onBadge,
    lineHeight: 17,
  },
  chip: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.onAccent,
    lineHeight: 14,
  },
  /** 16 was the original size, but that was before the active filter count made the
      labels longer */
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
  partyLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
});
