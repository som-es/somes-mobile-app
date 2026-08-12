import { StyleSheet, Text } from 'react-native';

import { typography } from '@/theme/typography';

import { Card } from './card';

type Props = {
  message: string;
};

export function Notice({ message }: Props) {
  return (
    <Card>
      <Text style={[typography.bodyMuted, styles.text]}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});
