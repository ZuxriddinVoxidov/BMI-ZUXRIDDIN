'use client'

import { getPointsToNextLevel, getProgressToNextLevel, LEVELS, type StudentLevel } from '@/lib/levels'
import { motion } from 'framer-motion'

// Seedling SVG (0-29 points)
function Seedling() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      {/* Soil */}
      <ellipse cx="100" cy="170" rx="60" ry="12" fill="#92400E" opacity="0.3" />
      <ellipse cx="100" cy="168" rx="50" ry="8" fill="#78350F" />
      {/* Stem */}
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ originX: '100px', originY: '168px' }}
      >
        <path d="M100 168 Q100 140 98 120" stroke="#86EFAC" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Left leaf */}
        <motion.g
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.1 }}
          style={{ originX: '95px', originY: '135px' }}
        >
          <path d="M98 135 Q82 125 85 110 Q95 118 98 135" fill="#86EFAC" />
        </motion.g>
        {/* Right leaf */}
        <motion.g
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
          style={{ originX: '105px', originY: '128px' }}
        >
          <path d="M99 128 Q115 118 118 105 Q108 112 99 128" fill="#4ADE80" />
        </motion.g>
      </motion.g>
    </svg>
  )
}

// Sapling SVG (30-69 points)
function Sapling() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      <ellipse cx="100" cy="175" rx="65" ry="12" fill="#92400E" opacity="0.3" />
      <ellipse cx="100" cy="173" rx="55" ry="8" fill="#78350F" />
      <motion.g
        animate={{ rotate: [-1.5, 1.5, -1.5] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        style={{ originX: '100px', originY: '173px' }}
      >
        {/* Trunk */}
        <path d="M100 173 Q99 140 98 95" stroke="#92400E" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Left branch */}
        <path d="M99 120 Q85 110 78 100" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Right branch */}
        <path d="M99 105 Q115 95 120 88" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Crown */}
        <motion.circle cx="98" cy="80" r="25" fill="#4ADE80" opacity="0.8"
          animate={{ scale: [0.97, 1.03, 0.97] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
        {/* Leaves */}
        {[
          { cx: 80, cy: 75, delay: 0.1 },
          { cx: 115, cy: 78, delay: 0.2 },
          { cx: 95, cy: 62, delay: 0.3 },
          { cx: 105, cy: 90, delay: 0.15 },
          { cx: 75, cy: 90, delay: 0.25 },
        ].map((leaf, i) => (
          <motion.circle
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            r="10"
            fill="#86EFAC"
            opacity="0.7"
            animate={{ scale: [0.95, 1.05, 0.95], rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: leaf.delay }}
          />
        ))}
      </motion.g>
    </svg>
  )
}

// Young Tree SVG (70-129 points)
function YoungTree() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      <ellipse cx="100" cy="178" rx="70" ry="12" fill="#92400E" opacity="0.3" />
      <ellipse cx="100" cy="176" rx="60" ry="8" fill="#78350F" />
      <motion.g
        animate={{ rotate: [-1, 1, -1] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{ originX: '100px', originY: '176px' }}
      >
        {/* Trunk */}
        <path d="M100 176 Q99 140 97 75" stroke="#78350F" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* Branches */}
        <path d="M98 130 Q75 115 65 105" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M98 110 Q120 100 130 90" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M97 90 Q80 80 70 72" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Main crown */}
        <motion.ellipse cx="97" cy="65" rx="38" ry="30" fill="#22C55E" opacity="0.7"
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        />
        {/* Leaf clusters */}
        {[
          { cx: 65, cy: 60, r: 15, delay: 0 },
          { cx: 130, cy: 62, r: 14, delay: 0.15 },
          { cx: 97, cy: 42, r: 16, delay: 0.1 },
          { cx: 78, cy: 48, r: 12, delay: 0.2 },
          { cx: 118, cy: 50, r: 13, delay: 0.25 },
          { cx: 60, cy: 100, r: 12, delay: 0.3 },
          { cx: 135, cy: 85, r: 11, delay: 0.35 },
          { cx: 85, cy: 75, r: 10, delay: 0.12 },
          { cx: 110, cy: 72, r: 11, delay: 0.22 },
          { cx: 70, cy: 80, r: 9, delay: 0.18 },
        ].map((leaf, i) => (
          <motion.circle
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            r={leaf.r}
            fill={i % 2 === 0 ? '#4ADE80' : '#86EFAC'}
            opacity="0.6"
            animate={{ scale: [0.95, 1.05, 0.95], rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 2.5 + i * 0.1, ease: 'easeInOut', delay: leaf.delay }}
          />
        ))}
      </motion.g>
    </svg>
  )
}

// Mature Tree SVG (130+ points)
function MatureTree() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      {/* Golden glow */}
      <motion.circle
        cx="100" cy="70" r="55" fill="url(#goldenGlow)" opacity="0.3"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.98, 1.04, 0.98] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      />
      <defs>
        <radialGradient id="goldenGlow">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="180" rx="75" ry="12" fill="#92400E" opacity="0.3" />
      <ellipse cx="100" cy="178" rx="65" ry="9" fill="#78350F" />
      <motion.g
        animate={{ rotate: [-0.8, 0.8, -0.8] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        style={{ originX: '100px', originY: '178px' }}
      >
        {/* Thick trunk */}
        <path d="M100 178 Q98 140 95 65" stroke="#78350F" strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* Major branches */}
        <path d="M97 140 Q70 120 55 110" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M98 120 Q130 105 140 95" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M96 100 Q65 85 55 78" stroke="#78350F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M96 85 Q125 72 135 65" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Large crown */}
        <motion.ellipse cx="95" cy="55" rx="50" ry="38" fill="#16A34A" opacity="0.65"
          animate={{ scale: [0.99, 1.01, 0.99] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />
        {/* Dense leaf clusters */}
        {[
          { cx: 50, cy: 50, r: 18 }, { cx: 140, cy: 55, r: 17 },
          { cx: 95, cy: 28, r: 20 }, { cx: 70, cy: 38, r: 16 },
          { cx: 120, cy: 40, r: 17 }, { cx: 55, cy: 75, r: 14 },
          { cx: 135, cy: 78, r: 13 }, { cx: 80, cy: 60, r: 15 },
          { cx: 110, cy: 58, r: 14 }, { cx: 60, cy: 95, r: 13 },
          { cx: 140, cy: 90, r: 12 }, { cx: 95, cy: 45, r: 13 },
          { cx: 75, cy: 25, r: 11 }, { cx: 115, cy: 30, r: 12 },
        ].map((leaf, i) => (
          <motion.circle
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            r={leaf.r}
            fill={i % 3 === 0 ? '#16A34A' : i % 3 === 1 ? '#22C55E' : '#4ADE80'}
            opacity="0.55"
            animate={{ scale: [0.95, 1.05, 0.95], rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2.5 + i * 0.08, ease: 'easeInOut', delay: i * 0.08 }}
          />
        ))}
      </motion.g>
    </svg>
  )
}

// Tree component to select correct stage
function TreeSVG({ stage }: { stage: string }) {
  switch (stage) {
    case 'seedling': return <Seedling />
    case 'sapling': return <Sapling />
    case 'young': return <YoungTree />
    case 'mature': return <MatureTree />
    default: return <Seedling />
  }
}

export default function GrowingTree({ points, level }: { points: number; level: StudentLevel }) {
  const progress = getProgressToNextLevel(points)
  const pointsNeeded = getPointsToNextLevel(points)
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1)

  return (
    <div
      className="relative rounded-3xl p-8 flex flex-col items-center"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* Tree */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        className="mb-4"
      >
        <TreeSVG stage={level.treeStage} />
      </motion.div>

      {/* Level Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full mb-4"
        style={{ backgroundColor: level.bgColor, color: level.textColor }}
      >
        <span className="text-lg">{level.emoji}</span>
        <span className="font-bold text-sm">{level.nameUz}</span>
      </motion.div>

      {/* Points Display */}
      <p className="text-2xl font-extrabold text-gray-900 mb-1">
        {points}{' '}
        <span className="text-base font-normal text-gray-400">
          / {level.level === 4 ? '∞' : level.maxPoints + 1} ball
        </span>
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mt-3 mb-2">
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            className="h-full rounded-full"
            style={{ backgroundColor: level.color }}
          />
        </div>
      </div>

      {/* Next Level Info */}
      {nextLevel ? (
        <p className="text-xs text-gray-500 text-center">
          Keyingi daraja: <span className="font-semibold">{nextLevel.emoji} {nextLevel.nameUz}</span>
          {' — '}<span className="font-bold text-gray-700">{pointsNeeded} ball</span> kerak
        </p>
      ) : (
        <p className="text-xs font-semibold text-emerald-600">
          🎉 Eng yuqori darajaga yetdingiz!
        </p>
      )}
    </div>
  )
}
