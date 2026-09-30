import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

type Props = {
  /** share in favour, 0 to 100 */
  percent: number;
  size?: number;
};

const STROKE = 4;

/** share of a roll call vote cast in favour, green on a red track */
export function VoteDonut({ percent, size = 36 }: Props) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${percent}%`}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.voteNo}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.voteYes}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.label} pointerEvents="none">
        <Text style={[typography.partyLabel, styles.text]}>{percent}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
  },
});
