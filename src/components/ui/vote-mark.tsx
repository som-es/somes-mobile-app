import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme/colors';

type Props = {
  infavor: boolean;
  size?: number;
};

export function VoteMark({ infavor, size = 16 }: Props) {
  return (
    <Ionicons
      name={infavor ? 'checkmark' : 'close'}
      size={size}
      color={infavor ? colors.voteYes : colors.voteNo}
    />
  );
}
