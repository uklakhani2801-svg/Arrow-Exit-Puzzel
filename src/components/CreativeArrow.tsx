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
  // Choose one of 8 templates based on the arrow's numeric ID
  const templateIndex = (arrowNumericId + levelNumber) % 8;

  // Rotation angle based on direction (we design templates facing UP and rotate them)
  let rotation = 0;
  if (dir === 'RIGHT') rotation = 90;
  else if (dir === 'DOWN') rotation = 180;
  else if (dir === 'LEFT') rotation = 270;

  // Let's define the path and arrowhead for each template (all pointing UP by default)
  let pathD = '';
  let arrowheadD = '';
  let extraElements: React.ReactNode = null;

  switch (templateIndex) {
    case 0: // Classic Straight
      pathD = 'M 50,85 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      break;

    case 1: // Sharp L-Bend (Right-angle corner, just like the uploaded image!)
      pathD = 'M 25,80 L 75,80 L 75,22';
      arrowheadD = 'M 65,24 L 75,10 L 85,24 Z';
      extraElements = (
        <circle cx="25" cy="80" r="4.5" className="fill-current opacity-80" />
      );
      break;

    case 2: // Zig-Zag / S-Shape maze line
      pathD = 'M 25,82 L 25,52 L 75,52 L 75,22';
      arrowheadD = 'M 65,24 L 75,10 L 85,24 Z';
      extraElements = (
        <>
          <circle cx="25" cy="82" r="4" className="fill-current opacity-60" />
          <circle cx="25" cy="52" r="2.5" className="fill-current opacity-30" />
          <circle cx="75" cy="52" r="2.5" className="fill-current opacity-30" />
        </>
      );
      break;

    case 3: // Spiral Maze (winding in on itself)
      pathD = 'M 80,82 L 80,50 L 35,50 L 35,68 L 55,68 L 55,22';
      arrowheadD = 'M 45,24 L 55,10 L 65,24 Z';
      extraElements = (
        <circle cx="80" cy="82" r="4" className="fill-current opacity-80" />
      );
      break;

    case 4: // T-Branch with a dead-end decoy!
      pathD = 'M 30,82 L 30,52 L 70,52 L 70,22';
      arrowheadD = 'M 60,24 L 70,10 L 80,24 Z';
      // Extra dead-end decoy line
      extraElements = (
        <>
          <path d="M 30,52 L 10,52" strokeWidth="8" strokeLinecap="round" className="stroke-current opacity-50" />
          <line x1="10" y1="46" x2="10" y2="58" strokeWidth="4" className="stroke-current opacity-75" />
          <circle cx="30" cy="82" r="4.5" className="fill-current opacity-80" />
        </>
      );
      break;

    case 5: // Soft Curved Wave (Fluid ribbon)
      pathD = 'M 50,82 C 20,70 80,45 50,22';
      arrowheadD = 'M 40,24 C 45,20 48,15 50,10 C 52,15 55,20 60,24 C 54,23 46,23 40,24 Z';
      break;

    case 6: // Circuit Grid loop
      pathD = 'M 35,82 L 35,58 L 65,58 L 65,34 L 35,34 L 35,22';
      arrowheadD = 'M 25,24 L 35,10 L 45,24 Z';
      extraElements = (
        <>
          <circle cx="65" cy="58" r="5" className="stroke-current fill-none" strokeWidth="2" />
          <circle cx="65" cy="58" r="2" className="fill-current" />
          <circle cx="35" cy="34" r="5" className="stroke-current fill-none" strokeWidth="2" />
          <circle cx="35" cy="34" r="2" className="fill-current" />
        </>
      );
      break;

    default: // Loop-the-Loop
      pathD = 'M 50,82 C 85,82 85,48 50,48 C 15,48 15,14 50,14 L 50,22';
      arrowheadD = 'M 40,24 L 50,10 L 60,24 Z';
      break;
  }

  // Adjust stroke width based on grid size for optimal clarity
  const isLargeGrid = difficulty === 'HARD' || difficulty === 'EXPERT';
  const strokeWidth = isLargeGrid ? '7' : '8.5';

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
