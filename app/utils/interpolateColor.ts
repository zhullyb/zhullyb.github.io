interface RGB {
	r: number
	g: number
	b: number
}

function interpolateColor(color1: string, color2: string, factor: number): string {
	if (factor === 0) return color1
	if (factor === 1) return color2

	const c1 = hexToRgb(color1)
	const c2 = hexToRgb(color2)

	if (!c1 || !c2) {
		throw new Error('Invalid color format')
	}

	const r = Math.round(c1.r + factor * (c2.r - c1.r))
	const g = Math.round(c1.g + factor * (c2.g - c1.g))
	const b = Math.round(c1.b + factor * (c2.b - c1.b))

	return rgbToHex(r, g, b)
}

function hexToRgb(hex: string): RGB | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? {
				r: parseInt(result[1]!, 16),
				g: parseInt(result[2]!, 16),
				b: parseInt(result[3]!, 16)
			}
		: null
}

function rgbToHex(r: number, g: number, b: number): string {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export default interpolateColor
