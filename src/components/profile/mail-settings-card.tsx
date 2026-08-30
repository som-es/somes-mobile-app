import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { getMailSendInfo, updateMailSendInfo } from '@/api/authed';
import { isHasError, unwrap } from '@/api/client';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth, useExtendedUser } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { MailSendInfo } from '@/types';

type Row = { field: keyof MailSendInfo; title: string; description: string };

/** Titles, descriptions and grouping are somes.at's, verbatim. */
const BY_INTEREST: Row[] = [
  {
    field: 'send_new_vote_results_mails',
    title: 'Abstimmungen',
    description: 'Neue Abstimmungen nach deinen Interessen',
  },
  {
    field: 'send_new_ministrial_prop_mails',
    title: 'Ministerialentwürfe',
    description: 'Neue Ministerialentwürfe nach deinen Interessen',
  },
  {
    field: 'send_new_decree_mails',
    title: 'Verordnungen',
    description: 'Neue Verordnungen nach deinen Themen',
  },
  {
    field: 'send_new_proposal_mails',
    title: 'Anträge',
    description: 'Neue Anträge nach deinen Themen',
  },
];

const BY_FAVORITE: Row[] = [
  {
    field: 'send_new_vote_result_by_favo_mails',
    title: 'Abstimmungen',
    description: 'Neue Abstimmungen nach favorisierten Personen',
  },
  {
    field: 'send_new_ministrial_prop_by_favo_mails',
    title: 'Ministerialentwürfe',
    description: 'Neue Ministerialentwürfe nach favorisierten Ministern',
  },
  {
    field: 'send_new_decree_by_favo_mails',
    title: 'Verordnungen',
    description: 'Neue Verordnungen nach favorisierten Ministern',
  },
  {
    field: 'send_new_proposal_by_favo_mails',
    title: 'Anträge',
    description: 'Neue Anträge nach favorisierten Personen',
  },
  {
    field: 'send_new_delegate_activity_mails',
    title: 'Aktivitäten',
    description: 'Neue Aktivitäten nach favorisierten Personen',
  },
];

const ALL_FIELDS: (keyof MailSendInfo)[] = [...BY_INTEREST, ...BY_FAVORITE].map(
  (row) => row.field
);

/** "E-Mail Benachrichtigungen" — Figma node 286:718. */
export function MailSettingsCard() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { data: account } = useExtendedUser();

  const settings = useQuery({
    queryKey: ['mail-send-info'],
    queryFn: async () => unwrap(await getMailSendInfo()),
    enabled: isAuthenticated,
  });

  // There is no per-field endpoint: every toggle PUTs all nine booleans.
  const save = useMutation({
    mutationFn: async (next: MailSendInfo) => {
      const result = await updateMailSendInfo(next);
      if (isHasError(result)) throw new Error(`${result.error_type}: ${result.error}`);
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ['mail-send-info'] });
      const previous = queryClient.getQueryData<MailSendInfo>(['mail-send-info']);
      queryClient.setQueryData(['mail-send-info'], next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) queryClient.setQueryData(['mail-send-info'], context.previous);
    },
    // Refetch rather than trust the optimistic value: somes-api mis-binds
    // `send_new_vote_result_by_favo_mails`, so that one toggle visibly snaps back.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['mail-send-info'] }),
  });

  const value = settings.data;

  if (account?.is_email_hashed) {
    return (
      <Card>
        <Text style={typography.cardHeading}>E-Mail Benachrichtigungen</Text>
        <Text style={[typography.bodyMuted, styles.unavailable]}>
          nicht verfügbar: Anonymisierung durch Mail-Wechsel aufheben
        </Text>
      </Card>
    );
  }

  if (!value) {
    return (
      <Card>
        <Text style={typography.cardHeading}>E-Mail Benachrichtigungen</Text>
        <Text style={typography.caption}>
          {settings.isError
            ? 'Einstellungen konnten nicht geladen werden.'
            : 'Einstellungen werden geladen'}
        </Text>
      </Card>
    );
  }

  const allChecked = ALL_FIELDS.every((field) => value[field]);

  return (
    <Card style={styles.card}>
      <View style={styles.heading}>
        <Text style={[typography.cardHeading, styles.grow]}>E-Mail Benachrichtigungen</Text>
        <Text style={typography.caption}>Alle</Text>
        <Switch
          value={allChecked}
          accessibilityLabel="Alle Benachrichtigungen"
          onValueChange={(checked) =>
            save.mutate(
              ALL_FIELDS.reduce(
                (next, field) => ({ ...next, [field]: checked }),
                { ...value }
              )
            )
          }
        />
      </View>

      <Group
        title="Nach Interessen & Themen"
        rows={BY_INTEREST}
        value={value}
        onChange={(field, checked) => save.mutate({ ...value, [field]: checked })}
      />

      <View style={styles.divider} />

      <Group
        title="Nach favorisierten Ministern & Personen"
        rows={BY_FAVORITE}
        value={value}
        onChange={(field, checked) => save.mutate({ ...value, [field]: checked })}
      />
    </Card>
  );
}

function Group({
  title,
  rows,
  value,
  onChange,
}: {
  title: string;
  rows: Row[];
  value: MailSendInfo;
  onChange: (field: keyof MailSendInfo, checked: boolean) => void;
}) {
  return (
    <View style={styles.group}>
      <Text style={typography.tableHead}>{title}</Text>
      {rows.map((row) => (
        <View key={row.field} style={styles.row}>
          <View style={styles.grow}>
            <Text style={typography.cardTitle}>{row.title}</Text>
            <Text style={typography.caption}>{row.description}</Text>
          </View>
          <Switch
            value={value[row.field]}
            accessibilityLabel={`${row.title}: ${row.description}`}
            onValueChange={(checked) => onChange(row.field, checked)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  group: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  /** The hairline the Figma draws between the two groups (node 286:788). */
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputBorder,
  },
  unavailable: {
    marginTop: spacing.sm,
  },
});
