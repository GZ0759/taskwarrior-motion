// 项目色彩配置 — 从 design-tokens.md 精确提取

interface CardStyle {
  gradient: string
  glow: string
  accent: string
}

const CARD_STYLES: Record<string, CardStyle> = {
  'Design System': {
    gradient: 'linear-gradient(135deg, rgba(120,80,200,0.60) 0%, rgba(85,55,170,0.66) 100%)',
    glow: 'rgba(120,80,200,0.20)',
    accent: '#C4B5FD',
  },
  'API Migration': {
    gradient: 'linear-gradient(135deg, rgba(38,140,200,0.58) 0%, rgba(18,115,185,0.64) 100%)',
    glow: 'rgba(38,140,200,0.18)',
    accent: '#7DD3FC',
  },
  Marketing: {
    gradient: 'linear-gradient(135deg, rgba(205,75,145,0.58) 0%, rgba(180,50,105,0.64) 100%)',
    glow: 'rgba(205,75,145,0.18)',
    accent: '#F9A8D4',
  },
  'Q3 Planning': {
    gradient: 'linear-gradient(135deg, rgba(200,135,35,0.60) 0%, rgba(195,85,45,0.66) 100%)',
    glow: 'rgba(200,135,35,0.20)',
    accent: '#FCD34D',
  },
}

const FALLBACK: CardStyle[] = [
  {
    gradient: 'linear-gradient(135deg, rgba(95,90,200,0.58) 0%, rgba(70,65,175,0.64) 100%)',
    glow: 'rgba(95,90,200,0.18)',
    accent: '#A5B4FC',
  },
  {
    gradient: 'linear-gradient(135deg, rgba(28,170,120,0.58) 0%, rgba(15,145,100,0.64) 100%)',
    glow: 'rgba(28,170,120,0.18)',
    accent: '#6EE7B7',
  },
  {
    gradient: 'linear-gradient(135deg, rgba(220,90,40,0.58) 0%, rgba(195,65,30,0.64) 100%)',
    glow: 'rgba(220,90,40,0.18)',
    accent: '#FCA5A5',
  },
]

export function getCardStyle(project: string, index: number): CardStyle {
  return CARD_STYLES[project] ?? FALLBACK[index % FALLBACK.length]
}
