import Svg, { Circle } from "react-native-svg";

type Segment = {
  count: number;
  color: string;
};

type Props = {
  segments: Segment[];
  size?: number;
};

const STROKE = 4;

/** one ring split into coloured arcs, starting at twelve o'clock */
export function VoteDonut({ segments, size = 20 }: Props) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  let offset = 0;
  const arcs =
    total === 0
      ? []
      : segments
          .filter((segment) => segment.count > 0)
          .map((segment) => {
            const length = (segment.count / total) * circumference;
            const arc = { ...segment, length, offset };
            offset += length;
            return arc;
          });

  return (
    <Svg width={size} height={size}>
      {arcs.map((arc) => (
        <Circle
          key={arc.color}
          cx={center}
          cy={center}
          r={radius}
          stroke={arc.color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${arc.length} ${circumference}`}
          strokeDashoffset={-arc.offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      ))}
    </Svg>
  );
}
