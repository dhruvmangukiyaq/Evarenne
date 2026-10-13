import type { CSSProperties } from "react";

import diamondSide from "../../assets/hero/diamond-side.webp";

/**
 * HeroStage — the homepage's signature moment.
 *
 * A round brilliant falls from above the stage and lands point-down in the
 * cradle of a fluted stone pedestal: fall, squash, rebound, settle, with the
 * pedestal recoiling and a champagne spark at the impact. The whole scene is
 * one 640×700 SVG so the stone, the pedestal and the motion share a coordinate
 * space (and so everything scales with the stage); the motion itself lives in
 * `index.css` under `.hero-*`.
 *
 * The stone is a sample image of the cut — the site never pretends a stock
 * image is one of its own stones (the homepage copy states this too).
 */

const CHAMPAGNE = "#C7AD7A";

/** Four-point sparkle, reused for the glints and the impact sparks. */
const GLINT =
  "M0,-15 C2.2,-4.6 4.6,-2.2 15,0 C4.6,2.2 2.2,4.6 0,15 C-2.2,4.6 -4.6,2.2 -15,0 C-4.6,-2.2 -2.2,-4.6 0,-15 Z";

/*
 * The stone. The cut-out is 940×569 with its seat — the culet — at
 * (469.6, 568.6); this frame places that seat in the cradle at (320, 496)
 * and stretches the stone to 460 wide, so it dominates the stage.
 */
const STONE = { x: 90.2, y: 217.7, width: 460, height: 278.5 };

/** Flutes: the shaft is a gentle flare (124 wide at the top, 144 at the foot). */
const FLUTES = Array.from({ length: 7 }, (_, index) => {
  const f0 = index / 7;
  const f1 = (index + 1) / 7;
  return {
    points: `${258 + 124 * f0},512 ${258 + 124 * f1},512 ${248 + 144 * f1},604 ${248 + 144 * f0},604`,
    fill: index % 2 === 0 ? "#EDE4D0" : "#DFD3B7",
  };
});

/** Impact sparks: position on the scene, then drift per spark via --sx/--sy. */
const SPARKS: Array<{ x: number; y: number; sx: string; sy: string }> = [
  { x: 210, y: 470, sx: "-34px", sy: "-26px" },
  { x: 430, y: 470, sx: "34px", sy: "-26px" },
  { x: 200, y: 545, sx: "-30px", sy: "24px" },
  { x: 440, y: 545, sx: "30px", sy: "24px" },
];

const sparkStyle = (sx: string, sy: string) => ({ "--sx": sx, "--sy": sy }) as CSSProperties;

export function HeroStage({ className = "" }: { className?: string }) {
  return (
    <figure className={`relative ${className}`}>
      {/* No frame — the scene sits straight on the page */}
      <div className="hero-stage relative aspect-[32/35] overflow-hidden">
        <svg viewBox="0 0 640 700" className="block h-full w-full" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="heroGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="0.6" stopColor="#FBF7EE" stopOpacity="0.5" />
              <stop offset="1" stopColor="#F0EADF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="heroRule" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={CHAMPAGNE} stopOpacity="0" />
              <stop offset="0.2" stopColor={CHAMPAGNE} stopOpacity="1" />
              <stop offset="0.8" stopColor={CHAMPAGNE} stopOpacity="1" />
              <stop offset="1" stopColor={CHAMPAGNE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroStone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#DFD4BA" />
              <stop offset="0.45" stopColor="#EFE7D5" />
              <stop offset="1" stopColor="#D6C9AC" />
            </linearGradient>
            <filter id="heroSoft" x="-40%" y="-80%" width="180%" height="260%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Backdrop: stage light, halo rings, the table line */}
          <ellipse cx="320" cy="300" rx="330" ry="290" fill="url(#heroGlow)" />
          <g fill="none" stroke={CHAMPAGNE}>
            <circle cx="320" cy="340" r="248" strokeWidth="1.5" opacity="0.3" />
            <circle cx="320" cy="340" r="234" strokeWidth="1" opacity="0.16" />
          </g>
          <rect x="40" y="621" width="560" height="1.6" fill="url(#heroRule)" />
          <ellipse
            className="hero-ground"
            cx="320"
            cy="626"
            rx="140"
            ry="13"
            fill="#262821"
            opacity="0.2"
            filter="url(#heroSoft)"
          />

          {/* The pedestal: fluted stone, champagne band, stepped plinth */}
          <g className="hero-stand">
            <path d="M258,512 L382,512 L392,604 L248,604 Z" fill="url(#heroStone)" />
            {FLUTES.map((flute) => (
              <polygon key={flute.points} points={flute.points} fill={flute.fill} opacity="0.55" />
            ))}
            {/* Cylindrical shading */}
            <path d="M258,512 L276,512 L266,604 L248,604 Z" fill="#262821" opacity="0.08" />
            <path d="M364,512 L382,512 L392,604 L374,604 Z" fill="#262821" opacity="0.12" />
            <rect x="256" y="522" width="128" height="4" fill={CHAMPAGNE} opacity="0.9" />
            {/* Top plate */}
            <rect x="244" y="498" width="152" height="15" rx="4" fill="#E7DDC6" />
            <rect x="244" y="498" width="152" height="2.5" rx="1" fill="#F8F3E7" />
            {/* Plinth */}
            <rect x="238" y="604" width="164" height="9" rx="3" fill="#E2D7BE" />
            <rect x="228" y="612" width="184" height="10" rx="3" fill="#D3C5A4" />
            <rect x="228" y="612" width="184" height="2" rx="1" fill={CHAMPAGNE} opacity="0.75" />
          </g>

          {/* The stone: drops in, squashes on its point, rebounds, stands.
              The frame seats the image's culet in the cradle below. */}
          <g className="hero-drop">
            <image
              href={diamondSide}
              x={STONE.x}
              y={STONE.y}
              width={STONE.width}
              height={STONE.height}
            />
          </g>

          {/* The cradle the point seats into, then the impact sparks */}
          <g className="hero-stand">
            <path d="M298,494 C299,505 341,505 342,494 Z" fill="#B9995F" />
            <ellipse cx="320" cy="494" rx="22" ry="4.5" fill="#DCC292" />
          </g>

          <g fill={CHAMPAGNE}>
            {SPARKS.map((spark) => (
              <g key={`${spark.x}-${spark.y}`} transform={`translate(${spark.x} ${spark.y})`}>
                <g className="hero-spark" style={sparkStyle(spark.sx, spark.sy)}>
                  <path d={GLINT} transform="scale(0.95)" />
                  <path d={GLINT} transform="scale(0.5) rotate(28deg)" opacity="0.8" />
                </g>
              </g>
            ))}
          </g>

          {/* Idle glints — a slow twinkle once the stone is standing */}
          <g>
            <g transform="translate(270 300)">
              <g className="hero-glint" style={{ animationDelay: "1.9s" }}>
                <path d={GLINT} fill={CHAMPAGNE} opacity="0.5" transform="scale(1.55)" />
                <path d={GLINT} fill="#FFFDF6" />
              </g>
            </g>
            <g transform="translate(390 352)">
              <g className="hero-glint" style={{ animationDelay: "3.4s" }}>
                <path d={GLINT} fill={CHAMPAGNE} opacity="0.45" transform="scale(1.35)" />
                <path d={GLINT} fill="#FFFDF6" transform="scale(0.8)" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </figure>
  );
}
