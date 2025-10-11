/** @jsxImportSource hastscript */
import { type Result } from 'hastscript';
import opentype from "opentype.js"

export const textToSVGPaths = async (
    text: string,
    fontUrl: string,
    fontSize = 72,
    size: { width: number, height: number },
    lineHeight = 1.2
) => {
    const font = await opentype.load(fontUrl)
    const lines = text.split(/\r?\n/)
    const paths: Result[] = []

    let y = fontSize // baseline for first line

    for (const line of lines) {
        if (!line.trim()) {
            y += fontSize * lineHeight
            continue
        }

        const path = font.getPath(line, 0, y, fontSize)
        const d = path.toPathData(1)
        paths.push(<path key={y} d={d} />)

        y += fontSize * lineHeight
    }

    const totalHeight = Math.max(size.height, lines.length * fontSize * lineHeight)

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size.width}
            height={totalHeight}
            fill="currentColor"
            viewBox={`0 0 ${size.width} ${totalHeight}`}
        >
            {paths}
        </svg>
    )
}