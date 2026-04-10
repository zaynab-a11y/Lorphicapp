import { NextRequest, NextResponse } from 'next/server'
import { dashboardStats, rankingsData, gscData, activityData } from '@/lib/mockData'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'full'

  try {
    // Dynamically import jsPDF to avoid SSR issues
    const { default: jsPDF } = await import('jspdf')
    // @ts-ignore
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()

    const teal = [20, 184, 166] as [number, number, number]
    const orange = [249, 115, 22] as [number, number, number]
    const dark = [15, 23, 42] as [number, number, number]
    const card = [30, 41, 59] as [number, number, number]
    const muted = [156, 163, 175] as [number, number, number]
    const white = [255, 255, 255] as [number, number, number]

    // Header background
    doc.setFillColor(...dark)
    doc.rect(0, 0, pageW, pageH, 'F')

    // Header bar
    doc.setFillColor(...teal)
    doc.rect(0, 0, pageW, 40, 'F')

    // Logo circle
    doc.setFillColor(...dark)
    doc.circle(20, 20, 10, 'F')
    doc.setTextColor(...white)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('L', 17.5, 23)

    // Title
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...white)
    doc.text('Lorphic SEO Dashboard', 36, 16)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Report  •  Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      36,
      26
    )

    let y = 52

    // ── Summary Stats ──────────────────────────────────
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...teal)
    doc.text('Performance Summary', 14, y)
    y += 8

    const stats = [
      { label: 'Total Clicks', value: dashboardStats.totalClicks.toLocaleString(), change: `+${dashboardStats.clicksChange}%` },
      { label: 'Impressions', value: dashboardStats.impressions.toLocaleString(), change: `+${dashboardStats.impressionsChange}%` },
      { label: 'CTR', value: `${dashboardStats.ctr}%`, change: `+${dashboardStats.ctrChange}%` },
      { label: 'Avg Position', value: String(dashboardStats.avgPosition), change: `${dashboardStats.positionChange}` },
    ]

    const boxW = (pageW - 28 - 12) / 4
    stats.forEach((s, i) => {
      const x = 14 + i * (boxW + 4)
      doc.setFillColor(...card)
      doc.roundedRect(x, y, boxW, 22, 3, 3, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...muted)
      doc.text(s.label, x + 4, y + 7)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...white)
      doc.text(s.value, x + 4, y + 15)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...teal)
      doc.text(s.change, x + 4, y + 20)
    })

    y += 30

    // ── Rankings Table ──────────────────────────────────
    if (type === 'full' || type === 'rankings') {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...teal)
      doc.text('Keyword Rankings', 14, y)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Keyword', 'Position', 'Change', 'Volume', 'Difficulty']],
        body: rankingsData.slice(0, 10).map((r) => {
          const change = r.prevPosition - r.position
          return [
            r.keyword,
            `#${r.position}`,
            change > 0 ? `↑${change}` : change < 0 ? `↓${Math.abs(change)}` : '—',
            r.volume.toLocaleString(),
            `${r.difficulty}/100`,
          ]
        }),
        theme: 'grid',
        headStyles: { fillColor: teal, textColor: white, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fillColor: card, textColor: white, fontSize: 8 },
        alternateRowStyles: { fillColor: [22, 35, 53] as [number, number, number] },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      })

      y = (doc as any).lastAutoTable.finalY + 12
    }

    // ── GSC Top Queries ──────────────────────────────────
    if (type === 'full' || type === 'traffic') {
      if (y > pageH - 80) {
        doc.addPage()
        doc.setFillColor(...dark)
        doc.rect(0, 0, pageW, pageH, 'F')
        y = 20
      }

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...teal)
      doc.text('Top Search Queries', 14, y)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Query', 'Clicks', 'Impressions', 'CTR', 'Position']],
        body: gscData.topQueries.slice(0, 8).map((q) => [
          q.query,
          q.clicks.toLocaleString(),
          q.impressions.toLocaleString(),
          `${q.ctr}%`,
          q.position.toFixed(1),
        ]),
        theme: 'grid',
        headStyles: { fillColor: orange, textColor: white, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fillColor: card, textColor: white, fontSize: 8 },
        alternateRowStyles: { fillColor: [22, 35, 53] as [number, number, number] },
        columnStyles: {
          0: { cellWidth: 75 },
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      })

      y = (doc as any).lastAutoTable.finalY + 12
    }

    // ── Activity Summary ──────────────────────────────────
    if (type === 'full') {
      if (y > pageH - 80) {
        doc.addPage()
        doc.setFillColor(...dark)
        doc.rect(0, 0, pageW, pageH, 'F')
        y = 20
      }

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...teal)
      doc.text('Recent Activity', 14, y)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Type', 'Title', 'Impact']],
        body: activityData.slice(0, 8).map((a) => [
          new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          a.type.charAt(0).toUpperCase() + a.type.slice(1),
          a.title,
          a.impact.charAt(0).toUpperCase() + a.impact.slice(1),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] as [number, number, number], textColor: white, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fillColor: card, textColor: white, fontSize: 8 },
        alternateRowStyles: { fillColor: [22, 35, 53] as [number, number, number] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 100 },
          3: { cellWidth: 25, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      })
    }

    // Footer on every page
    const totalPages = (doc as any).internal.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...muted)
      doc.text(
        `Lorphic Dashboard  •  Page ${p} of ${totalPages}  •  Confidential`,
        pageW / 2,
        pageH - 8,
        { align: 'center' }
      )
    }

    const pdfBytes = doc.output('arraybuffer')

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lorphic-${type}-report.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
