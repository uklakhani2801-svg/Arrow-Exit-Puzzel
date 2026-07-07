import React from 'react';
import { Difficulty } from '../types';

interface CreativeArrowProps {
  id: string;
  dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  color: string;
  levelNumber: number;
  difficulty: Difficulty;
  isHinted?: boolean;
}

/**
 * Procedural Art Themes for Levels:
 * Cycle theme based on levelNumber to make every level look distinct!
 */
export type ArrowArtTheme = 'MAZE_CLASSIC' | 'NEON_CIRCUIT' | 'ORGANIC_WAVE' | 'STEALTH_TECH' | 'RETRO_PIXEL';

export function getLevelArtTheme(levelNumber: number): ArrowArtTheme {
  const themes: ArrowArtTheme[] = ['MAZE_CLASSIC', 'NEON_CIRCUIT', 'ORGANIC_WAVE', 'STEALTH_TECH', 'RETRO_PIXEL'];
  return themes[levelNumber % themes.length];
}

export default function CreativeArrow({
  id,
  dir,
  color,
  levelNumber,
  difficulty,
  isHinted = false,
}: CreativeArrowProps) {
  // Determine the theme of this level
  const theme = getLevelArtTheme(levelNumber);

  // Parse arrow ID to get a deterministic index for template variation inside the grid
  const arrowNumericId = parseInt(id.replace(/\D/g, '')) || 0;
  // Choose one of 12 templates based on the arrow's numeric ID to add immense variety
  const templateIndex = (arrowNumericId + levelNumber) % 12;

  // Rotation angle based on direction (we design templates facing UP and rotate them)
  let rotation = 0;
  if (dir === 'RIGHT') rotation = 90;
  else if (dir === 'DOWN') rotation = 180;
  else if (dir === 'LEFT') rotation = 270;

  // Adjust stroke width based on grid size for optimal clarity
  const isLargeGrid = difficulty === 'HARD' || difficulty === 'EXPERT';
  const strokeWidth = isLargeGrid ? '7' : '8.5';

  // Let's define the path and arrowhead for each template (all pointing UP by default)
  let pathD = '';
  let arrowheadD = '';
  let extraElements: React.ReactNode = null;

  switch (templateIndex) {
    case 0: // Classic Straight
      pathD = 'M 50,85 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      break;

    case 1: // Sharp L-Bend (Right-angle corner, exiting centered!)
      pathD = 'M 25,80 L 50,80 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <circle cx="25" cy="80" r="4.5" className="fill-current opacity-80" />
      );
      break;

    case 2: // S-Shape / Double-Bend Zig-Zag (Perfect classic blocky S-shape: centered & symmetric!)
      pathD = 'M 50,80 L 25,80 L 25,50 L 75,50 L 75,20 L 50,20 L 50,12';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          <circle cx="50" cy="80" r="4.5" className="fill-current opacity-90" />
          {/* S-shape helper guidance dots indicating clear flow direction from bottom to top */}
          <circle cx="25" cy="65" r="3" className="fill-current opacity-40" />
          <circle cx="50" cy="50" r="3.5" className="fill-current opacity-70" />
          <circle cx="75" cy="35" r="3" className="fill-current opacity-40" />
        </>
      );
      break;

    case 3: // Spiral Maze (winding in on itself, exiting centered!)
      pathD = 'M 75,80 L 75,45 L 25,45 L 25,70 L 50,70 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          <circle cx="75" cy="80" r="4.5" className="fill-current opacity-80" />
          <circle cx="75" cy="45" r="2.5" className="fill-current opacity-40" />
          <circle cx="25" cy="45" r="2.5" className="fill-current opacity-40" />
          <circle cx="25" cy="70" r="2.5" className="fill-current opacity-40" />
          <circle cx="50" cy="70" r="2.5" className="fill-current opacity-40" />
        </>
      );
      break;

    case 4: // T-Branch with a dead-end decoy!
      pathD = 'M 25,80 L 25,50 L 50,50 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          {/* Decoy path */}
          <path d="M 50,50 L 75,50" strokeWidth={strokeWidth} strokeLinecap="square" className="stroke-current opacity-50" />
          {/* Decoy T-bar cap */}
          <line x1="75" y1="42" x2="75" y2="58" strokeWidth={parseFloat(strokeWidth) * 0.7} className="stroke-current opacity-70" />
          <circle cx="25" cy="80" r="4.5" className="fill-current opacity-80" />
          <circle cx="25" cy="50" r="3" className="fill-current opacity-50" />
        </>
      );
      break;

    case 5: // Soft Curved Wave (Fluid ribbon, centered!)
      pathD = 'M 50,82 C 20,70 80,45 50,22';
      arrowheadD = 'M 40,24 C 45,20 48,15 50,10 C 52,15 55,20 60,24 C 54,23 46,23 40,24 Z';
      break;

    case 6: // Circuit Grid loop (exiting centered!)
      pathD = 'M 30,80 L 30,50 L 70,50 L 70,30 L 50,30 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          <circle cx="30" cy="80" r="4.5" className="fill-current opacity-80" />
          <circle cx="70" cy="50" r="5" className="stroke-current fill-none" strokeWidth="2" />
          <circle cx="70" cy="50" r="2" className="fill-current" />
          <circle cx="50" cy="30" r="5" className="stroke-current fill-none" strokeWidth="2" />
          <circle cx="50" cy="30" r="2" className="fill-current" />
        </>
      );
      break;

    case 7: // Loop-the-Loop / U-Turn Hook (exiting centered!)
      pathD = 'M 30,80 L 30,35 L 70,35 L 70,58 L 50,58 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          <circle cx="30" cy="80" r="4.5" className="fill-current opacity-80" />
          <circle cx="30" cy="35" r="3" className="fill-current opacity-50" />
          <circle cx="70" cy="35" r="3" className="fill-current opacity-50" />
          <circle cx="70" cy="58" r="3" className="fill-current opacity-50" />
          <circle cx="50" cy="58" r="3" className="fill-current opacity-50" />
        </>
      );
      break;

    case 8: // Smooth S-Shape curve (Perfect S-curve: centered, smooth & extremely clear direction of flow)
      pathD = 'M 50,82 C 15,82 15,52 50,52 C 85,52 85,22 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          <circle cx="50" cy="82" r="5.5" className="fill-current opacity-90" />
          {/* Dynamic flowing arrows alongside the curve for ultimate clarity on active sides */}
          <circle cx="32" cy="67" r="3.5" className="fill-current opacity-60" />
          <circle cx="50" cy="52" r="4" className="fill-current opacity-80 animate-pulse" />
          <circle cx="68" cy="37" r="3.5" className="fill-current opacity-60" />
        </>
      );
      break;

    case 9: // Y-Fork Split (Unique forked maze arrow with dead end!)
      pathD = 'M 50,80 L 50,50 L 30,30 L 30,22';
      arrowheadD = 'M 20,24 L 30,10 L 40,24 Z';
      extraElements = (
        <>
          {/* Decoy right branch with a cross bar dead-end */}
          <path d="M 50,50 L 70,30" strokeWidth={strokeWidth} strokeLinecap="round" className="stroke-current opacity-40" />
          <line x1="63" y1="23" x2="77" y2="37" strokeWidth="4" className="stroke-current opacity-60" />
          <circle cx="50" cy="80" r="4" className="fill-current opacity-80" />
        </>
      );
      break;

    case 10: // Helix S-Shape (Double helix twist, looks like infinity loop)
      pathD = 'M 50,82 C 75,72 75,60 50,60 C 25,60 25,48 50,36 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          <circle cx="50" cy="82" r="4.5" className="fill-current opacity-80" />
          <circle cx="62" cy="71" r="2.5" className="fill-current opacity-30" />
          <circle cx="38" cy="49" r="2.5" className="fill-current opacity-30" />
        </>
      );
      break;

    case 11: // Omega Key Portal (A loop in the middle)
      pathD = 'M 50,82 L 50,64 C 32,64 32,40 50,40 C 68,40 68,64 50,64 M 50,40 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      extraElements = (
        <>
          <circle cx="50" cy="82" r="4.5" className="fill-current opacity-80" />
          <circle cx="50" cy="64" r="3" className="fill-current opacity-45" />
          <circle cx="50" cy="40" r="3" className="fill-current opacity-45" />
        </>
      );
      break;

    default: // Backup straight arrow
      pathD = 'M 50,85 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      break;
  }

  // Customize look based on Theme
  let pathStroke = 'currentColor';
  let pathFill = 'none';
  let gClassName = '';
  let svgStyle: React.CSSProperties = {};

  if (theme === 'MAZE_CLASSIC') {
    // Rich classical outline just like the black ink pathways in the user's reference image
    gClassName = 'text-slate-900 dark:text-slate-100';
    svgStyle = {
      filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.15))',
    };
  } else if (theme === 'NEON_CIRCUIT') {
    // Cyber circuit tracks with glowing neon vibes
    gClassName = 'text-cyan-400 dark:text-cyan-300';
    svgStyle = {
      filter: 'drop-shadow(0 0 4px currentColor)',
    };
  } else if (theme === 'ORGANIC_WAVE') {
    // Soft flowing natural design
    gClassName = 'text-emerald-500 dark:text-emerald-400';
  } else if (theme === 'STEALTH_TECH') {
    // Double lines & hard-edged chevrons
    gClassName = 'text-amber-400 dark:text-amber-400';
    svgStyle = {
      filter: 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.5))',
    };
  } else if (theme === 'RETRO_PIXEL') {
    // Blocky dotted feel
    gClassName = 'text-rose-500 dark:text-rose-400';
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full select-none"
      style={svgStyle}
    >
      <g
        transform={`rotate(${rotation}, 50, 50)`}
        className={`${gClassName} transition-colors duration-300`}
      >
        {/* Render Background glow in neon themes */}
        {theme === 'NEON_CIRCUIT' && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={parseFloat(strokeWidth) * 2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-20 blur-[3px]"
          />
        )}

        {/* Dynamic styling for Retro Pixel dotted path */}
        <path
          d={pathD}
          fill={pathFill}
          stroke={theme === 'NEON_CIRCUIT' ? 'white' : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={theme === 'RETRO_PIXEL' ? '5 4' : undefined}
        />

        {/* Arrowhead */}
        <path
          d={arrowheadD}
          fill={color}
          stroke={theme === 'MAZE_CLASSIC' ? 'rgba(0,0,0,0.2)' : 'none'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Custom Extra Elements */}
        {extraElements && (
          <g style={{ color }}>
            {extraElements}
          </g>
        )}
      </g>
    </svg>
  );
}
