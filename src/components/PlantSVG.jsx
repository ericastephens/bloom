export default function PlantSVG({ stage = 0, color = "#7F77DD", size = 180, wilted = false }) {
  const stemColor = wilted ? "#9C98C9" : color;
  const leafColor = wilted ? "#D4CFE8" : "#FFFFFF";
  const petalColor = wilted ? "#E5DFF2" : "#F8F0FF";
  const stemTransform = wilted ? "translate(0,6) rotate(4 80 100)" : null;

  return (
    <svg width={size} height={size} viewBox="0 0 160 180" className="mx-auto overflow-visible">
      <ellipse cx="80" cy="170" rx="70" ry="12" fill="#C7B9A8" opacity="0.85" />
      <g transform={stemTransform}>
        {stage >= 1 ? (
          <path
            d="M80 156 C80 130 78 110 80 90 C82 70 84 52 80 40"
            fill="none"
            stroke={stemColor}
            strokeWidth="10"
            strokeLinecap="round"
          />
        ) : (
          <ellipse cx="80" cy="152" rx="8" ry="5" fill={stemColor} />
        )}

        {stage >= 1 && (
          <>
            <path
              d="M80 120 C68 112 60 98 70 90"
              fill={leafColor}
              stroke={stemColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M80 120 C92 112 100 98 90 90"
              fill={leafColor}
              stroke={stemColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {stage >= 2 && (
          <>
            <path
              d="M80 104 C66 100 58 86 68 78"
              fill={leafColor}
              stroke={stemColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M80 104 C94 100 102 86 92 78"
              fill={leafColor}
              stroke={stemColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {stage >= 3 && (
          <>
            <circle cx="80" cy="42" r="8" fill={stemColor} opacity="0.22" />
            <path
              d="M80 48 C70 54 60 64 64 74"
              fill="none"
              stroke={stemColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M80 48 C90 54 100 64 96 74"
              fill="none"
              stroke={stemColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )}

        {stage >= 4 && (
          <g>
            <circle cx="80" cy="32" r="20" fill={petalColor} stroke={stemColor} strokeWidth="2" />
            <path d="M80 16 L80 24" stroke={stemColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="80" cy="32" r="7" fill={stemColor} />
            <circle cx="60" cy="28" r="8" fill={petalColor} />
            <circle cx="100" cy="28" r="8" fill={petalColor} />
          </g>
        )}
      </g>
    </svg>
  );
}
