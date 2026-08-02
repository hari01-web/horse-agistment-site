type Paddock = {
  id: string;
  name: string;
  row_position: number;
  col_position: number;
  has_shelter: boolean;
};

const CELL_W = 110;
const CELL_H = 90;
const GAP = 10;

export default function PaddockMap({
  paddocks,
  linkBase,
  highlightId,
}: {
  paddocks: Paddock[];
  linkBase?: string;
  highlightId?: string;
}) {
  const maxRow = Math.max(...paddocks.map((p) => p.row_position));
  const maxCol = Math.max(...paddocks.map((p) => p.col_position));
  const width = maxCol * (CELL_W + GAP) + GAP;
  const height = maxRow * (CELL_H + GAP) + GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-3xl"
      role="img"
      aria-label="Paddock map"
    >
      {paddocks.map((paddock) => {
        const x = GAP + (paddock.col_position - 1) * (CELL_W + GAP);
        const y = GAP + (paddock.row_position - 1) * (CELL_H + GAP);
        const isHighlighted = paddock.id === highlightId;

        const content = (
          <g key={paddock.id}>
            <rect
              x={x}
              y={y}
              width={CELL_W}
              height={CELL_H}
              rx={8}
              className={
                isHighlighted
                  ? "fill-brand stroke-brand-dark"
                  : "fill-brand-cream stroke-brand/30 hover:fill-brand-cream/70"
              }
              strokeWidth={1.5}
            />
            <text
              x={x + CELL_W / 2}
              y={y + CELL_H / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={
                isHighlighted
                  ? "fill-white text-[13px] font-semibold"
                  : "fill-brand-dark text-[13px] font-semibold"
              }
            >
              {paddock.name}
            </text>
            {paddock.has_shelter && (
              <text
                x={x + CELL_W / 2}
                y={y + CELL_H / 2 + 16}
                textAnchor="middle"
                className={
                  isHighlighted
                    ? "fill-white/80 text-[10px]"
                    : "fill-brand/60 text-[10px]"
                }
              >
                Shelter
              </text>
            )}
          </g>
        );

        if (!linkBase) return content;

        return (
          <a key={paddock.id} href={`${linkBase}/${paddock.id}`}>
            {content}
          </a>
        );
      })}
    </svg>
  );
}
