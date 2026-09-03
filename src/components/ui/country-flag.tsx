import AtFlag from '@/assets/source/at/flag.svg';
import AtMapFlag from '@/assets/source/at/map_flag.svg';
import EuFlag from '@/assets/source/eu/flag.svg';
import EuMapFlag from '@/assets/source/eu/map_flag.svg';
import type { Country } from '@/types';

/** both flags are drawn on a 3:2 canvas */
const FLAG_ASPECT = 2 / 3;

const FLAG = { at: AtFlag, eu: EuFlag };
const MAP_FLAG = { at: AtMapFlag, eu: EuMapFlag };

type Props = {
  country: Country;
  /** flag is the rectangular banner, map is the country silhouette wearing it */
  variant?: 'flag' | 'map';
  size?: number;
};

export function CountryFlag({ country, variant = 'flag', size = 24 }: Props) {
  if (variant === 'map') {
    const Icon = MAP_FLAG[country];
    return <Icon width={size} height={size} />;
  }

  const Icon = FLAG[country];
  return <Icon width={size} height={size * FLAG_ASPECT} />;
}
