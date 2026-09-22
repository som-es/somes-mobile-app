import type { ReactNode } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';

import { SubScreen } from '@/components/layout/sub-screen';
import { Card } from '@/components/ui/card';
import { ScreenTitle } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

const BOARD: { name: string; roleKey: 'obperson' | 'kassier' }[] = [
  { name: 'Daniel Atzwanger', roleKey: 'obperson' },
  { name: 'Clemens Bauer', roleKey: 'obperson' },
  { name: 'Florian Nagy', roleKey: 'obperson' },
  { name: 'Martin Zambal', roleKey: 'kassier' },
];

type MeansItem = { lead: string; text: string };

function SectionHeading({ title, accent }: { title: string; accent: string }) {
  return (
    <View style={styles.heading}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <Text style={[typography.cardHeading, styles.headingText]}>{title}</Text>
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={[typography.caption, styles.label]}>{label}</Text>
      {children}
    </View>
  );
}

export default function ImpressumScreen() {
  const { t } = useTranslation('impressum');
  const purposeItems = t('purpose.items', { returnObjects: true }) as string[];
  const means = t('purpose.means', { returnObjects: true }) as MeansItem[];
  const liability = t('disclaimer.section2.liability', { returnObjects: true }) as string[];

  return (
    <SubScreen>
      <ScreenTitle title={t('screenTitle.title')} subtitle={t('screenTitle.subtitle')} />
      <View style={styles.divider} />

      <Card style={styles.card}>
        <Text style={typography.cardHeading}>{t('mediaOwner.heading')}</Text>

        <Text style={typography.detailTitle}>{t('mediaOwner.orgName')}</Text>

        <View style={styles.fields}>
          <Field label={t('mediaOwner.zvr')}>
            <View style={styles.chip}>
              <Text style={typography.bodyMuted}>1443766724</Text>
            </View>
          </Field>

          <Field label={t('mediaOwner.seat')}>
            <Text style={typography.bodyMuted}>3470 Kirchberg am Wagram, Sonnengasse 1</Text>
          </Field>

          <Field label={t('mediaOwner.email')}>
            <Text
              style={[typography.bodyMuted, styles.link]}
              onPress={() => Linking.openURL('mailto:somes.austria@gmail.com')}
              accessibilityRole="link">
              somes.austria@gmail.com
            </Text>
          </Field>

          <Field label={t('mediaOwner.website')}>
            <Text
              style={[typography.bodyMuted, styles.link]}
              onPress={() => Linking.openURL('https://somes.at/')}
              accessibilityRole="link">
              https://somes.at
            </Text>
          </Field>

          <View style={styles.divider} />

          <Field label={t('mediaOwner.authority')}>
            <Text style={typography.bodyMuted}>{t('mediaOwner.authorityValue')}</Text>
          </Field>

          <Field label={t('mediaOwner.applicableLaw')}>
            <Text
              style={[typography.bodyMuted, styles.link]}
              onPress={() => Linking.openURL('https://www.ris.bka.gv.at')}
              accessibilityRole="link">
              {t('mediaOwner.applicableLawValue')}
            </Text>
          </Field>

          <View style={styles.divider} />

          <Field label={t('mediaOwner.appDevEmail')}>
            <Text
              style={[typography.bodyMuted, styles.link]}
              onPress={() => Linking.openURL('mailto:julian.raph.burger@gmail.com')}
              accessibilityRole="link">
              julian.raph.burger@gmail.com
            </Text>
          </Field>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <SectionHeading title={t('board.heading')} accent={colors.accent} />
        <Text style={[typography.bodyMuted, styles.italic]}>{t('board.subheading')}</Text>

        <View style={styles.members}>
          {BOARD.map((member) => (
            <View key={member.name} style={styles.member}>
              <Text style={typography.rowTitle}>{member.name}</Text>
              <Text
                style={[
                  typography.caption,
                  styles.label,
                  member.roleKey === 'kassier' ? styles.roleQuiet : styles.roleAccent,
                ]}>
                {t(`board.role.${member.roleKey}`)}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <SectionHeading title={t('purpose.heading')} accent={colors.accentMuted} />

        <View style={styles.callout}>
          <Text style={[typography.caption, styles.label]}>{t('purpose.blattlinieLabel')}</Text>
          <Text style={typography.bodyMuted}>{t('purpose.blattlinieText')}</Text>
        </View>

        <View style={styles.list}>
          {purposeItems.map((item, index) => (
            <View key={item.slice(0, 24)} style={styles.listItem}>
              <Text style={[typography.bodyMuted, styles.marker]}>{index + 1}.</Text>
              <Text style={[typography.bodyMuted, styles.itemBody]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={typography.cardHeading}>{t('purpose.meansHeading')}</Text>
        <Text style={typography.bodyMuted}>{t('purpose.meansIntro')}</Text>

        <View style={styles.list}>
          {means.map((item, index) => (
            <View key={item.lead} style={styles.listItem}>
              <Text style={[typography.bodyMuted, styles.marker]}>
                {String.fromCharCode(97 + index)}.
              </Text>
              <Text style={[typography.bodyMuted, styles.itemBody]}>
                <Text style={styles.lead}>{item.lead}</Text> {item.text}
              </Text>
            </View>
          ))}

          <View style={[styles.listItem, styles.quiet]}>
            <Text style={[typography.bodyMuted, styles.marker]}>
              {String.fromCharCode(97 + means.length)}.
            </Text>
            <Text style={[typography.bodyMuted, styles.itemBody, styles.italic]}>
              {t('purpose.extraMeans')}
            </Text>
          </View>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <SectionHeading title={t('disclaimer.heading')} accent={colors.accent} />

        <Text style={typography.detailTitle}>{t('disclaimer.section1.title')}</Text>
        <View style={styles.callout}>
          <Text style={typography.bodyMuted}>
            <Trans
              t={t}
              i18nKey="disclaimer.section1.body"
              components={{ b: <Text style={styles.bold} /> }}
            />
          </Text>
        </View>

        <Text style={typography.detailTitle}>{t('disclaimer.section2.title')}</Text>
        <Text style={typography.bodyMuted}>{t('disclaimer.section2.para1')}</Text>
        <Text style={typography.bodyMuted}>
          <Trans
            t={t}
            i18nKey="disclaimer.section2.noWarranty"
            components={{ b: <Text style={styles.bold} /> }}
          />
        </Text>
        <View style={styles.bullets}>
          {liability.map((item) => (
            <View key={item.slice(0, 24)} style={styles.listItem}>
              <Text style={[typography.bodyMuted, styles.bullet]}>•</Text>
              <Text style={[typography.bodyMuted, styles.itemBody]}>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={[typography.bodyMuted, styles.italic]}>{t('disclaimer.section2.note')}</Text>

        <Text style={typography.detailTitle}>{t('disclaimer.section3.title')}</Text>
        <Text style={typography.bodyMuted}>{t('disclaimer.section3.text')}</Text>
      </Card>

      <View style={styles.divider} />
      <Text style={typography.caption}>
        <Trans
          t={t}
          i18nKey="footer.text"
          components={{
            link: (
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('http://ec.europa.eu/odr')}
                accessibilityRole="link"
              />
            ),
          }}
        />
      </Text>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputBorder,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: radius.badge,
  },
  headingText: {
    flex: 1,
  },
  fields: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textPlaceholder,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardRaised,
    borderRadius: radius.thumb,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  link: {
    textDecorationLine: 'underline',
  },
  italic: {
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: '700',
    color: colors.textTitle,
  },
  members: {
    gap: spacing.sm,
  },
  member: {
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.thumb,
    padding: spacing.md,
    gap: spacing.xs,
  },
  roleAccent: {
    color: colors.accent,
  },
  roleQuiet: {
    color: colors.text,
  },
  callout: {
    backgroundColor: colors.inset,
    borderRadius: radius.track,
    borderLeftWidth: 4,
    borderLeftColor: colors.inputBorder,
    padding: spacing.md,
    gap: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  marker: {
    width: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  bullet: {
    width: 18,
    textAlign: 'center',
    color: colors.textMuted,
  },
  itemBody: {
    flex: 1,
  },
  lead: {
    fontWeight: '700',
    color: colors.textTitle,
  },
  quiet: {
    backgroundColor: colors.inset,
    borderRadius: radius.track,
    padding: spacing.md,
  },
  bullets: {
    gap: spacing.xs,
  },
});
