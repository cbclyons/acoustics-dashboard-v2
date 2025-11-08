/**
 * Export utilities for charts, data, and images
 */

/**
 * Export data to CSV file
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Handle strings with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

/**
 * Export chart as PNG image
 * Requires a ref to the chart SVG element
 */
export async function exportChartAsPNG(
  svgElement: SVGSVGElement,
  filename: string,
  backgroundColor = '#ffffff'
): Promise<void> {
  try {
    // Get SVG dimensions
    const svgRect = svgElement.getBoundingClientRect()
    const svgData = new XMLSerializer().serializeToString(svgElement)

    // Create canvas
    const canvas = document.createElement('canvas')
    const scale = 2 // Higher resolution
    canvas.width = svgRect.width * scale
    canvas.height = svgRect.height * scale

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Create image from SVG
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        resolve()
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load SVG image'))
      }
      img.src = url
    })

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, filename)
      }
    }, 'image/png')
  } catch (error) {
    console.error('Failed to export chart as PNG:', error)
    throw error
  }
}

/**
 * Export canvas (3D view) as PNG image
 */
export function exportCanvasAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, filename)
    }
  }, 'image/png')
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return `${prefix}_${timestamp}.${extension}`
}
