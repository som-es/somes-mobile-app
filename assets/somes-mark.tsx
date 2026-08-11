import Svg, { Line, Path, Polygon } from 'react-native-svg';

import { colors } from '@/theme/colors';

/**
 * The somes mark: a parliament architrave over three columns, whose outer two
 * cross into an infinity loop.
 *
 * Hand-written rather than imported from `somes-mark.svg` beside it, because
 * that file carries its geometry in a `<defs><style>` block (`.cls-1/2/3`), and
 * react-native-svg does not apply CSS. Importing it silently drops every
 * `stroke-width` and every `fill: none`, so the open curves flood solid.
 *
 * The path data below is copied verbatim from that file; only the class
 * references are resolved into presentation props:
 *
 *   .cls-1  the architrave    filled, stroke 4, linejoin round
 *   .cls-2  columns + centre  fill none, stroke 6
 *   .cls-3  the infinity loop fill none, stroke 5
 *
 * Do not use `somes-wordmark.svg` for the header. It is the web app's lockup,
 * and its "somes" is a live `<text>` in Tahoma — a Microsoft font that exists
 * on neither iOS nor Android. Pair this mark with a real `<Text>` instead,
 * which is also what the Figma draws (node 286:153).
 */

/** 107.18 / 119.44, from the viewBox. */
const ASPECT = 0.8974;

type Props = {
  /** Height in points; width follows the mark's aspect ratio. */
  size?: number;
  color?: string;
};

export function SomesMark({ size = 35, color = colors.onChrome }: Props) {
  const stroke = { stroke: color, strokeLinecap: 'round' as const, strokeMiterlimit: 10 };

  return (
    <Svg width={size * ASPECT} height={size} viewBox="0 0 107.18 119.44">
      <Polygon
        points="102.47 2 97.68 8.35 9.55 8.35 4.76 2 102.47 2"
        fill={color}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M49.58,110.18c-2.94,1.6-7.43,3.66-13.25,5.06-4.8,1.15-11.12,2.67-18.67,.87-3.02-.73-8.85-2.11-12.49-7.01-.9-1.19-3.03-4.07-2.62-7.89,.46-4.21,3.69-6.76,4.62-7.49,2.21-1.75,4.39-2.32,6.9-2.99,.85-.24,4.46-1.15,9.37-.93,4.42,.21,7.64,1.23,10.22,2.05,3.83,1.21,6.63,2.63,8.07,3.36,2.5,1.28,4.45,2.53,5.73,3.36,1.77,1.13,1.82,1.27,5.2,3.55,3.24,2.19,3.24,2.12,5.03,3.37,.22,.15,.42,.29,.61,.43"
        fill="none"
        strokeWidth={5}
        {...stroke}
      />
      <Path
        d="M57.6,95.3c2.94-1.6,7.43-3.66,13.25-5.06,4.8-1.15,11.12-2.67,18.67-.87,3.02,.73,8.85,2.11,12.49,7.01,.9,1.19,3.03,4.07,2.62,7.89-.46,4.21-3.69,6.76-4.62,7.49-2.21,1.75-4.39,2.32-6.9,2.99-.85,.24-4.46,1.15-9.37,.93-4.42-.21-7.64-1.23-10.22-2.05-3.83-1.21-6.63-2.63-8.07-3.36-2.5-1.28-4.45-2.53-5.73-3.36-1.77-1.13-1.82-1.27-5.2-3.55-3.24-2.19-3.24-2.12-5.03-3.37-.22-.15-.42-.29-.61-.43"
        fill="none"
        strokeWidth={5}
        {...stroke}
      />
      <Path
        d="M23.09,15.48c.93,5,1.83,11.69,1.91,19.62,.03,2.57,0,8.51-.82,14.71-.9,6.84-3.41,19.09-11.72,33.79"
        fill="none"
        strokeWidth={6}
        {...stroke}
      />
      <Path
        d="M84.77,15.48c-.93,5-1.83,11.69-1.91,19.62-.03,2.57,0,8.51,.82,14.71,.9,6.84,3.41,19.09,11.72,33.79"
        fill="none"
        strokeWidth={6}
        {...stroke}
      />
      <Line x1="53.93" y1="16.45" x2="53.93" y2="80.45" strokeWidth={6} {...stroke} />
    </Svg>
  );
}
