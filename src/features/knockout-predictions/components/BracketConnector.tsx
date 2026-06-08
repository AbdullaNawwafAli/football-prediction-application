type Props = {
  fromCount: number
  toCount: number
}

export function BracketConnector({ fromCount, toCount }: Props) {
  const paths: string[] = []

  for (let j = 1; j <= toCount; j++) {
    const topY = ((4 * j - 3) / (2 * fromCount)) * 100
    const botY = ((4 * j - 1) / (2 * fromCount)) * 100
    const midY = ((2 * j - 1) / (2 * toCount)) * 100

    paths.push(`M 0 ${topY} L 50 ${topY}`)
    paths.push(`M 50 ${topY} L 50 ${botY}`)
    paths.push(`M 0 ${botY} L 50 ${botY}`)
    paths.push(`M 50 ${midY} L 100 ${midY}`)
  }

  // stroke uses inline style so CSS variables resolve correctly (SVG attributes don't resolve them)
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-6 shrink-0 self-stretch"
      aria-hidden
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          style={{ stroke: 'hsl(var(--border))' }}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
