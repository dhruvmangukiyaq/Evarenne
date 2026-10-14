import type { CSSProperties } from "react";

import diamondSide from "../../assets/hero/diamond-side.webp";

/**
 * HeroStage — the homepage's signature moment.
 *
 * A round brilliant falls from above the stage and settles inside the halo
 * ring, then turns one full revolution on the spot. There is no plinth: the
 * stone simply hangs in the light. The whole scene is one 640×700 SVG so
 * the stone and the motion share a coordinate space (and so everything
 * scales with the stage); the motion itself lives in `index.css` under
 * `.hero-*`.
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
 * (469.6, 568.6); this frame hangs that seat at (320, 496) and stretches
 * the stone to 460 wide, so it dominates the stage.
 */
const STONE = { x: 90.2, y: 217.7, width: 460, height: 278.5 };

/**
 * Impact sparks: a symmetric burst around the culet at (320, 496), then
 * drift per spark via --sx/--sy.
 */
const SPARKS: Array<{ x: number; y: number; sx: string; sy: string }> = [
  { x: 218, y: 452, sx: "-34px", sy: "-26px" },
  { x: 422, y: 452, sx: "34px", sy: "-26px" },
  { x: 250, y: 524, sx: "-30px", sy: "24px" },
  { x: 390, y: 524, sx: "30px", sy: "24px" },
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
          </defs>

          {/* Backdrop: stage light, halo rings, the table line */}
          <ellipse cx="320" cy="300" rx="330" ry="290" fill="url(#heroGlow)" />
          <g fill="none" stroke={CHAMPAGNE}>
            <circle cx="320" cy="340" r="248" strokeWidth="1.5" opacity="0.3" />
            <circle cx="320" cy="340" r="234" strokeWidth="1" opacity="0.16" />
          </g>
          <rect x="40" y="621" width="560" height="1.6" fill="url(#heroRule)" />

          {/* The stone: falls in, squashes on its point, rebounds, settles —
              then turns one full revolution where it landed. It hangs with no
              plinth beneath it, so the frame seats the image's culet at
              (320, 496) inside the halo. */}
          <g className="hero-drop">
            <g className="hero-spin">
              <image
                href={diamondSide}
                x={STONE.x}
                y={STONE.y}
                width={STONE.width}
                height={STONE.height}
              />
            </g>
          </g>

          {/* The impact sparks burst around the culet as it lands */}
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

          {/* Idle glints — a slow twinkle once the stone is settled */}
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
