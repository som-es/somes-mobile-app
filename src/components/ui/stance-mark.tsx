import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme/colors';

type Props = {
  infavor: boolean;
  size?: number;
};

/** a speech is pro (green plus) or against (red minus), unlike VoteMark this is
    a stance and not a result, hence the legend next to every list that shows it */
export function StanceMark({ infavor, size = 16 }: Props) {
  return (
    <Ionicons
      name={infavor ? 'add' : 'remove'}
      size={size}
      color={infavor ? colors.voteYes : colors.voteNo}
    />
  );
}
