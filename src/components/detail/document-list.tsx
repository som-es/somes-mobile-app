import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Document } from '@/types';

import { SectionCard } from './section-card';

type Props = {
  documents: Document[];
};

export function DocumentList({ documents }: Props) {
  return (
    <SectionCard title="Dokumente">
      <View style={styles.list}>
        {documents.map((document) => (
          <Pressable
            key={document.document_url}
            onPress={() => Linking.openURL(document.document_url)}
            accessibilityRole="link"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
            <Text style={[typography.bodyMuted, styles.label]}>
              {document.title ?? 'Dokument'}
            </Text>
          </Pressable>
        ))}
      </View>
    </SectionCard>
  );
}

/** pdfs only, every document is listed twice, sorted by title length descending */
export function pdfDocuments(documents: Document[]): Document[] {
  return documents
    .filter((document) => document.document_type.includes('PDF'))
    .slice()
    .sort((a, b) => (b.title ?? '').length - (a.title ?? '').length);
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
