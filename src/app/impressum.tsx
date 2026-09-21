import type { ReactNode } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { SubScreen } from '@/components/layout/sub-screen';
import { Card } from '@/components/ui/card';
import { ScreenTitle } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

const BOARD = [
  { name: 'Daniel Atzwanger', role: 'Obperson' },
  { name: 'Clemens Bauer', role: 'Obperson' },
  { name: 'Florian Nagy', role: 'Obperson' },
  { name: 'Martin Zambal', role: 'Kassier' },
];

const PURPOSE = [
  'Der Zweck des Vereins ist die Förderung einer gerechten, demokratischen und ' +
    'transparenten Gesellschaft im Einklang mit den Grundwerten und Prinzipien des ' +
    'Vereins. Somes setzt sich ein für die Wahrung von Frieden, Menschenrechten und ' +
    'Demokratie, die Förderung von Transparenz und Partizipation auf allen Ebenen ' +
    'sowie die Schaffung eines freien Zugangs zu Informationen und die Überwindung ' +
    'gesellschaftlicher Polarisierung. Der Verein fördert politische Bildung, ' +
    'internationalen Austausch und den Aufbau eines globalen Netzwerks, um soziale ' +
    'und kulturelle Barrieren zu überwinden.',
  'Die Tätigkeit des Vereins ist nicht auf Gewinn gerichtet.',
  'Der Verein verfolgt nach seinen Statuten ausschließlich und unmittelbar ' +
    'gemeinnützige und mildtätige Zwecke im Sinne der geltenden abgabenrechtlichen ' +
    'Bestimmungen (§§ 34 bis 47 der Bundesabgabenordnung – BAO). Allfällige nicht im ' +
    'Sinne der §§ 34 ff BAO begünstigte Zwecke sind den begünstigten Zwecken völlig ' +
    'untergeordnet und werden höchstens im Ausmaß von 10% der Gesamtressourcen ' +
    'verfolgt.',
];

const MEANS = [
  {
    letter: 'a.',
    lead: 'Politische Bildung und Aufklärung:',
    text:
      'Der Verein fördert die politische Bildung und das kritische Denken. Dazu werden ' +
      'Workshops, Seminare und Veranstaltungen zu Themen wie Demokratie, ' +
      'Menschenrechten und gesellschaftlicher Teilhabe durchgeführt. Zudem erfolgt die ' +
      'Verbreitung von Wissen durch Publikationen, Studien und Analysen.',
  },
  {
    letter: 'b.',
    lead: 'Förderung von Transparenz und Partizipation:',
    text:
      'Der Verein setzt Initiativen zur Förderung der politischen Transparenz und ' +
      'Partizipation auf lokaler, nationaler und internationaler Ebene um. Dabei werden ' +
      'Plattformen geschaffen, die Bürgerinnen und Bürgern den Zugang zu Informationen ' +
      'und Mitbestimmung erleichtern.',
  },
  {
    letter: 'c.',
    lead: 'Aufbau und Betrieb der Online-Plattform „somes“:',
    text:
      'Der Verein entwickelt und pflegt eine Online-Plattform zur Förderung von ' +
      'politischer Transparenz, demokratischer Partizipation und des offenen Dialogs. ' +
      'Dabei werden Tools und Ressourcen bereitgestellt, die den Austausch von Ideen, ' +
      'die Organisation von Initiativen und die weltweite Vernetzung von Menschen ' +
      'erleichtern. Zudem wird die Plattform unter besonderer Berücksichtigung des ' +
      'Datenschutzes und der Barrierefreiheit für alle Nutzer gestaltet.',
  },
  {
    letter: 'd.',
    lead: 'Überwindung gesellschaftlicher Spaltung:',
    text:
      'Der Verein führt Dialogforen durch, um soziale Blasen und gesellschaftliche ' +
      'Polarisierung zu verringern. Dabei wird der Austausch unterschiedlicher ' +
      'Perspektiven gefördert, um Verständnis und gesellschaftlichen Zusammenhalt zu ' +
      'stärken.',
  },
  {
    letter: 'e.',
    lead: 'Internationale Zusammenarbeit und Netzwerkarbeit:',
    text:
      'Der Verein baut ein globales Netzwerk zur Förderung von Frieden und ' +
      'internationalem Zusammenhalt auf und pflegt dieses aktiv. Dabei werden Projekte ' +
      'unterstützt, die den interkulturellen Dialog und die Zusammenarbeit zwischen ' +
      'Nationen fördern.',
  },
  {
    letter: 'f.',
    lead: 'Einsatz für ein freies Internet:',
    text:
      'Der Verein fördert den freien Zugang zu unabhängigen und qualitativ hochwertigen ' +
      'Informationen. Zudem setzt er sich für Open-Source, Datenschutz, Medienkompetenz ' +
      'und die kritische Auseinandersetzung mit Desinformationen ein.',
  },
  {
    letter: 'g.',
    lead: 'Investigative Aufklärungsarbeit:',
    text:
      'Der Verein führt investigative Recherchen durch, um gesellschaftliche Missstände ' +
      'aufzudecken. Dabei werden Analysen und Daten veröffentlicht, die zur Förderung ' +
      'fundierter öffentlicher Diskussionen beitragen.',
  },
  {
    letter: 'h.',
    lead: 'Beratung und Unterstützung:',
    text:
      'Der Verein berät staatliche Institutionen, Unternehmen und andere Organisationen ' +
      'in Übereinstimmung mit seinen Grundwerten. Zudem unterstützt er Projekte und ' +
      'Initiativen, die den Zielen des Vereins dienen.',
  },
  {
    letter: 'i.',
    lead: 'Organisation von und Beteiligung an gesellschaftlichen Initiativen:',
    text:
      'Der Verein plant und unterstützt Volksbegehren, Demonstrationen und ' +
      'Veranstaltungen im Einklang mit seinen Werten. Darüber hinaus fördert er den ' +
      'Austausch zwischen Mitgliedern und Partnerorganisationen.',
  },
];

const LIABILITY = [
  'für die Richtigkeit, Vollständigkeit, Aktualität und technische Verfügbarkeit der ' +
    'bereitgestellten Daten;',
  'für Fehler, die durch automatisierte Verarbeitungsprozesse (z.B. Parsing-Fehler) ' +
    'oder durch Fehlinterpretationen der Originaldaten entstehen;',
  'für Handlungen oder Entscheidungen, die auf Basis der auf somes bereitgestellten ' +
    'Informationen getroffen werden.',
];

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
  return (
    <SubScreen>
      <ScreenTitle
        title="Impressum"
        subtitle="Angaben nach § 5 E-Commerce Gesetz und Offenlegung nach § 25 Mediengesetz."
      />
      <View style={styles.divider} />

      <Card style={styles.card}>
        <Text style={typography.cardHeading}>Medieninhaber &amp; Herausgeber</Text>

        <Text style={typography.detailTitle}>
          somes - Verein für Demokratie und politische Transparenz
        </Text>

        <View style={styles.fields}>
          <Field label="ZVR-Zahl">
            <View style={styles.chip}>
              <Text style={typography.bodyMuted}>1443766724</Text>
            </View>
          </Field>

          <Field label="Vereinssitz">
            <Text style={typography.bodyMuted}>3470 Kirchberg am Wagram, Sonnengasse 1</Text>
          </Field>

          <Field label="E-Mail">
            <Text
              style={[typography.bodyMuted, styles.link]}
              onPress={() => Linking.openURL('mailto:somes.austria@gmail.com')}
              accessibilityRole="link">
              somes.austria@gmail.com
            </Text>
          </Field>

          <Field label="Website">
            <Text
              style={[typography.bodyMuted, styles.link]}
              onPress={() => Linking.openURL('https://somes.at/')}
              accessibilityRole="link">
              https://somes.at
            </Text>
          </Field>

          <View style={styles.divider} />

          <Field label="Zuständige Behörde">
            <Text style={typography.bodyMuted}>Bezirkshauptmannschaft Tulln an der Donau</Text>
          </Field>

          <Field label="Anwendbare Vorschriften">
            <Text
              style={[typography.bodyMuted, styles.link]}
              onPress={() => Linking.openURL('https://www.ris.bka.gv.at')}
              accessibilityRole="link">
              Vereinsgesetz 2002
            </Text>
          </Field>

          <View style={styles.divider} />

          <Field label="App Entwickler E-Mail">
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
        <SectionHeading title="Vorstand" accent={colors.accent} />
        <Text style={[typography.bodyMuted, styles.italic]}>
          Vertretungsbefugte Organe des Vereins
        </Text>

        <View style={styles.members}>
          {BOARD.map((member) => (
            <View key={member.name} style={styles.member}>
              <Text style={typography.rowTitle}>{member.name}</Text>
              <Text
                style={[
                  typography.caption,
                  styles.label,
                  member.role === 'Kassier' ? styles.roleQuiet : styles.roleAccent,
                ]}>
                {member.role}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <SectionHeading title="Grundlegende Richtung & Vereinszweck" accent={colors.accentMuted} />

        <View style={styles.callout}>
          <Text style={[typography.caption, styles.label]}>Blattlinie</Text>
          <Text style={typography.bodyMuted}>
            Information über die Aktivitäten des Vereins sowie Förderung der politischen
            Bildung, Demokratie und Transparenz entsprechend dem nachstehenden Vereinszweck.
          </Text>
        </View>

        <View style={styles.list}>
          {PURPOSE.map((item, index) => (
            <View key={item.slice(0, 24)} style={styles.listItem}>
              <Text style={[typography.bodyMuted, styles.marker]}>{index + 1}.</Text>
              <Text style={[typography.bodyMuted, styles.itemBody]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={typography.cardHeading}>
          Ideelle und materielle Mittel zur Erreichung des Zwecks
        </Text>
        <Text style={typography.bodyMuted}>
          Der Zweck des Vereins soll durch folgende Tätigkeiten erreicht werden:
        </Text>

        <View style={styles.list}>
          {MEANS.map((item) => (
            <View key={item.letter} style={styles.listItem}>
              <Text style={[typography.bodyMuted, styles.marker]}>{item.letter}</Text>
              <Text style={[typography.bodyMuted, styles.itemBody]}>
                <Text style={styles.lead}>{item.lead}</Text> {item.text}
              </Text>
            </View>
          ))}

          <View style={[styles.listItem, styles.quiet]}>
            <Text style={[typography.bodyMuted, styles.marker]}>j.</Text>
            <Text style={[typography.bodyMuted, styles.itemBody, styles.italic]}>
              Sofern dies dem Vereinszweck dient, ist der Verein weiters berechtigt, sich an
              Kapitalgesellschaften zu beteiligen, sich Erfüllungsgehilfen gemäß § 40 Abs. 1
              BAO zu bedienen oder selbst als Erfüllungsgehilfe tätig zu werden, Geldmittel
              gemäß § 40a Z 1 BAO weiterzuleiten, entgeltliche Lieferungen gemäß § 40a Z 2
              BAO ohne Gewinnerzielungsabsicht zu erbringen sowie Geldmittel gemäß § 40b BAO
              für Preise und Stipendien zur Verfügung zu stellen.
            </Text>
          </View>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <SectionHeading title="Haftungsausschluss (Disclaimer)" accent={colors.accent} />

        <Text style={typography.detailTitle}>1. Unabhängigkeit der Plattform</Text>
        <View style={styles.callout}>
          <Text style={typography.bodyMuted}>
            <Text style={styles.bold}>somes</Text> ist ein unabhängiges,
            zivilgesellschaftliches Projekt (entstanden aus einer HTL-Diplomarbeit) und steht
            in <Text style={styles.bold}>keiner offiziellen Verbindung</Text> zur Republik
            Österreich, der Parlamentsdirektion, Regierungsorganen oder politischen Parteien.
            Weder die Betreiber und Entwickler dieser Website, noch die Mitglieder des
            Vereinvorstands, sind Mitglied bei einer politischen Partei oder stehen einer
            nahe.
          </Text>
        </View>

        <Text style={typography.detailTitle}>2. Herkunft und Richtigkeit der Daten</Text>
        <Text style={typography.bodyMuted}>
          Die auf dieser Plattform dargestellten Informationen basieren auf öffentlich
          zugänglichen Daten (Open Data), primär bereitgestellt durch das österreichische
          Parlament (parlament.gv.at) und dem Rechtsinformationssytem des Bundes
          (www.ris.bka.gv.at). Die Erfassung, Aggregation und Aufbereitung dieser Daten
          erfolgt vollständig automatisiert und wird freiwillig, kostenlos, ohne Werbung und
          ohne Tracking zur Verfügung gestellt.
        </Text>
        <Text style={typography.bodyMuted}>
          Wir bemühen uns um höchste Sorgfalt, übernehmen jedoch{' '}
          <Text style={styles.bold}>keinerlei Gewähr und Haftung</Text> (auch nicht bei
          leichter Fahrlässigkeit):
        </Text>
        <View style={styles.bullets}>
          {LIABILITY.map((item) => (
            <View key={item.slice(0, 24)} style={styles.listItem}>
              <Text style={[typography.bodyMuted, styles.bullet]}>•</Text>
              <Text style={[typography.bodyMuted, styles.itemBody]}>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={[typography.bodyMuted, styles.italic]}>
          Im Zweifelsfall gelten immer die offiziellen Dokumente und Publikationen der
          Parlamentsdirektion. Die Nutzung dieser Webseite erfolgt auf eigene Gefahr.
        </Text>

        <Text style={typography.detailTitle}>3. Haftung für Links</Text>
        <Text style={typography.bodyMuted}>
          Unsere Plattform enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
          keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
          Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung wurden die
          Seiten auf mögliche Rechtsverletzungen geprüft; rechtswidrige Inhalte waren nicht
          erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
          ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden
          von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </Text>
      </Card>

      <View style={styles.divider} />
      <Text style={typography.caption}>
        Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform
        der EU zu richten:{' '}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('http://ec.europa.eu/odr')}
          accessibilityRole="link">
          http://ec.europa.eu/odr
        </Text>
        . Sie können allfällige Beschwerden auch an die oben angegebene E-Mail-Adresse
        richten.
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
