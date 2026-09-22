import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

type Props = {
  uri: string;
  size: number;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

/** falls back to a person glyph when the portrait 404s, rather than the bare
    background color a plain <Image> leaves behind on its own */
export function Avatar({ uri, size, accessibilityLabel, style }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <View style={[styles.root, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {failed ? (
        <Ionicons
          testID="avatar-fallback"
          name="person"
          size={size * 0.6}
          color={colors.textCaption}
        />
      ) : (
        <Image
          testID="avatar-image"
          source={{ uri }}
          style={{ width: size, height: size }}
          accessibilityLabel={accessibilityLabel}
          onError={() => setFailed(true)}
          cachePolicy="memory-disk"
          transition={150}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
