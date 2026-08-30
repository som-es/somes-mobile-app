import { colors } from './colors';

/* ported from somes-frontend, unlike party colours these are not an api field,
   the topic map itself lives in ./topic-groups.ts */
const TOPIC_COLORS: Record<string, string> = {
  Sport: '#006400',
  'Budget und Finanzen': '#FFD700',
  'Information und Medien': '#4B0082',
  Arbeit: '#4682B4',
  'Europäische Union': '#4169E1',
  'Familie und Generationen': '#B76E79',
  'Gesundheit und Ernährung': '#191970',
  'Klima, Umwelt und Energie': '#008000',
  'Frauen und Gleichbehandlung': '#DCB0D0',
  'Verkehr und Infrastruktur': '#FF8C00',
  'Inneres und Recht': '#800000',
  'Innovation, Technologie und Forschung': '#008080',
  Bildung: '#0F52BA',
  Wirtschaft: '#8B008B',
  Landesverteidigung: '#556B2F',
  'Parlament und Demokratie': '#FF6F61',
  Außenpolitik: '#800020',
  'Land- und Forstwirtschaft': '#A0522D',
  Soziales: '#FFE5B4',
  Kultur: '#8A2BE2',
};

export function topicColor(topic: string): string {
  return TOPIC_COLORS[topic] ?? colors.textCaption;
}
