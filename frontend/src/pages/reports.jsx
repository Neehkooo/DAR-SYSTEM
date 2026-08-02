import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MdPrint, MdClose, MdFilterList, MdCheck, MdTrendingUp, MdInsertDriveFile, MdAttachMoney } from 'react-icons/md'
import darLogo from '../assets/Department_of_Agrarian_Reform_(DAR).svg.png'
import bagongPilipinasLogo from '../assets/Header_Footer/Bagong_Pilipinas_logo.png'
import { fetchDocuments } from '../utils/supabaseServices'

const colors = {
  noa: '#0B6623',
  direct: '#F59E0B',
  svp: '#3B82F6',
  lov: '#8B5CF6',
  split: '#EF4444'
}

/* ─────────────────────────────────────────────
   Official Header
───────────────────────────────────────────── */
const OfficialHeader = () => (
  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid black', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <img src={darLogo} alt="DAR Logo" style={{ height: '85px', width: 'auto' }} />
      <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
        <span style={{ fontSize: '9pt', fontWeight: '400', color: '#666', lineHeight: 1.1 }}>REPUBLIC OF THE PHILIPPINES</span>
        <span style={{ fontSize: '15pt', fontWeight: '900', color: '#666', lineHeight: 1.1 }}>DEPARTMENT OF AGRARIAN REFORM</span>
        <span style={{ fontSize: '10pt', fontWeight: '700', color: '#666', lineHeight: 1.1 }}>Regional Office I</span>
        <span style={{ fontSize: '10pt', fontWeight: 'bold', color: '#9cb176', lineHeight: 1.1 }}>Tunay na Pagbabago sa Repormang Agraryo</span>
      </div>
    </div>
    <img src={bagongPilipinasLogo} alt="Bagong Pilipinas" style={{ height: '80px', width: 'auto' }} />
  </div>
)

/* ─────────────────────────────────────────────
   Official Footer
───────────────────────────────────────────── */
const OfficialFooter = () => (
  <div style={{ width: '100%', marginTop: 'auto', paddingTop: '6px', borderTop: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: 'Arial, sans-serif', fontSize: '8pt', color: '#000', lineHeight: 1.2, flexShrink: 0 }}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontWeight: '700' }}>DAR REGIONAL OFFICE I</span>
      <span>Northgate Square, Añes Building, Carlatan, City of San Fernando, La Union</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
      <span>TELEPHONE: (072) 700-5770</span>
      <span>E-MAIL: darrorecords@yahoo.com</span>
    </div>
  </div>
)

const monthsList = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
]

const Reports = () => {
  const [noaList, setNoaList] = useState([])
  const [ntpList, setNtpList] = useState([])
  const [resoList, setResoList] = useState([])
  const [resoSVPList, setResoSVPList] = useState([])
  const [resoLOVList, setResoLOVList] = useState([])
  const [resoEmergencySplitList, setResoEmergencySplitList] = useState([])

  // Filter States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2026')
  const [selectedMonths, setSelectedMonths] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])

  // Modal Warning (replaces window.alert)
  const [popupWarning, setPopupWarning] = useState({ isOpen: false, title: '', message: '' })

  const fetchData = async () => {
    try {
      const endpoints = [
        { type: 'noa', setter: setNoaList },
        { type: 'ntp', setter: setNtpList },
        { type: 'reso', setter: setResoList },
        { type: 'reso_svp', setter: setResoSVPList },
        { type: 'reso_lov', setter: setResoLOVList },
        { type: 'reso_emergency_split', setter: setResoEmergencySplitList }
      ]

      await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const res = await fetchDocuments(endpoint.type, { notDeleted: true })
            if (!res.error) {
              endpoint.setter(res.data || [])
            } else {
              console.error(`Error loading ${endpoint.type}:`, res.error)
            }
          } catch (err) {
            console.error(`Error loading ${endpoint.type}:`, err)
          }
        })
      )
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Helper to parse dates
  const parseDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr)
  }

  // Total summary calculations
  const filterDocuments = (docs, dateField = 'doc_date') => {
    return docs.filter(doc => {
      const date = parseDate(doc[dateField] || doc.reso_date)
      if (!date) return false
      const yearMatch = date.getFullYear().toString() === selectedYear
      const monthMatch = selectedMonths.includes(date.getMonth())
      return yearMatch && monthMatch
    })
  }

  const filteredNOA = filterDocuments(noaList, 'doc_date')
  const filteredNTP = filterDocuments(ntpList, 'doc_date')
  const filteredDirect = filterDocuments(resoList, 'reso_date')
  const filteredSVP = filterDocuments(resoSVPList, 'reso_date')
  const filteredLOV = filterDocuments(resoLOVList, 'reso_date')
  const filteredSplit = filterDocuments(resoEmergencySplitList, 'reso_date')

  const totalCount = 
    filteredNOA.length + 
    filteredNTP.length + 
    filteredDirect.length + 
    filteredSVP.length + 
    filteredLOV.length + 
    filteredSplit.length

  const totalAwardAmount = 
    filteredNOA.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0) +
    filteredNTP.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0) +
    filteredDirect.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0) +
    filteredSVP.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0) +
    filteredLOV.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0) +
    filteredSplit.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0)

  // Chart Data Generation based on database or mock fallback
  const getChartData = () => {
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const hasData = noaList.length || ntpList.length || resoList.length || resoSVPList.length || resoLOVList.length || resoEmergencySplitList.length

    if (!hasData) {
      // Mock Fallback
      return [
        { name: 'Jan', 'NOA & NTP': 45, 'RESO Direct': 20, 'RESO SVP': 15, 'RESO LOV': 10, 'RESO Emergency Split': 5 },
        { name: 'Feb', 'NOA & NTP': 52, 'RESO Direct': 25, 'RESO SVP': 18, 'RESO LOV': 12, 'RESO Emergency Split': 8 },
        { name: 'Mar', 'NOA & NTP': 38, 'RESO Direct': 15, 'RESO SVP': 10, 'RESO LOV': 8, 'RESO Emergency Split': 4 },
        { name: 'Apr', 'NOA & NTP': 65, 'RESO Direct': 35, 'RESO SVP': 22, 'RESO LOV': 15, 'RESO Emergency Split': 10 },
        { name: 'May', 'NOA & NTP': 48, 'RESO Direct': 28, 'RESO SVP': 16, 'RESO LOV': 11, 'RESO Emergency Split': 6 },
        { name: 'Jun', 'NOA & NTP': 72, 'RESO Direct': 40, 'RESO SVP': 30, 'RESO LOV': 20, 'RESO Emergency Split': 15 },
      ]
    }

    return monthsShort.map((mShort, index) => {
      const filterByMonth = (docs, dateField = 'doc_date') => {
        return docs.filter(doc => {
          const date = parseDate(doc[dateField] || doc.reso_date)
          return date && date.getFullYear().toString() === selectedYear && date.getMonth() === index
        }).length
      }

      return {
        name: mShort,
        'NOA & NTP': filterByMonth(noaList, 'doc_date') + filterByMonth(ntpList, 'doc_date'),
        'RESO Direct': filterByMonth(resoList, 'reso_date'),
        'RESO SVP': filterByMonth(resoSVPList, 'reso_date'),
        'RESO LOV': filterByMonth(resoLOVList, 'reso_date'),
        'RESO Emergency Split': filterByMonth(resoEmergencySplitList, 'reso_date')
      }
    })
  }

  const handlePrint = () => {
    setIsFilterModalOpen(false)
    
    const printWindow = window.open('', '_blank', 'width=950,height=800')
    if (!printWindow) {
      setPopupWarning({
        isOpen: true,
        title: 'Pop-up Blocked',
        message: 'Please allow pop-ups to enable printing.'
      })
      return
    }

    const monthsStr = selectedMonths.map(m => monthsList[m].label).join(', ')
    
    // Construct individual records list
    let recordsHTML = ''
    
    const allRecords = [
      ...filteredNOA.map(d => ({ date: d.doc_date, type: 'NOA', name: d.name, activity: d.activity, amount: parseFloat(d.amount || 0) })),
      ...filteredNTP.map(d => ({ date: d.doc_date, type: 'NTP', name: d.name, activity: d.activity, amount: parseFloat(d.amount || 0) })),
      ...filteredDirect.map(d => ({ date: d.reso_date, type: 'RESO Direct', name: d.company_name, activity: d.purpose, amount: parseFloat(d.award_amount || 0) })),
      ...filteredSVP.map(d => ({ date: d.reso_date, type: 'RESO SVP', name: d.company_name, activity: d.purpose, amount: parseFloat(d.award_amount || 0) })),
      ...filteredLOV.map(d => ({ date: d.reso_date, type: 'RESO LOV', name: d.company_name, activity: d.purpose, amount: parseFloat(d.award_amount || 0) })),
      ...filteredSplit.map(d => ({ date: d.reso_date, type: 'RESO Split', name: d.company_name, activity: d.purpose, amount: parseFloat(d.award_amount || 0) }))
    ]

    // Sort chronologically by date
    allRecords.sort((a, b) => new Date(a.date) - new Date(b.date))

    if (allRecords.length === 0) {
      recordsHTML = `
        <tr>
          <td colspan="5" style="padding: 24px; text-align: center; color: #64748b; font-style: italic; border: 1px solid #e2e8f0;">
            No records generated within the selected timeframe.
          </td>
        </tr>
      `
    } else {
      allRecords.forEach(r => {
        recordsHTML += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${r.date}</td>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">${r.type}</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${r.name}</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${r.activity}</td>
            <td style="padding: 10px; text-align: right; font-family: monospace; border: 1px solid #e2e8f0;">
              ₱${r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        `
      })
    }

    const noaSum = filteredNOA.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    const ntpSum = filteredNTP.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    const directSum = filteredDirect.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0)
    const svpSum = filteredSVP.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0)
    const lovSum = filteredLOV.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0)
    const splitSum = filteredSplit.reduce((sum, d) => sum + parseFloat(d.award_amount || 0), 0)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Document Summary Report</title>
        <style>
          @page { size: letter portrait; margin: 0; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { margin: 0; padding: 0; background: white; font-family: Arial, sans-serif; font-size: 10pt; color: #1e293b; }
          .print-page { width: 8.5in; min-height: 11in; padding: 0.4in; display: flex; flex-direction: column; page-break-after: always; break-after: page; margin: 0 auto; }
          .print-page:last-child { page-break-after: avoid; break-after: avoid; }
          
          .metrics-container { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 24px; margin-top: 15px; }
          .metric-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; }
          .metric-label { font-size: 8pt; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
          .metric-val { font-size: 18pt; font-weight: 900; color: #0B6623; margin: 5px 0 0 0; }
          .metric-val-dark { font-size: 18pt; font-weight: 900; color: #1e293b; margin: 5px 0 0 0; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8fafc; color: #475569; font-size: 8pt; font-weight: bold; text-transform: uppercase; padding: 10px; text-align: left; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; }
          
          .page-break-before { page-break-before: always; break-before: page; }
        </style>
      </head>
      <body>
        <div class="print-page">
          <!-- Official Header -->
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid black; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <img src="${darLogo}" alt="DAR Logo" style="height: 85px; width: auto;" />
              <div style="display: flex; flex-direction: column; font-family: Arial, sans-serif;">
                <span style="font-size: 9pt; font-weight: 400; color: #666; line-height: 1.1;">REPUBLIC OF THE PHILIPPINES</span>
                <span style="font-size: 15pt; font-weight: 900; color: #666; line-height: 1.1;">DEPARTMENT OF AGRARIAN REFORM</span>
                <span style="font-size: 10pt; font-weight: 700; color: #666; line-height: 1.1;">Regional Office I</span>
                <span style="font-size: 10pt; font-weight: bold; color: #9cb176; line-height: 1.1;">Tunay na Pagbabago sa Repormang Agraryo</span>
              </div>
            </div>
            <img src="${bagongPilipinasLogo}" alt="Bagong Pilipinas" style="height: 80px; width: auto;" />
          </div>

          <!-- Report Details -->
          <div style="margin-top: 20px; flex: 1; display: flex; flex-direction: column;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="font-size: 14pt; font-weight: bold; margin: 0; text-transform: uppercase;">SYSTEM GENERATED DOCUMENT SUMMARY REPORT</h2>
              <p style="color: #64748b; font-size: 10pt; margin: 5px 0 0 0; font-weight: 500;">
                Period: ${monthsStr} ${selectedYear}
              </p>
            </div>

            <!-- Metrics Grid -->
            <div class="metrics-container">
              <div class="metric-box">
                <p class="metric-label">Total Documents Generated</p>
                <p class="metric-val">${totalCount}</p>
              </div>
              <div class="metric-box">
                <p class="metric-label">Total Value Awarded</p>
                <p class="metric-val-dark">₱${totalAwardAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div class="metric-box">
                <p class="metric-label">Report Generation Date</p>
                <p style="font-size: 12pt; font-weight: bold; color: #334155; margin: 8px 0 0 0;">${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
              </div>
            </div>

            <!-- Breakdown Table -->
            <div style="margin-bottom: 25px;">
              <h3 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">Document Type Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th style="text-align: center; width: 100px;">Count</th>
                    <th style="text-align: right; width: 250px;">Total Awarded Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-weight: bold;">Notice of Award (NOA)</td>
                    <td style="text-align: center;">${filteredNOA.length}</td>
                    <td style="text-align: right; font-family: monospace;">₱${noaSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Notice to Proceed (NTP)</td>
                    <td style="text-align: center;">${filteredNTP.length}</td>
                    <td style="text-align: right; font-family: monospace;">₱${ntpSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Resolution for Direct Acquisition</td>
                    <td style="text-align: center;">${filteredDirect.length}</td>
                    <td style="text-align: right; font-family: monospace;">₱${directSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Resolution for SVP</td>
                    <td style="text-align: center;">${filteredSVP.length}</td>
                    <td style="text-align: right; font-family: monospace;">₱${svpSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Resolution for LOV</td>
                    <td style="text-align: center;">${filteredLOV.length}</td>
                    <td style="text-align: right; font-family: monospace;">₱${lovSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Resolution for Emergency Split</td>
                    <td style="text-align: center;">${filteredSplit.length}</td>
                    <td style="text-align: right; font-family: monospace;">₱${splitSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style="background: #f8fafc; font-weight: bold; border-top: 2px solid #cbd5e1;">
                    <td>TOTAL</td>
                    <td style="text-align: center;">${totalCount}</td>
                    <td style="text-align: right; font-family: monospace;">₱${totalAwardAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Official Signatures Section -->
            <div style="display: flex; justify-content: space-between; margin-top: auto; padding-top: 30px; border-top: 1px solid #e2e8f0; margin-bottom: 20px;">
              <div>
                <p style="font-size: 7.5pt; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin: 0;">Prepared By:</p>
                <div style="margin-top: 35px;">
                  <div style="height: 1px; width: 180px; background: #94a3b8; margin-bottom: 5px;"></div>
                  <p style="font-weight: bold; margin: 0;">System Operator</p>
                  <p style="font-size: 8pt; color: #64748b; margin: 0;">DAR Regional Office I</p>
                </div>
              </div>
              <div>
                <p style="font-size: 7.5pt; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin: 0;">Approved By:</p>
                <div style="margin-top: 35px;">
                  <p style="font-weight: bold; margin: 0;">MARIA ANA B. FRANCISCO, CESO III</p>
                  <p style="font-size: 8pt; color: #64748b; margin: 0;">Head of Procuring Entity (HOPE)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Official Footer -->
          <div style="width: 100%; margin-top: auto; padding-top: 6px; border-top: 2px solid #000; display: flex; justify-content: space-between; align-items: flex-start; font-family: Arial, sans-serif; font-size: 8pt; color: #000; line-height: 1.2; flex-shrink: 0;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 700;">DAR REGIONAL OFFICE I</span>
              <span>Northgate Square, Añes Building, Carlatan, City of San Fernando, La Union</span>
            </div>
            <div style="display: flex; flex-direction: column; text-align: right;">
              <span>TELEPHONE: (072) 700-5770</span>
              <span>E-MAIL: darrorecords@yahoo.com</span>
            </div>
          </div>
        </div>

        <!-- Second Page for Detailed Records -->
        <div class="print-page page-break-before">
          <!-- Official Header -->
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid black; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <img src="${darLogo}" alt="DAR Logo" style="height: 85px; width: auto;" />
              <div style="display: flex; flex-direction: column; font-family: Arial, sans-serif;">
                <span style="font-size: 9pt; font-weight: 400; color: #666; line-height: 1.1;">REPUBLIC OF THE PHILIPPINES</span>
                <span style="font-size: 15pt; font-weight: 900; color: #666; line-height: 1.1;">DEPARTMENT OF AGRARIAN REFORM</span>
                <span style="font-size: 10pt; font-weight: 700; color: #666; line-height: 1.1;">Regional Office I</span>
                <span style="font-size: 10pt; font-weight: bold; color: #9cb176; line-height: 1.1;">Tunay na Pagbabago sa Repormang Agraryo</span>
              </div>
            </div>
            <img src="${bagongPilipinasLogo}" alt="Bagong Pilipinas" style="height: 80px; width: auto;" />
          </div>

          <div style="margin-top: 20px; flex: 1; display: flex; flex-direction: column;">
            <h3 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">Individual Document Records</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 110px;">Date</th>
                  <th style="width: 100px;">Doc Type</th>
                  <th style="width: 200px;">Company / Awardee</th>
                  <th>Activity / Purpose</th>
                  <th style="text-align: right; width: 140px;">Award Amount</th>
                </tr>
              </thead>
              <tbody>
                ${recordsHTML}
              </tbody>
            </table>
          </div>

          <!-- Official Footer -->
          <div style="width: 100%; margin-top: auto; padding-top: 6px; border-top: 2px solid #000; display: flex; justify-content: space-between; align-items: flex-start; font-family: Arial, sans-serif; font-size: 8pt; color: #000; line-height: 1.2; flex-shrink: 0;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 700;">DAR REGIONAL OFFICE I</span>
              <span>Northgate Square, Añes Building, Carlatan, City of San Fernando, La Union</span>
            </div>
            <div style="display: flex; flex-direction: column; text-align: right;">
              <span>TELEPHONE: (072) 700-5770</span>
              <span>E-MAIL: darrorecords@yahoo.com</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => printWindow.close()
      }, 400)
    }
  }

  const toggleMonth = (mVal) => {
    if (selectedMonths.includes(mVal)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter(m => m !== mVal))
      }
    } else {
      setSelectedMonths([...selectedMonths, mVal].sort((a, b) => a - b))
    }
  }

  const selectAllMonths = () => {
    setSelectedMonths([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  }

  const selectNoMonths = () => {
    setSelectedMonths([0]) // Keep at least one month
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 relative">
      <header className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'black' }}>System Reports</h2>
          <p className="text-slate-500">Comprehensive overview of system metrics and summaries.</p>
        </div>
        <button 
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center gap-2 bg-[#0B6623] hover:bg-[#09501b] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-[#0B6623]/25"
        >
          <MdPrint className="w-5 h-5" />
          Print Report
        </button>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#0B6623]/5 to-[#0B6623]/10 p-6 rounded-3xl border border-[#0B6623]/10 flex items-center space-x-5">
          <div className="bg-[#0B6623] p-3.5 rounded-2xl text-white shadow-lg shadow-[#0B6623]/20">
            <MdInsertDriveFile className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Documents</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalCount}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 p-6 rounded-3xl border border-amber-500/10 flex items-center space-x-5">
          <div className="bg-amber-500 p-3.5 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <MdAttachMoney className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Value Awarded</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              ₱{totalAwardAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-6 rounded-3xl border border-blue-500/10 flex items-center space-x-5">
          <div className="bg-blue-500 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <MdTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Filters</p>
            <h3 className="text-sm font-bold text-slate-700 mt-1.5 truncate">
              {selectedYear} ({selectedMonths.length} Months Selected)
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[480px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
            <span>Monthly Documents Created ({selectedYear})</span>
            <span className="text-xs text-slate-400 normal-case font-normal">Based on database counts</span>
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                <Line type="monotone" dataKey="NOA & NTP" stroke={colors.noa} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO Direct" stroke={colors.direct} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO SVP" stroke={colors.svp} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO LOV" stroke={colors.lov} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO Emergency Split" stroke={colors.split} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[480px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Yearly Documents Created Breakdown</h3>
          <div className="flex-1 w-full flex items-center justify-center text-slate-400 flex-col space-y-2">
            <span className="font-bold text-lg text-slate-700">Detailed Report Matrix</span>
            <div className="w-full divide-y divide-slate-100 text-xs px-4">
              <div className="flex justify-between py-2.5 font-bold text-slate-500">
                <span>Document Type</span>
                <span>Filtered Period Count</span>
              </div>
              <div className="flex justify-between py-2 text-slate-700 font-medium">
                <span>Notice of Award (NOA)</span>
                <span>{filteredNOA.length}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-700 font-medium">
                <span>Notice to Proceed (NTP)</span>
                <span>{filteredNTP.length}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-700 font-medium">
                <span>RESO Direct Acquisition</span>
                <span>{filteredDirect.length}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-700 font-medium">
                <span>RESO SVP</span>
                <span>{filteredSVP.length}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-700 font-medium">
                <span>RESO LOV</span>
                <span>{filteredLOV.length}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-700 font-medium">
                <span>RESO Emergency Split</span>
                <span>{filteredSplit.length}</span>
              </div>
              <div className="flex justify-between py-2.5 font-extrabold text-[#0B6623]">
                <span>Total Documents Created</span>
                <span>{totalCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal for Printing */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden mx-4">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MdFilterList className="w-6 h-6 text-[#0B6623]" />
                Filter Report for Print
              </h3>
              <button 
                onClick={() => setIsFilterModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Year Filter */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Report Year</label>
                <select 
                  value={selectedYear} 
                  onChange={e => setSelectedYear(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] text-slate-700 font-semibold"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              {/* Month Filters */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Months</label>
                  <div className="flex space-x-2 text-[10px] font-black uppercase tracking-wider">
                    <button onClick={selectAllMonths} className="text-[#0B6623] hover:underline">Select All</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={selectNoMonths} className="text-slate-400 hover:underline">Clear</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {monthsList.map(month => {
                    const isSelected = selectedMonths.includes(month.value)
                    return (
                      <button
                        key={month.value}
                        onClick={() => toggleMonth(month.value)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#E8F5E9] border-[#0B6623] text-[#0B6623] shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{month.label}</span>
                        {isSelected && <MdCheck className="w-4 h-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsFilterModalOpen(false)} 
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-xl font-semibold bg-[#0B6623] text-white hover:bg-[#09501b] shadow-lg shadow-[#0B6623]/20 flex items-center gap-2 transition-all"
              >
                <MdPrint className="w-5 h-5" />
                Generate and Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Warning Modal */}
      {popupWarning.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{popupWarning.title}</h3>
            <p className="text-slate-600 text-sm mb-8">{popupWarning.message}</p>
            <button
              onClick={() => setPopupWarning({ isOpen: false, title: '', message: '' })}
              className="w-full py-3 text-white font-bold bg-[#0B6623] hover:bg-[#09501c] rounded-xl transition-colors shadow-lg cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
