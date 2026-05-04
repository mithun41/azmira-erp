import jsPDF from 'jspdf'

export function generateReceiptPDF({
  booking,
  receipt,
  plot,
  installment,
  customer,
}: any) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const PL = 16
  const PR = 16
  const CW = W - PL - PR

  const v = (val: any, fallback = '—') =>
    val !== null && val !== undefined && String(val).trim() !== '' ? String(val) : fallback

  const setF = (style: 'normal' | 'bold' = 'normal', size = 9.5) => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
  }

  const C = {
    primary: [3, 105, 161] as [number,number,number],
    dark:    [15, 23, 42]  as [number,number,number],
    mid:     [71, 85, 105] as [number,number,number],
    muted:   [148, 163, 184] as [number,number,number],
    white:   [255, 255, 255] as [number,number,number],
    green:   [21, 128, 61]  as [number,number,number],
    bg:      [248, 250, 252] as [number,number,number],
    border:  [226, 232, 240] as [number,number,number],
    lightblue: [186, 230, 253] as [number,number,number],
    lightgreen:[134, 239, 172] as [number,number,number],
    lightred:  [252, 165, 165] as [number,number,number],
  }

  const fillRect = (x:number, y:number, w:number, h:number, clr:[number,number,number]) => {
    doc.setFillColor(...clr); doc.setDrawColor(...clr)
    doc.roundedRect(x, y, w, h, 1.2, 1.2, 'F')
  }
  const hline = (y:number, clr=C.border, lw=0.2) => {
    doc.setDrawColor(...clr); doc.setLineWidth(lw); doc.line(PL, y, W-PR, y)
  }
  const blankLine = (x1:number, x2:number, y:number) => {
    doc.setDrawColor(...C.border); doc.setLineWidth(0.3); doc.line(x1, y, x2, y)
  }

  // ── Data ──────────────────────────────────────────────────
  const receiptNo   = v(receipt?.receipt_number)
  const receiptDate = v(receipt?.payment_date || receipt?.entry_date || booking?.booking_date)
  const custName    = v(receipt?.customer_name || customer?.full_name || booking?.customer)
  const custId      = v(receipt?.customer || customer?.id)
  const custPhone   = v(customer?.phone || booking?.customer_phone)
  const custEmail   = v(customer?.email)
  const projectName = v(plot?.project_name || booking?.project)
  const plotNo      = v(plot?.plot_number || booking?.plot)
  const plotType    = v(plot?.plot_type || 'Plot')
  const plotSize    = plot?.area ? `${plot.area} ${plot.area_unit || 'katha'}` : '—'
  const payFor      = v(receipt?.receipt_type_display || receipt?.receipt_type)
  const payAmount   = parseFloat(v(receipt?.amount, '0'))
  const payMode     = v(receipt?.payment_mode_display || receipt?.payment_mode, 'Cash')
  const sponsorId   = v(booking?.marketing_officer)
  const bookingCode = v(booking?.booking_code)
  const totalPrice  = parseFloat(v(booking?.total_price, '0'))
  const totalPaid   = parseFloat(v(booking?.total_paid,  '0'))
  const totalDue    = parseFloat(v(booking?.total_due,   '0'))
  const amountWords = numberToWords(totalPrice)

  let y = 0

  // ══════════════════════════════════════════════════════════
  // 1. HEADER
  // ══════════════════════════════════════════════════════════
  fillRect(0, 0, W, 26, C.primary)
  doc.setTextColor(...C.white); setF('bold', 15)
  doc.text('AZMIRA CONSTRUCTION LIMITED', W/2, 10, { align:'center' })
  setF('normal', 8); doc.setTextColor(...C.lightblue)
  doc.text('851/A, Purana Paltan Lane, Dhaka-1000   |   Tel: 01700-000000   |   www.azmira.com.bd', W/2, 16, { align:'center' })
  doc.setDrawColor(255,255,255); doc.setLineWidth(0.15); doc.line(PL, 19.5, W-PR, 19.5)
  setF('normal', 7.5); doc.setTextColor(...C.lightblue)
  doc.text(`Receipt No: ${receiptNo}`, PL, 23.5)
  doc.text(`Date: ${receiptDate}`, W-PR, 23.5, { align:'right' })
  y = 32

  // ══════════════════════════════════════════════════════════
  // 2. TITLE
  // ══════════════════════════════════════════════════════════
  setF('bold', 14); doc.setTextColor(...C.dark)
  doc.text('MONEY RECEIPT', W/2, y, { align:'center' })
  fillRect(W/2-28, y+2, 56, 0.8, C.primary)
  y += 11

  // ══════════════════════════════════════════════════════════
  // 3. INFO GRID
  // ══════════════════════════════════════════════════════════
  const L1 = PL          // left col x
  const L2 = W/2 + 4     // right col x
  const RH = 11          // row height

  const sectionHeader = (label: string, yy: number) => {
    fillRect(PL, yy, CW, 7, C.bg)
    setF('bold', 7.5); doc.setTextColor(...C.mid)
    doc.text(label, PL+2, yy+4.5)
    return yy + 9
  }

  const twoColRow = (
    l1: string, v1: string,
    l2: string, v2: string,
    yy: number
  ) => {
    setF('normal', 7.5); doc.setTextColor(...C.muted)
    doc.text(l1, L1, yy)
    doc.text(l2, L2, yy)
    setF('bold', 9.5); doc.setTextColor(...C.dark)
    doc.text(v1, L1, yy+5)
    doc.text(v2, L2, yy+5)
    doc.setDrawColor(...C.border); doc.setLineWidth(0.15)
    doc.line(PL, yy+8, W-PR, yy+8)
    return yy + RH
  }

  // Customer | Property
  y = sectionHeader('CUSTOMER INFORMATION                                                        PROPERTY INFORMATION', y)
  y = twoColRow('Customer Name', custName,    'Project',       projectName, y)
  y = twoColRow('Customer ID',   custId,      'Plot / Unit',   plotNo,      y)
  y = twoColRow('Contact Number',custPhone,   'Property Type', plotType,    y)
  y = twoColRow('E-mail',        custEmail,   'Property Size', plotSize,    y)
  y = twoColRow('Sponsor / Agent ID', sponsorId, 'Booking Code', bookingCode, y)
  y += 3

  // ══════════════════════════════════════════════════════════
  // 4. PAYMENT DETAILS
  // ══════════════════════════════════════════════════════════
  y = sectionHeader('PAYMENT DETAILS', y)

  // Payment For + Amount side by side
  setF('normal', 7.5); doc.setTextColor(...C.muted)
  doc.text('Payment For', L1, y)
  doc.text('Payment Amount', L2, y)
  y += 5
  setF('bold', 10); doc.setTextColor(...C.dark)
  doc.text(payFor, L1, y)
  // green amount badge
  fillRect(L2-1, y-6, 64, 8, [240, 253, 244])
  doc.setTextColor(...C.green); setF('bold', 10.5)
  doc.text(`BDT ${payAmount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`, L2+1, y)
  doc.setDrawColor(...C.border); doc.setLineWidth(0.15); doc.line(PL, y+2, W-PR, y+2)
  y += 7

  // Amount in Words
  setF('normal', 7.5); doc.setTextColor(...C.muted)
  doc.text('Amount in Words (BDT)', L1, y)
  y += 5
  setF('bold', 9.5); doc.setTextColor(...C.dark)
  doc.text(amountWords, L1, y)
  doc.setDrawColor(...C.border); doc.setLineWidth(0.15); doc.line(PL, y+2, W-PR, y+2)
  y += 7

  // Payment Mode
  setF('normal', 7.5); doc.setTextColor(...C.muted)
  doc.text('Payment Received Method', L1, y)
  if (installment) doc.text('Installment', L2, y)
  y += 5
  // badge
  fillRect(L1, y-5.5, 22, 7, C.primary)
  doc.setTextColor(...C.white); setF('bold', 8)
  doc.text(payMode.toUpperCase(), L1+11, y-1.2, { align:'center' })
  if (installment) {
    doc.setTextColor(...C.dark); setF('bold', 9)
    doc.text(`#${installment.installment_number}   Due: ${installment.due_date}`, L2, y)
  }
  y += 7

  // ══════════════════════════════════════════════════════════
  // 5. SUMMARY BAND
  // ══════════════════════════════════════════════════════════
  y += 4
  const SH = 22
  fillRect(PL, y, CW, SH, C.dark)
  const col3W = CW / 3
  const sumItems = [
    { label: 'TOTAL PRICE', val: totalPrice, clr: C.lightblue   },
    { label: 'TOTAL PAID',  val: totalPaid,  clr: C.lightgreen  },
    { label: 'TOTAL DUE',   val: totalDue,   clr: C.lightred    },
  ]
  sumItems.forEach((s, i) => {
    const sx = PL + i * col3W + col3W / 2
    if (i > 0) {
      doc.setDrawColor(71,85,105); doc.setLineWidth(0.2)
      doc.line(PL + i*col3W, y+2, PL + i*col3W, y+SH-2)
    }
    doc.setTextColor(...s.clr); setF('bold', 7)
    doc.text(s.label, sx, y+7.5, { align:'center' })
    setF('bold', 12)
    doc.text(`BDT ${s.val.toLocaleString('en-BD')}`, sx, y+16.5, { align:'center' })
  })
  y += SH + 8

  // ══════════════════════════════════════════════════════════
  // 6. DEPOSITOR SECTION
  // ══════════════════════════════════════════════════════════
  y = sectionHeader('DEPOSITOR INFORMATION', y)

  // Depositor Name (left) + Depositor Contact (right)
  setF('normal', 7.5); doc.setTextColor(...C.muted)
  doc.text('Depositor Name', L1, y)
  doc.text('Depositor Contact No', L2, y)
  y += 5
  blankLine(L1, L1+75, y)
  blankLine(L2, L2+68, y)
  y += 7

  // Depositor Signature (left) + Remarks (right)
  setF('normal', 7.5); doc.setTextColor(...C.muted)
  doc.text('Depositor Signature', L1, y)
  doc.text('Remarks', L2, y)
  y += 5
  blankLine(L1, L1+60, y)
  blankLine(L2, L2+68, y)
  y += 12

  // ══════════════════════════════════════════════════════════
  // 7. SIGNATURES
  // ══════════════════════════════════════════════════════════
  hline(y, C.border, 0.2); y += 8
  const sigItems = ['Received by', 'Accounts', 'Authorized']
  const sigW = CW / 3
  sigItems.forEach((s, i) => {
    const sx = PL + i * sigW + sigW / 2
    doc.setDrawColor(...C.dark); doc.setLineWidth(0.5)
    doc.line(sx - 22, y, sx + 22, y)
    setF('bold', 9); doc.setTextColor(...C.dark)
    doc.text(s, sx, y + 5.5, { align:'center' })
    setF('normal', 8); doc.setTextColor(...C.muted)
    doc.text('ID', sx, y + 10, { align:'center' })
  })
  y += 16

  // Print/Download + Agent ID
  setF('normal', 8); doc.setTextColor(...C.muted)
  doc.text('Print / Download', PL, y)
  doc.text(`Agent ID: ${sponsorId}`, W-PR, y, { align:'right' })
  y += 7

  // ══════════════════════════════════════════════════════════
  // 8. FOOTER
  // ══════════════════════════════════════════════════════════
  doc.setDrawColor(...C.primary); doc.setLineWidth(0.5); doc.line(PL, y, W-PR, y)
  y += 4
  setF('normal', 7); doc.setTextColor(...C.muted)
  doc.text(
    `System generated receipt  ·  Receipt No: ${receiptNo}  ·  Generated: ${new Date().toLocaleString('en-BD')}`,
    W/2, y, { align:'center' }
  )

  doc.save(`MoneyReceipt-${receiptNo}.pdf`)
}

// ── Number to Words (BDT) ─────────────────────────────────────
function numberToWords(n: number): string {
  if (!n || isNaN(n)) return 'Zero Taka Only'
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  const convert = (num: number): string => {
    if (num === 0) return ''
    if (num < 20)       return ones[num] + ' '
    if (num < 100)      return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '') + ' '
    if (num < 1000)     return ones[Math.floor(num/100)] + ' Hundred ' + convert(num%100)
    if (num < 100000)   return convert(Math.floor(num/1000)) + 'Thousand ' + convert(num%1000)
    if (num < 10000000) return convert(Math.floor(num/100000)) + 'Lakh ' + convert(num%100000)
    return convert(Math.floor(num/10000000)) + 'Crore ' + convert(num%10000000)
  }
  const ip = Math.floor(n)
  const dp = Math.round((n - ip) * 100)
  let r = convert(ip).trim() + ' Taka'
  if (dp > 0) r += ' and ' + convert(dp).trim() + ' Paisa'
  return r + ' Only'
}