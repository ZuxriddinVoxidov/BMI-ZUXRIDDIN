'use client'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// ─── PDF Export ───────────────────────

export function exportAttendancePDF(data: {
  title: string
  teacherName: string
  clubName: string
  period: string
  rows: {
    name: string
    present: number
    absent: number
    excused: number
    total: number
    rate: string
  }[]
}) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.setTextColor(99, 102, 241)
  doc.text('IQRO', 14, 20)

  doc.setFontSize(13)
  doc.setTextColor(30, 30, 30)
  doc.text(data.title, 14, 30)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`O'qituvchi: ${data.teacherName}`, 14, 40)
  doc.text(`To'garak: ${data.clubName}`, 14, 47)
  doc.text(`Davr: ${data.period}`, 14, 54)
  doc.text(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`, 14, 61)

  // Table
  autoTable(doc, {
    startY: 70,
    head: [['O\'quvchi ismi', 'Kelgan', 'Kelmagan', 'Sababli', 'Jami', 'Davomat %']],
    body: data.rows.map(r => [r.name, r.present, r.absent, r.excused, r.total, r.rate + '%']),
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 10 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`IQRO tizimi | ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 10)
  }

  doc.save(`davomat_hisoboti_${Date.now()}.pdf`)
}

export function exportDirectorPDF(data: {
  schoolName: string
  period: string
  stats: { students: number; teachers: number; clubs: number; attendanceRate: number }
  teacherRows: { name: string; clubs: number; rewards: number; efficiency: string }[]
  topStudents: { name: string; points: number; level: string }[]
}) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setTextColor(99, 102, 241)
  doc.text('IQRO', 14, 20)

  doc.setFontSize(13)
  doc.setTextColor(30, 30, 30)
  doc.text('Direktor Hisoboti', 14, 30)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Maktab: ${data.schoolName}`, 14, 40)
  doc.text(`Davr: ${data.period}`, 14, 47)
  doc.text(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`, 14, 54)

  // Stats
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text('Umumiy statistika:', 14, 68)

  autoTable(doc, {
    startY: 73,
    head: [['Ko\'rsatkich', 'Qiymat']],
    body: [
      ['Jami o\'quvchilar', data.stats.students],
      ['O\'qituvchilar', data.stats.teachers],
      ['Faol to\'garaklar', data.stats.clubs],
      ['O\'rtacha davomat', data.stats.attendanceRate + '%'],
    ],
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    styles: { fontSize: 10 },
    tableWidth: 100,
  })

  // Teachers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teacherY = (doc as any).lastAutoTable.finalY + 15
  doc.text('O\'qituvchilar samaradorligi:', 14, teacherY)

  autoTable(doc, {
    startY: teacherY + 5,
    head: [["O'qituvchi", "To'garaklar", "Rag'batlar", 'Daraja']],
    body: data.teacherRows.map(t => [t.name, t.clubs, t.rewards, t.efficiency]),
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    styles: { fontSize: 10 },
  })

  // Top Students
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentsY = (doc as any).lastAutoTable.finalY + 15
  doc.text('Top 5 o\'quvchilar:', 14, studentsY)

  autoTable(doc, {
    startY: studentsY + 5,
    head: [['O\'quvchi', 'Ball', 'Daraja']],
    body: data.topStudents.map(s => [s.name, s.points, s.level]),
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    styles: { fontSize: 10 },
  })

  doc.save(`direktor_hisoboti_${Date.now()}.pdf`)
}

// ─── Excel Export ─────────────────────

export function exportAttendanceExcel(data: {
  clubName: string
  period: string
  rows: { name: string; present: number; absent: number; excused: number; total: number; rate: string }[]
}) {
  const wb = XLSX.utils.book_new()
  const wsData = [
    ['IQRO — Davomat Hisoboti'],
    [`To'garak: ${data.clubName}`],
    [`Davr: ${data.period}`],
    [`Sana: ${new Date().toLocaleDateString('uz-UZ')}`],
    [],
    ['O\'quvchi ismi', 'Kelgan (kun)', 'Kelmagan (kun)', 'Sababli (kun)', 'Jami (kun)', 'Davomat %'],
    ...data.rows.map(r => [r.name, r.present, r.absent, r.excused, r.total, r.rate + '%']),
  ]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Davomat')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `davomat_${Date.now()}.xlsx`)
}

export function exportDirectorExcel(data: {
  schoolName: string
  stats: { students: number; teachers: number; clubs: number; attendanceRate: number }
  teacherRows: { name: string; clubs: number; rewards: number; efficiency: string }[]
  topStudents: { name: string; points: number; level: string }[]
}) {
  const wb = XLSX.utils.book_new()

  // Stats sheet
  const statsData = [
    ['IQRO — Direktor Hisoboti'],
    [`Maktab: ${data.schoolName}`],
    [`Sana: ${new Date().toLocaleDateString('uz-UZ')}`],
    [],
    ['Ko\'rsatkich', 'Qiymat'],
    ['Jami o\'quvchilar', data.stats.students],
    ['O\'qituvchilar', data.stats.teachers],
    ['Faol to\'garaklar', data.stats.clubs],
    ['O\'rtacha davomat', data.stats.attendanceRate + '%'],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(statsData)
  ws1['!cols'] = [{ wch: 25 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Statistika')

  // Teachers sheet
  const teachersData = [
    ['O\'qituvchi', 'To\'garaklar', 'Rag\'batlar', 'Daraja'],
    ...data.teacherRows.map(t => [t.name, t.clubs, t.rewards, t.efficiency]),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(teachersData)
  ws2['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Oqituvchilar')

  // Top students sheet
  const studentsData = [
    ['O\'quvchi', 'Ball', 'Daraja'],
    ...data.topStudents.map(s => [s.name, s.points, s.level]),
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(studentsData)
  ws3['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Top Oquvchilar')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `direktor_hisoboti_${Date.now()}.xlsx`)
}
