export interface StudentLevel {
  level: 1 | 2 | 3 | 4
  name: string
  nameUz: string
  minPoints: number
  maxPoints: number
  color: string
  bgColor: string
  textColor: string
  description: string
  treeStage: 'seedling' | 'sapling' | 'young' | 'mature'
  emoji: string
}

export const LEVELS: StudentLevel[] = [
  {
    level: 1,
    name: 'Nihol',
    nameUz: 'Nihol',
    minPoints: 0,
    maxPoints: 29,
    color: '#86EFAC',
    bgColor: '#F0FDF4',
    textColor: '#16A34A',
    description: "Yangi boshlagan o'quvchi",
    treeStage: 'seedling',
    emoji: '🌱',
  },
  {
    level: 2,
    name: 'Daraxtcha',
    nameUz: 'Daraxtcha',
    minPoints: 30,
    maxPoints: 69,
    color: '#4ADE80',
    bgColor: '#DCFCE7',
    textColor: '#15803D',
    description: "O'sib kelayotgan o'quvchi",
    treeStage: 'sapling',
    emoji: '🌿',
  },
  {
    level: 3,
    name: 'Navqiron',
    nameUz: 'Navqiron',
    minPoints: 70,
    maxPoints: 129,
    color: '#22C55E',
    bgColor: '#BBF7D0',
    textColor: '#166534',
    description: "Faol va mehnatsevar o'quvchi",
    treeStage: 'young',
    emoji: '🌳',
  },
  {
    level: 4,
    name: 'Yetuk',
    nameUz: 'Yetuk',
    minPoints: 130,
    maxPoints: Infinity,
    color: '#16A34A',
    bgColor: '#14532D',
    textColor: '#FFFFFF',
    description: "A'lo darajadagi o'quvchi",
    treeStage: 'mature',
    emoji: '🎋',
  },
]

export function getStudentLevel(points: number): StudentLevel {
  return (
    LEVELS.find((l) => points >= l.minPoints && points <= l.maxPoints) ||
    LEVELS[0]
  )
}

export function getProgressToNextLevel(points: number): number {
  const level = getStudentLevel(points)
  if (level.level === 4) return 100
  const range = level.maxPoints - level.minPoints + 1
  const progress = points - level.minPoints
  return Math.round((progress / range) * 100)
}

export function getPointsToNextLevel(points: number): number {
  const level = getStudentLevel(points)
  if (level.level === 4) return 0
  return level.maxPoints + 1 - points
}
