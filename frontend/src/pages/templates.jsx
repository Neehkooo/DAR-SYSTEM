import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MdAdd,
  MdRemove,
  MdFileDownload,
  MdSave,
  MdPrint,
  MdPerson,
  MdBusiness,
  MdLocationOn,
  MdCalendarToday,
  MdDescription,
  MdAssessment,
  MdCheckCircle,
  MdError,
  MdGavel,
  MdClose,
} from 'react-icons/md'
import { TbCurrencyPeso } from 'react-icons/tb'
import darLogo from '../assets/Department_of_Agrarian_Reform_(DAR).svg.png'
import bagongPilipinasLogo from '../assets/Header_Footer/Bagong_Pilipinas_logo.png'
import socotecLogo from '../assets/SOCOTEC-LOGO.png'
import html2pdf from 'html2pdf.js'
import { apiUrl } from '../utils/apiConfig'

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
  <div style={{ width: '100%', marginTop: 'auto', borderTop: '2px solid #000', paddingTop: '8px', flexShrink: 0 }}>
    <div style={{ marginLeft: '0.6in', marginRight: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontSize: '8pt', color: '#666', lineHeight: 1.3 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: '700', color: '#555' }}>DAR REGIONAL OFFICE I</span>
        <span style={{ color: '#777' }}>Northgate Square, Añes Building, Carlatan, City of San Fernando, La Union</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', color: '#777' }}>
          <span><strong>TELEPHONE:</strong> (072) 700-5770</span>
          <span><strong>EMAIL:</strong> darrorecords@yahoo.com</span>
        </div>
        <img src={socotecLogo} alt="SOCOTEC ISO 9001 Logo" style={{ height: '36px', width: 'auto', display: 'block' }} />
      </div>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   Shared page content style
───────────────────────────────────────────── */
const pageContentStyle = {
  textAlign: 'justify',
  fontFamily: '"Times New Roman", Times, serif',
  fontSize: '11pt',
  lineHeight: '1.15',
  color: '#000',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '24px', // Extra gap between header and content
  marginLeft: '0.6in', // 0.4in container + 0.6in margin = 1in from edge
  marginRight: '0.6in', // 0.4in container + 0.6in margin = 1in from edge
  flexGrow: 1, // Pushes content to fill the page height so auto margins work
}

/* Placeholder styling helper */
const val = (v, fallback) => v && v.trim() ? v : fallback

/* Date Formatting Helper */
const formatOfficialDate = (dateString, uppercase = false) => {
  if (!dateString) return ''
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const day = parseInt(parts[2], 10)
    const month = months[parseInt(parts[1], 10) - 1]
    const year = parts[0]
    const formatted = `${day} ${month} ${year}`
    return uppercase ? formatted.toUpperCase() : formatted
  }
  return uppercase ? dateString.toUpperCase() : dateString
}

/* Number to Words Helper */
const convertNumberToWords = (amount) => {
  if (!amount || isNaN(amount)) return ''
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const convertBlock = (num) => {
    if (num === 0) return ''
    if (num < 20) return a[num]
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '')
    return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertBlock(num % 100) : '')
  }
  const convertLarge = (num) => {
    if (num === 0) return 'Zero'
    let result = ''

    const trillions = Math.floor(num / 1000000000000)
    if (trillions > 0) result += convertBlock(trillions) + ' Trillion '

    const billions = Math.floor((num % 1000000000000) / 1000000000)
    if (billions > 0) result += convertBlock(billions) + ' Billion '

    const millions = Math.floor((num % 1000000000) / 1000000)
    if (millions > 0) result += convertBlock(millions) + ' Million '

    const thousands = Math.floor((num % 1000000) / 1000)
    if (thousands > 0) result += convertBlock(thousands) + ' Thousand '

    const remainder = num % 1000
    if (remainder > 0) result += convertBlock(remainder)

    return result.trim()
  }
  const parts = Number(amount).toFixed(2).split('.')
  const pesos = parseInt(parts[0], 10)
  const centavos = parseInt(parts[1], 10)
  let text = convertLarge(pesos) + ' Pesos'
  if (centavos > 0) text += ' and ' + convertLarge(centavos) + ' Centavos'
  return text
}

const formatAmountDisplay = (formattedNumberStr) => {
  if (!formattedNumberStr) return 'Two Hundred Thirty-Seven Thousand Four Hundred Forty Pesos (₱ 237,440.00) only'
  const rawNum = parseFloat(formattedNumberStr.replace(/,/g, ''))
  if (isNaN(rawNum)) return formattedNumberStr
  const words = convertNumberToWords(rawNum)
  const displayNum = rawNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${words} (₱ ${displayNum}) only`
}

const formatResoAmount = (formattedNumberStr, includeOnly = true, uppercase = true) => {
  if (!formattedNumberStr) {
    if (includeOnly) return 'THIRTY-TWO THOUSAND PESOS (₱32,000.00) ONLY.'
    return 'Two Hundred Thousand Pesos (₱200,000.00)'
  }
  const rawNum = parseFloat(formattedNumberStr.replace(/,/g, ''))
  if (isNaN(rawNum)) return formattedNumberStr
  const words = convertNumberToWords(rawNum)
  const displayNum = rawNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  let text = `${words} (₱${displayNum})`
  if (includeOnly) text += ' only.'
  return uppercase ? text.toUpperCase() : text
}

/* ─────────────────────────────────────────────
   NOA Content
───────────────────────────────────────────── */
const NOAContent = ({ data }) => {
  const name = val(data.noaName, 'NAME OF REPRESENTATIVE / NAME OF COMPANY')
  const position = val(data.noaPosition, 'Position /')
  const address = val(data.noaAddress, 'Narciso St, Angles City, 2009 Pampanga')
  const activity = val(data.noaActivity, '(ACTIVITY OR PROJECT TITLE)')
  const date = data.noaDate ? formatOfficialDate(data.noaDate, false) : '(DATE OF CONDUCT)'
  const docDate = data.noaDocDate ? formatOfficialDate(data.noaDocDate, false) : '13 November 2025'
  const amount = data.noaAmount ? formatAmountDisplay(data.noaAmount) : 'Two Hundred Thirty-Seven Thousand Four Hundred Forty Pesos (₱ 237,440.00) only'
  const procurementWhat = val(data.noaProcurementWhat, 'WHAT?').toUpperCase()
  const procurementMop = val(data.noaProcurementMop, 'MOP').toUpperCase()

  return (
    <>
      <OfficialHeader />
      <div style={pageContentStyle}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: '900', fontSize: '20pt', margin: 0 }}>NOTICE OF AWARD</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
          <p style={{ margin: 0 }} className="dynamic-text">{docDate}</p>
          <p style={{ fontWeight: '700', margin: '24px 0 0' }} className="dynamic-text">{name}</p>
          <p style={{ fontWeight: '700', margin: 0 }} className="dynamic-text">{position}</p>
          <p style={{ fontStyle: 'italic', margin: 0 }} className="dynamic-text">{address}</p>
        </div>

        <p style={{ margin: 0 }}>Dear <strong style={{ fontStyle: 'italic' }} className="dynamic-text">{val(data.noaNtpGreeting, "Ma'am/Sir")},</strong></p>

        <p style={{ margin: 0, textAlign: 'justify' }}>
          Please be informed that, upon the recommendation of the Regional Bids and Award Committee (RBAC) and as a result of thorough review based on existing laws, PhilGEPS, and Procurement under the Republic Act 12009 also known as the New Government Procurement Act, the Department of Agrarian Reform – Regional Office I, is awarding the Contract to{' '}
          <strong><em>{name}</em></strong> for the{' '}
          <strong>PROCUREMENT OF <span className="dynamic-text">{procurementWhat}</span> THROUGH <span className="dynamic-text">{procurementMop}</span> FOR THE{' '}
            <span className="dynamic-text">{activity}</span> ON{' '}
            <span className="dynamic-text">{date}</span>
          </strong>{' '}
          in the amount of{' '}
          <strong><em><span className="dynamic-text">{amount}</span></em>,</strong>{' '}
          inclusive of all taxes and other lawful charges.
        </p>

        <p style={{ margin: 0, textAlign: 'justify' }}>
          Therefore, within ten (10) days from receipt of this Notice of Award, you must enter into a contract with us formally. Failure to enter into said contract shall constitute sufficient grounds for cancellation of said award and forfeiture of your Bid Security, if applicable.
        </p>

        <p style={{ margin: 0, textAlign: 'justify' }}>
          Please return the original copy of this Notice duly signed by you to DAR Regional Office I, through the RBAC Secretariat, located at the Northgate Square, Añes Bldg., Carlatan, City of San Fernando, La Union.
        </p>

        <div>
          <p style={{ margin: 0 }}>Very truly yours,</p>
          <p style={{ fontWeight: '700', margin: '48px 0 0' }} className="dynamic-text">{val(data.noaHopeName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
          <p style={{ fontStyle: 'italic', fontSize: '12px', margin: 0 }} className="dynamic-text">{val(data.noaHopeDesignation, 'Head of Procuring Entity/Regional Director')}</p>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
          <p style={{ fontWeight: '700', fontStyle: 'italic', margin: '0 0 16px' }}>CONFORME :</p>
          <p style={{ margin: '0 0 24px' }}>Acknowledge date of receipt and acceptance of this Notice ___________________________</p>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: '50%' }}>
              <p style={{ margin: 0 }}>Name of Bidder/Representative of the bidder</p>
            </div>
            <div style={{ width: '50%', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid black', width: '90%', margin: '0 auto 2px', height: '14px' }}></div>
              <p style={{ margin: 0, fontSize: '11pt' }}>Printed Name &amp; Signature</p>
            </div>
          </div>
        </div>
      </div>
      <OfficialFooter />
    </>
  )
}

/* ─────────────────────────────────────────────
   NTP Content
───────────────────────────────────────────── */
const NTPContent = ({ data }) => {
  const name = val(data.ntpName, 'NAME OF REPRESENTATIVE / NAME OF COMPANY')
  const position = val(data.ntpPosition, 'Position /')
  const address = val(data.ntpAddress, 'Narciso St, Angles City, 2009 Pampanga')
  const activity = val(data.ntpActivity, '(ACTIVITY OR PROJECT TITLE)')
  const date = data.ntpDate ? formatOfficialDate(data.ntpDate, false) : '(DATE OF CONDUCT)'
  const docDate = data.ntpDocDate ? formatOfficialDate(data.ntpDocDate, true) : '10 NOVEMBER 2025'
  const amount = data.ntpAmount ? formatAmountDisplay(data.ntpAmount) : 'Two Hundred Thirty-Seven Thousand Four Hundred Forty Pesos (₱ 237,440.00) only'
  const procurementWhat = val(data.ntpProcurementWhat, 'WHAT?').toUpperCase()
  const procurementMop = val(data.ntpProcurementMop, 'MOP').toUpperCase()

  return (
    <>
      <OfficialHeader />
      <div style={pageContentStyle}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: '900', fontSize: '20pt', margin: 0 }}>NOTICE TO PROCEED</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
          <p style={{ margin: 0 }} className="dynamic-text">{docDate}</p>
          <p style={{ fontWeight: '700', margin: '24px 0 0' }} className="dynamic-text">{name}</p>
          <p style={{ fontWeight: '700', margin: 0 }} className="dynamic-text">{position}</p>
          <p style={{ fontStyle: 'italic', margin: 0 }} className="dynamic-text">{address}</p>
        </div>

        <p style={{ margin: 0 }}>Dear <strong style={{ fontStyle: 'italic' }} className="dynamic-text">{val(data.noaNtpGreeting, "Ma'am/Sir")},</strong></p>

        <p style={{ margin: 0, textAlign: 'justify' }}>
          Pursuant to the result of the final evaluation made on the proposal submitted and the contract having been approved and notarized; <strong>NOTICE</strong> is hereby given to{' '}
          <strong><em>{name}</em></strong> for the{' '}
          <strong>PROCUREMENT OF <span className="dynamic-text">{procurementWhat}</span> THROUGH <span className="dynamic-text">{procurementMop}</span> FOR THE{' '}
            <span className="dynamic-text">{activity}</span> ON{' '}
            <span className="dynamic-text">{date}</span>
          </strong>{' '}
          in the amount of{' '}
          <strong><em><span className="dynamic-text">{amount}</span></em>,</strong>{' '}
          inclusive of all taxes and other lawful charges.
        </p>

        <p style={{ margin: 0, textAlign: 'justify' }}>
          Upon receipt of this notice, you are responsible for performing the service under the terms and conditions provided in the signed and received <strong>Purchase Order/Contract</strong> of the aforementioned activity.
        </p>

        <p style={{ margin: 0, textAlign: 'justify' }}>
          Please return the original copy of this Notice duly signed by you to DAR Regional Office I, through the RBAC Secretariat, located at the Northgate Square, Añes Bldg., Carlatan, City of San Fernando, La Union.
        </p>

        <div>
          <p style={{ margin: 0 }}>Very truly yours,</p>
          <p style={{ fontWeight: '700', margin: '48px 0 0' }} className="dynamic-text">{val(data.noaHopeName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
          <p style={{ fontSize: '12px', margin: 0 }} className="dynamic-text">{val(data.noaHopeDesignationNtp, 'Regional Director')}</p>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
          <p style={{ fontWeight: '700', fontStyle: 'italic', textDecoration: 'underline', margin: '0 0 16px' }}>CONFORME :</p>
          <p style={{ margin: '0 0 24px' }}>Acknowledge date of receipt and acceptance of this Notice ___________________________</p>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: '50%' }}>
              <p style={{ margin: 0 }}>Name of Bidder/Representative of the bidder</p>
            </div>
            <div style={{ width: '50%', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid black', width: '90%', margin: '0 auto 2px', height: '14px' }}></div>
              <p style={{ margin: 0, fontSize: '11pt' }}>Printed Name &amp; Signature</p>
            </div>
          </div>
        </div>
      </div>
      <OfficialFooter />
    </>
  )
}

/* ─────────────────────────────────────────────
   Reso Direct Acquisition Content
───────────────────────────────────────────── */
const ResoDirectAcquisitionContent = ({ data }) => {
  const company = val(data.resoCompany, 'LU OVERLOAD RESTAURANT AND CATERING SERVICES')
  const items = val(data.resoItems, 'MEALS & SNACKS')
  const purpose = val(data.resoPurpose, 'MEETING FOR THE PREPARATION OF NWMC')
  const dateOfConduct = val(data.resoDateOfConduct, 'MARCH 2026 & CY2026 PLANS')
  const amount = formatResoAmount(data.resoAmount, true, true)
  const maxAmount = formatResoAmount(data.resoMaxAmount, false, false)
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '18 FEBRUARY 2026'
  const endUser = val(data.resoEndUser, '').toUpperCase()

  const resoContentStyle = {
    ...pageContentStyle,
    gap: '3px',
    fontSize: '11pt',
    marginLeft: '0.6in',
    marginRight: '0.6in',
    marginTop: '6px'
  }

  return (
    <>
      <OfficialHeader />
      <div style={resoContentStyle}>
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>REGIONAL BIDS AND AWARDS COMMITTEE (RBAC)</p>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>Resolution No. _______, Series of 2026</p>
        </div>

        <div style={{ textAlign: 'center', margin: '8px 0', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>
            RECOMMENDING TO THE HEAD OF PROCURING ENTITY THE AWARD OF CONTRACT TO <span className="dynamic-text">{company.toUpperCase()}</span> FOR THE PROCUREMENT OF <span className="dynamic-text">{items.toUpperCase()}</span> FOR THE CONDUCT OF GAD <span className="dynamic-text">{purpose.toUpperCase()}</span> ON <span className="dynamic-text">{dateOfConduct.toUpperCase()}</span>
          </p>
        </div>

        <p style={{ margin: 0, textAlign: 'justify' }}>
          Presented for approval before the members of the Regional Bids and Awards Committee (RBAC) a RESOLUTION awarding <strong><span className="dynamic-text">{company.toUpperCase()}</span></strong> for the provision of <span className="dynamic-text">{items.toUpperCase()}</span> through DIRECT ACQUISITION pursuant to the IRR of Republic Act of 12009 also known as the New Government Procurement Act:
        </p>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Rule IV Section 26.1 (f) of the IRR. Of the R.A. 12009, otherwise known as The New Government Procurement Act, provides for Direct Acquisition; as one of the modes of procurement consistent with the Fit-for-Purpose procurement approach;
        </p>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Section 32.1 of the said IRR stated that Direct Acquisition is a mode of procurement of CSE not available in the PS-DBM, Non-CSE, and services with ABC not exceeding <span className="dynamic-text">{maxAmount}</span>, where the Procuring Entity, without need to conduct a canvass or request for quotations, may procure directly from any known and reputable sources;
        </p>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the RBAC has deemed it proper to conduct Direct Acquisition as the mode of procurement in the interest of efficiency and economy, pursuant to Section 32.1 of the IRR of RA 12009;
        </p>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, upon examination of the goods to be procured, the RBAC found out that the items for procurement are classified as CSE not available in the PS-DBM, non-CSE or services not Exceeding <span className="dynamic-text">{maxAmount}</span>;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, pursuant to the guideline under Sections 32.2 and 32.3 of the IRR of RA 12009, the RBAC found <strong><span className="dynamic-text">{company.toUpperCase()}</span></strong> to be a reputable source with legal, technical, and financial capacity and eligible for the provision of <span className="dynamic-text">{items.toUpperCase()}</span>;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREFORE</strong>, after careful deliberations and study of the matter, the Regional Bids and Awards Committee <strong>RESOLVES</strong>, as it is <strong>HEREBY RESOLVED</strong>, to <strong>RECOMMEND</strong> the award of the <span className="dynamic-text"><strong>PROCUREMENT OF {items.toUpperCase()}</strong></span> THROUGH DIRECT ACQUISITION to <strong><span className="dynamic-text">{company.toUpperCase()}</span></strong> in the amount of <strong><span className="dynamic-text">{amount}</span></strong>
        </p>

        <p style={{ margin: '14px 0 0 0' }}>
          <strong>RESOLVED UNANIMOUSLY</strong> on <strong><span className="dynamic-text">{resoDate}</span></strong> at DAR Regional Office I, Carlatan, City of San Fernando, La Union.
        </p>

        <div style={{ marginTop: '4px' }}>
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{val(data.resoChairpersonName, 'ATTY. GLAIZA MAE MASAOY-ONIA')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoChairpersonDesignation, 'Chairperson')}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{val(data.resoViceName, 'NENITA C. MADRIAGA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoViceDesignation, 'Vice Chairperson')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{val(data.resoMember1Name, 'ATTY. ROMIN A. CADIENTE')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember1Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{val(data.resoMember2Name, 'BEN B. RIOS')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember2Designation, 'Member')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{val(data.resoMember3Name, 'BOBBY S. BAUTISTA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember3Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{val(data.resoMember4Name, 'BOBBY S. BALTAZAR')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember4Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{endUser || <>&nbsp;</>}</p>
              <p style={{ margin: 0 }}>End-user/Rep.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <p style={{ margin: '0 0 4px 0' }}>Approved by:</p>
          <div style={{ textAlign: 'left', marginLeft: '40px' }}>
            <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{val(data.resoApprovedByName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoApprovedByDesignation, 'Head of Procuring Entity')}</p>
          </div>
        </div>
      </div>
      <OfficialFooter />
    </>
  )
}

/* ─────────────────────────────────────────────
   Reso SVP Content
───────────────────────────────────────────── */
const ResoSVPContent = ({ data }) => {
  const company = val(data.resoCompany, '[SUPPLIER NAME]')
  const items = val(data.resoItems, '[SPECIFIC GOODS]')
  const purpose = val(data.resoPurpose, '[TITLE ACTIVITY]')
  const amount = formatResoAmount(data.resoAmount, true, true)
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '[DATE OF SIGNING]'
  const endUser = val(data.resoEndUser, '').toUpperCase()

  const resoContentStyle = {
    ...pageContentStyle,
    gap: '8px',
    fontSize: '10.5pt',
    marginLeft: '0.6in',
    marginRight: '0.6in',
    marginTop: '6px'
  }

  return (
    <>
      <OfficialHeader />
      <div style={resoContentStyle}>
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>REGIONAL BIDS AND AWARDS COMMITTEE (RBAC)</p>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>Resolution No. _______, Series of 2026</p>
        </div>

        <div style={{ textAlign: 'center', margin: '8px 0', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0, textTransform: 'uppercase' }}>
            RESOLUTION RECOMMENDING THE AWARD OF CONTRACT TO <span className="dynamic-text">{company}</span> AMOUNTING <span className="dynamic-text">{amount}</span> THROUGH SMALL VALUE PROCUREMENT UNDER NEGOTIATED PROCUREMENT IN PROCURING THE <span className="dynamic-text">{items}</span> FOR THE <span className="dynamic-text">{purpose}</span>
          </p>
        </div>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Section 34 of R.A 12009, otherwise known as The Implementing Rules and Regulations of Republic Act No. 12009 or The New Government Procurement Act, provides for Small Value Procurement whereby the Procuring Entity requests for the submission of at least three (3) price quotations for Goods not available in the PS-DBM, Infrastructure Projects, and Consulting Services;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the amount involved does not exceed Two Million Pesos (P2,000,000.00), subject to the periodic review of the threshold amount;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, to effect responsive, accessible, comprehensive, efficient and immediate response to procure the <span className="dynamic-text">{items.toUpperCase()}</span>, there is a need to procure goods using the Small Value Procurement;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, in compliance with Section 34.3 of the IRR, the BAC prepared and sent RFQs to at least three (3) suppliers, contractors or consultants of known qualifications, as the case may be;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, after the deadline for submission of quotations or proposals, and Abstract of Quotations or Ratings shall be prepared setting forth the names of those who responded to the RFQ or RFP, and their corresponding price quotations or ratings;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the BAC shall recommend to the HoPE the award of a contract in favor of the supplier, contractor, or consultant, as the case may be, with the Lowest Calculated Responsive Quotation;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, upon confirmation of such capabilities and after due deliberation of the submitted price quotations, the BAC found the offer of <span className="dynamic-text">{company.toUpperCase()}</span> to be the lowest calculated and responsive bid;
        </p>

        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}>
          <strong>NOW, THEREFORE</strong>, the Regional Bids and Awards Committee <strong>RESOLVES</strong>, as it <strong>HEREBY RESOLVED</strong>, to recommend the Head of the Procuring Entity (HoPe) that the Contract for the procurement of the <span className="dynamic-text">{items.toUpperCase()}</span> FOR <span className="dynamic-text">{purpose.toUpperCase()}</span>, be awarded to <span className="dynamic-text">{company.toUpperCase()}</span> through Small Value Procurement under Negotiated Procurement pursuant to and in accordance with Section 34 of R.A. 12009, and that a Notice of Award be issued for this undertaking.
        </p>

        <p style={{ margin: '14px 0 0 0' }}>
          <strong>RESOLVED UNANIMOUSLY</strong> on <strong><span className="dynamic-text">{resoDate}</span></strong> at DAR Regional Office I, Carlatan, City of San Fernando, La Union.
        </p>

        <div style={{ marginTop: '4px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{val(data.resoChairpersonName, 'ATTY. GLAIZA MAE MASAOY-ONIA')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoChairpersonDesignation, 'Chairperson')}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '4px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{val(data.resoViceName, 'NENITA C. MADRIAGA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoViceDesignation, 'Vice Chairperson')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{val(data.resoMember1Name, 'ATTY. ROMIN A. CADIENTE')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember1Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{val(data.resoMember2Name, 'BEN B. RIOS')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember2Designation, 'Member')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '4px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{val(data.resoMember3Name, 'BOBBY S. BAUTISTA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember3Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{val(data.resoMember4Name, 'BOBBY S. BALTAZAR')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember4Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '10px 0 0 0' }} className="dynamic-text">{endUser || <>&nbsp;</>}</p>
              <p style={{ margin: 0 }}>End-user/Rep.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '6px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 4px 0' }}>Approved by:</p>
          <div style={{ textAlign: 'left', marginLeft: '40px' }}>
            <p style={{ fontWeight: '700', margin: '14px 0 0 0' }} className="dynamic-text">{val(data.resoApprovedByName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoApprovedByDesignation, 'Head of Procuring Entity')}</p>
          </div>
        </div>
      </div>
      <OfficialFooter />
    </>
  )
}

/* ─────────────────────────────────────────────
   Reso LOV Content
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Reso LOV Content - Page 1
───────────────────────────────────────────── */
const ResoLOVPage1 = ({ data }) => {
  const company = val(data.resoCompany, '[NAME OF SUPPLIER]')
  const abcAmount = formatResoAmount(data.resoMaxAmount, true, false)
  const amount = formatResoAmount(data.resoAmount, true, false)
  const purpose = val(data.resoPurpose, '[ACTIVITY/PROJECT NAME]')
  const dateOfConduct = val(data.resoDateOfConduct, '[DATE OF ACTIVITY]')
  const rating = val(data.resoRating, '[RATING SHEET]')
  const lessor1 = val(data.lovLessor1, 'LU OVERLOAD RESTAURANT AND CATERING SERVICES').toUpperCase()
  const lessor2 = val(data.lovLessor2, 'Supplier 2').toUpperCase()
  const lessor3 = val(data.lovLessor3, 'Supplier 3').toUpperCase()

  const resoContentStyle = {
    ...pageContentStyle,
    gap: '5px',
    fontSize: '11pt',
    marginLeft: '0.6in',
    marginRight: '0.6in',
    marginTop: '12px'
  }

  return (
    <>
      <OfficialHeader />
      <div style={resoContentStyle}>
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>REGIONAL BIDS AND AWARDS COMMITTEE (RBAC)</p>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>Resolution No. _______, Series of 2026</p>
        </div>

        <div style={{ textAlign: 'center', margin: '12px 0', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0, textTransform: 'uppercase' }}>
            RECOMMENDING TO THE HEAD OF THE PROCURING ENTITY THE AWARD OF CONTRACT TO <span className="dynamic-text">{company}</span> FOR THE PROCUREMENT OF LEASE OF VENUE WITH FOOD AND ACCOMMODATION FOR THE CONDUCT OF <span className="dynamic-text">{purpose}</span> ON <span className="dynamic-text">{dateOfConduct}</span>
          </p>
        </div>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, DAR Regional Office I has undertaken procurement of Lease of Real Property and Venue for the aforementioned activity;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the Approved Budget for the Contract (ABC) is <span className="dynamic-text">{abcAmount}</span> only;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Section 26.1 (i) of the Implementing Rules and Regulations (IRR) of Republic Act (RA) No. 12009 otherwise known as the "New Government Procurement Act, provides for Negotiated Procurement as one of the modes of Procurement consistent with the Fit-for-Purpose procurement approach;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Section 42.1 (a) Rule V of the IRR of RA 12009 states that, the Bids and Awards Committee (BAC) shall recommend to the Head of the Procuring Entity (HOPE) the use of any of the modes of procurement as provided in Rule IV thereof;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Section 35, Rule IV of the IRR of RA 12009, Negotiated Procurement is a mode of procurement of Goods, Infrastructure Projects, and Consulting services whereby the Procuring Entity directly negotiates a contract with a technically, legally, and financially capable supplier, contractor or consultant;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Section 35.9, Rule IV of the IRR of RA 12009 provides for Negotiated Procurement under which is the Lease of Real Property and Venue for lease of real property and venue for official use;
        </p>
        <div style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <p style={{ margin: 0 }}>
            <strong>WHEREAS</strong>, Request for Quotation (RFQs) were sent to three (3) prospective lessors who submitted their respective price quotations, namely:
          </p>
          <ol style={{ margin: '4px 0 0 2em', paddingLeft: '1.5em', listStyleType: 'decimal' }}>
            <li style={{ paddingLeft: '4px' }}><strong><span className="dynamic-text">{lessor1}</span></strong></li>
            <li style={{ paddingLeft: '4px' }}><strong><span className="dynamic-text">{lessor2}</span></strong></li>
            <li style={{ paddingLeft: '4px' }}><strong><span className="dynamic-text">{lessor3}</span></strong></li>
          </ol>
        </div>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, after due deliberation of the submitted price quotations, the BAC found the offer of <span className="dynamic-text">{company}</span> to be the Lowest Calculated Quotation (LCQ);
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, based on the result of the ocular inspection reflected in the Rating Factors and Determination of Reasonableness of Rental Rate <span className="dynamic-text">{company}</span> has been rated by with the score of <span className="dynamic-text">{rating}</span>;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the report containing the result of the evaluation and its attachments is attached hereto as Annex “A" made an integral part hereof;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, upon determination of the responsiveness and reasonableness of the quotation, <span className="dynamic-text">{company}</span> complied with the requirements and is hereby declared as the Lowest Calculated and Responsive Quotation (LRQ);
        </p>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>NOW, THEREFORE</strong>, the BAC hereby <strong>RESOLVES</strong>, as it hereby <strong>RESOLVED</strong>:
        </p>
        <ol style={{ margin: '8px 0 0 2em', paddingLeft: '1em', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>To <strong>DECLARE</strong> the quotation of <span className="dynamic-text">{company}</span> as the Lowest Calculated Responsive Quotation (LCRQ)</li>
          <li>To <strong>RECOMMEND</strong> to the Regional Director, as the Head of Procuring Entity, the award of the project to <span className="dynamic-text">{company}</span> in the amount of <span className="dynamic-text">{amount}</span> for the LEASE OF VENUE for the <span className="dynamic-text">{purpose}</span>.</li>
        </ol>
      </div>
      <OfficialFooter />
    </>
  )
}

/* ─────────────────────────────────────────────
   Reso LOV Content - Page 2
───────────────────────────────────────────── */
const ResoLOVPage2 = ({ data }) => {
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '[DATE OF SIGNING]'
  const endUser = val(data.resoEndUser, '').toUpperCase()

  const resoContentStyle = {
    ...pageContentStyle,
    gap: '5px',
    fontSize: '11pt',
    marginLeft: '0.6in',
    marginRight: '0.6in',
    marginTop: '12px'
  }

  return (
    <>
      <OfficialHeader />
      <div style={resoContentStyle}>

        <p style={{ margin: '0' }}>
          <strong>RESOLVED UNANIMOUSLY</strong> on <strong><span className="dynamic-text">{resoDate}</span></strong> at DAR Regional Office I, Carlatan, City of San Fernando, La Union
        </p>

        <div style={{ marginTop: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoChairpersonName, 'ATTY. GLAIZA MAE MASAOY-ONIA')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoChairpersonDesignation, 'Chairperson')}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoViceName, 'NENITA C. MADRIAGA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoViceDesignation, 'Vice Chairperson')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember1Name, 'ATTY. ROMIN A. CADIENTE')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember1Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember2Name, 'BEN B. RIOS')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember2Designation, 'Member')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember3Name, 'BOBBY S. BAUTISTA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember3Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember4Name, 'BOBBY S. BALTAZAR')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember4Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{endUser || <>&nbsp;</>}</p>
              <p style={{ margin: 0 }}>End-user/Rep.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '48px', marginBottom: '24px' }}>
          <p style={{ margin: '0 0 8px 0' }}>Approved by:</p>
          <div style={{ textAlign: 'left', marginLeft: '40px' }}>
            <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoApprovedByName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoApprovedByDesignation, 'Head of Procuring Entity')}</p>
          </div>
        </div>
      </div>
      <OfficialFooter />
    </>
  )
}

/* ─────────────────────────────────────────────
   Reso Emergency Split Content
───────────────────────────────────────────── */
const ResoEmergencySplitContent = ({ data }) => {
  const company = val(data.resoCompany, '[SUPPLIER NAME]')
  const amount = formatResoAmount(data.resoAmount, true, true)
  const items = val(data.resoItems, '[SPECIFIC GOODS]')
  const purpose = val(data.resoPurpose, '[ACTIVITY NAME]')
  const dateOfConduct = val(data.resoDateOfConduct, '[DATE]')
  const maxAmount = formatResoAmount(data.resoMaxAmount, true, false)
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '[DATE OF SIGNING]'
  const endUser = val(data.resoEndUser, '').toUpperCase()

  const resoContentStyle = {
    ...pageContentStyle,
    gap: '3px',
    fontSize: '11pt',
    marginLeft: '0.6in',
    marginRight: '0.6in',
    marginTop: '6px'
  }

  return (
    <>
      <OfficialHeader />
      <div style={resoContentStyle}>
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>REGIONAL BIDS AND AWARDS COMMITTEE (RBAC)</p>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>Resolution No. _______, Series of 2026</p>
        </div>

        <div style={{ textAlign: 'center', margin: '6px 0', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0, textTransform: 'uppercase' }}>
            RESOLUTION RECOMMENDING THE AWARD OF CONTRACT TO <span className="dynamic-text">{company}</span> AMOUNTING TO <span className="dynamic-text">{amount}</span> THROUGH NEGOTIATED PROCUREMENT (EMERGENCY CASES) FOR THE PROCUREMENT OF <span className="dynamic-text">{items}</span> FOR <span className="dynamic-text">{purpose}</span>
          </p>
        </div>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Section 35.2, Rule IV of the Implementing Rules and Regulations (IRR) of R.A. 12009, otherwise known as the New Government Procurement Act, provides for Negotiated Procurement (Emergency Cases) as one of the modes of procurement consistent with the Fit-for-purpose procurement approach;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, Emergency Cases is a mode of Negotiated Procurement which may be resorted to when a cause where immediate action is necessary to prevent damage to or loss of life or property, or to restore vital public services and other public utilities;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the delegated End-User/Implementing Unit shall be authorized to directly negotiate with legal, technically and financially capable supplier for the procurement undertaken through any of the allowable instances of Negotiated Procurement (Emergency Cases) under the above-mentioned Section;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, there is an unforeseen contingency requiring immediate purchase of <span className="dynamic-text">{items.toUpperCase()}</span> for the <span className="dynamic-text">{purpose.toUpperCase()}</span>, which was not programmed for the quarter, the amount being procure to <span className="dynamic-text">{maxAmount}</span>;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, resorting to other modes of procurement – Negotiated Procurement (Emergency Cases) addresses the specific needs of the Procuring Entity while promoting flexibility and responsiveness to different conditions and scenarios based on different factors and situations, and while ensuring and achieving value for money of the government;
        </p>

        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>NOW, THEREFORE</strong>, We the members of DAR Regional Office I Bids and Awards Committee, hereby <strong>RESOLVE</strong> to recommend to the Regional Director Maria Ana B. Francisco, CESO III, the resort to Emergency Purchase for the procurement of <span className="dynamic-text">{items.toUpperCase()}</span> for <span className="dynamic-text">{purpose.toUpperCase()}</span> ON <span className="dynamic-text">{dateOfConduct.toUpperCase()}</span>.
        </p>

        <p style={{ margin: '8px 0 0 0' }}>
          <strong>RESOLVED UNANIMOUSLY</strong> on <strong><span className="dynamic-text">{resoDate}</span></strong> at DAR Regional Office I, Carlatan, City of San Fernando, La Union
        </p>

        <div style={{ marginTop: '4px' }}>
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoChairpersonName, 'ATTY. GLAIZA MAE MASAOY-ONIA')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoChairpersonDesignation, 'Chairperson')}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoViceName, 'NENITA C. MADRIAGA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoViceDesignation, 'Vice Chairperson')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember1Name, 'ATTY. ROMIN A. CADIENTE')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember1Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember2Name, 'BEN B. RIOS')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember2Designation, 'Member')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember3Name, 'BOBBY S. BAUTISTA')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember3Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoMember4Name, 'BOBBY S. BALTAZAR')}</p>
              <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoMember4Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{endUser || <>&nbsp;</>}</p>
              <p style={{ margin: 0 }}>End-user/Rep.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: '48px' }}>
          <p style={{ margin: '0 0 4px 0' }}>Approved by:</p>
          <div style={{ textAlign: 'left', marginLeft: '40px' }}>
            <p style={{ fontWeight: '700', margin: '24px 0 0 0' }} className="dynamic-text">{val(data.resoApprovedByName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
            <p style={{ margin: 0 }} className="dynamic-text">{val(data.resoApprovedByDesignation, 'Head of Procuring Entity')}</p>
          </div>
        </div>
      </div>
      <OfficialFooter />
    </>
  )
}

/* ─────────────────────────────────────────────
   A4 / Letter Card style
───────────────────────────────────────────── */
const pageCardStyle = {
  width: '8.5in',
  height: '11in',
  background: 'white',
  position: 'relative',
  padding: '0.4in', // 0.4in margin for the Header and Footer
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  overflow: 'hidden',
}

/* ─────────────────────────────────────────────
   Long / Folio Card style (8.5 x 13)
───────────────────────────────────────────── */
const longPageCardStyle = {
  width: '8.5in',
  minHeight: '13in',
  height: '13in',
  background: 'white',
  position: 'relative',
  padding: '0.4in', // 0.4in margin for the Header and Footer
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  overflow: 'visible',
}

/* ─────────────────────────────────────────────
   Input field component
───────────────────────────────────────────── */
const Field = ({
  icon: Icon,
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  isInvalid = false,
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={id}
      className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        'w-full bg-white border rounded-xl px-4 py-2.5 text-sm transition-all',
        isInvalid
          ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
          : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]',
      ].join(' ')}
    />
    {hint && <p className="text-[10px] text-slate-400 italic pl-1">{hint}</p>}
  </div>
)

/* ─────────────────────────────────────────────
   Select field component
───────────────────────────────────────────── */
const SelectField = ({ icon: Icon, label, id, value, onChange, options, isInvalid = false }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={[
        'w-full bg-white border rounded-xl px-4 py-2.5 text-sm transition-all text-slate-700 cursor-pointer',
        isInvalid
          ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
          : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] focus:outline-none',
      ].join(' ')}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

/* ─────────────────────────────────────────────
   Section header for editing panel
───────────────────────────────────────────── */
const SectionLabel = ({ title, color = '#0B6623' }) => (
  <div className="flex items-center gap-2 pt-2">
    <div className="h-px flex-1 bg-slate-200" />
    <span className="text-[10px] font-black uppercase tracking-widest px-2" style={{ color }}>{title}</span>
    <div className="h-px flex-1 bg-slate-200" />
  </div>
)

const parseAmount = (value) => {
  if (value === null || value === undefined || value === '') return 0
  const num = parseFloat(String(value).replace(/,/g, ''))
  return Number.isFinite(num) ? num : 0
}

const apiHeaders = (currentUser) => ({
  'Content-Type': 'application/json',
  'X-User': currentUser?.name || 'System',
})

const readApiError = async (res, fallback) => {
  try {
    const data = await res.json()
    if (data?.error) return data.error
    if (data && typeof data === 'object') {
      const details = Object.entries(data)
        .map(([field, messages]) => {
          const text = Array.isArray(messages) ? messages.join(', ') : String(messages)
          return `${field}: ${text}`
        })
        .join('; ')
      if (details) return details
    }
  } catch {
    // Response body was not JSON
  }
  return fallback
}

const saveDocument = async (endpoint, payload, currentUser, fallbackMsg) => {
  const res = await fetch(apiUrl(endpoint), {
    method: 'POST',
    headers: apiHeaders(currentUser),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await readApiError(res, fallbackMsg))
  }
  return res.json()
}

const textOrEmpty = (value) => (value != null ? String(value).trim() : '')

const noaExtraFields = (formData) => ({
  greeting: textOrEmpty(formData.noaNtpGreeting) || "Ma'am/Sir",
  procurement_what: textOrEmpty(formData.noaProcurementWhat),
  procurement_mop: textOrEmpty(formData.noaProcurementMop),
  hope_name: textOrEmpty(formData.noaHopeName),
  hope_designation: textOrEmpty(formData.noaHopeDesignation),
})

const ntpExtraFields = (formData) => ({
  greeting: textOrEmpty(formData.noaNtpGreeting) || "Ma'am/Sir",
  procurement_what: textOrEmpty(formData.ntpProcurementWhat),
  procurement_mop: textOrEmpty(formData.ntpProcurementMop),
  hope_name: textOrEmpty(formData.noaHopeName),
  hope_designation_ntp: textOrEmpty(formData.noaHopeDesignationNtp),
})

const resoSignatoryFields = (formData) => ({
  end_user: textOrEmpty(formData.resoEndUser),
  chairperson_name: textOrEmpty(formData.resoChairpersonName),
  chairperson_designation: textOrEmpty(formData.resoChairpersonDesignation),
  vice_name: textOrEmpty(formData.resoViceName),
  vice_designation: textOrEmpty(formData.resoViceDesignation),
  member1_name: textOrEmpty(formData.resoMember1Name),
  member1_designation: textOrEmpty(formData.resoMember1Designation),
  member2_name: textOrEmpty(formData.resoMember2Name),
  member2_designation: textOrEmpty(formData.resoMember2Designation),
  member3_name: textOrEmpty(formData.resoMember3Name),
  member3_designation: textOrEmpty(formData.resoMember3Designation),
  member4_name: textOrEmpty(formData.resoMember4Name),
  member4_designation: textOrEmpty(formData.resoMember4Designation),
  approved_by_name: textOrEmpty(formData.resoApprovedByName),
  approved_by_designation: textOrEmpty(formData.resoApprovedByDesignation),
})

/* ─────────────────────────────────────────────
   Main Templates component
───────────────────────────────────────────── */
const Templates = ({
  activeTab,
  currentUser,
  onDirtyChange,
  registerDraftSaver,
}) => {
  const mainRef = useRef(null)
  const [editPanelWidth, setEditPanelWidth] = useState(42)
  const [isResizing, setIsResizing] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isDownloading, setIsDownloading] = useState(false)

  /* ── Form state ── */
  const todayStr = new Date().toISOString().split('T')[0]
  const [formData, setFormData] = useState({
    // NOA fields
    noaNtpGreeting: "Ma'am/Sir",
    noaDocDate: todayStr,
    noaName: '',
    noaPosition: '',
    noaAddress: '',
    noaActivity: '',
    noaProcurementWhat: '',
    noaProcurementMop: '',
    noaDate: todayStr,
    noaAmount: '',
    // NTP fields
    ntpDocDate: todayStr,
    ntpName: '',
    ntpPosition: '',
    ntpAddress: '',
    ntpActivity: '',
    ntpProcurementWhat: '',
    ntpProcurementMop: '',
    ntpDate: todayStr,
    ntpAmount: '',
    // Reso Direct Acquisition fields
    resoDate: todayStr,
    resoCompany: '',
    resoItems: '',
    resoPurpose: '',
    resoDateOfConduct: '',
    resoAmount: '',
    resoMaxAmount: '',
    resoRating: '',
    resoEndUser: '',
    // LOV Lessor List fields
    lovLessor1: '',
    lovLessor2: '',
    lovLessor3: '',
    // Signatories fields (with fallback defaults)
    noaHopeName: 'MARIA ANA B. FRANCISCO, CESO III',
    noaHopeDesignation: 'Head of Procuring Entity/Regional Director',
    noaHopeDesignationNtp: 'Regional Director',
    resoChairpersonName: 'ATTY. GLAIZA MAE MASAOY-ONIA',
    resoChairpersonDesignation: 'Chairperson',
    resoViceName: 'NENITA C. MADRIAGA',
    resoViceDesignation: 'Vice Chairperson',
    resoMember1Name: 'ATTY. ROMIN A. CADIENTE',
    resoMember1Designation: 'Member',
    resoMember2Name: 'BEN B. RIOS',
    resoMember2Designation: 'Member',
    resoMember3Name: 'BOBBY S. BAUTISTA',
    resoMember3Designation: 'Member',
    resoMember4Name: 'BOBBY S. BALTAZAR',
    resoMember4Designation: 'Member',
    resoApprovedByName: 'MARIA ANA B. FRANCISCO, CESO III',
    resoApprovedByDesignation: 'Head of Procuring Entity',
    // Signatory overrides (set via modal)
    noaNtpSignatory: null,
    resoSignatoryChair: null,
    resoSignatoryVice: null,
    resoSignatoryMembers: [],
    resoSignatoryApproved: null,
  })

  /* ── Signatories Modal configuration state ── */
  const [isSignatoriesModalOpen, setIsSignatoriesModalOpen] = useState(false)
  const [dbSignatories, setDbSignatories] = useState([])

  const fetchDbSignatories = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/signatories/')
      if (res.ok) {
        const data = await res.json()
        setDbSignatories(data)
      }
    } catch (err) {
      console.error('Error fetching signatories', err)
    }
  }, [])

  // Load database signatories on modal load
  useEffect(() => {
    if (isSignatoriesModalOpen) {
      fetchDbSignatories()
    }
  }, [isSignatoriesModalOpen, fetchDbSignatories])

  const setField = (key) => (value) => setFormData(prev => ({ ...prev, [key]: value }))

  const setAmountField = (key) => (value) => {
    let raw = value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    if (parts[0]) {
      const parsed = parseInt(parts[0], 10)
      parts[0] = isNaN(parsed) ? '' : parsed.toLocaleString('en-US')
    }
    let formatted = parts[0] || ''
    if (parts.length > 1) {
      formatted += '.' + parts[1].substring(0, 2)
    }
    if (value.startsWith('.')) formatted = '.' + formatted.replace('.', '')
    setFormData(prev => ({ ...prev, [key]: formatted }))
  }

  const [isSaving, setIsSaving] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' })

  const [showMissingDocCorners, setShowMissingDocCorners] = useState(false)

  // ── Dirty tracking + draft saving ──
  const initialFormDataRef = useRef(null)

  // Capture initial snapshot once per tab activation
  useEffect(() => {
    initialFormDataRef.current = JSON.parse(JSON.stringify(formData))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const isDirty = (() => {
    if (!initialFormDataRef.current) return false
    try {
      return JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current)
    } catch {
      return true
    }
  })()

  useEffect(() => {
    if (typeof onDirtyChange === 'function') {
      onDirtyChange(Boolean(isDirty), activeTab)
    }
  }, [isDirty, activeTab, onDirtyChange])

  const saveDraftToLocalStorage = useCallback(async () => {
    try {
      const payload = {
        activeTab,
        savedAt: new Date().toISOString(),
        formData,
      }
      localStorage.setItem(`dar_template_draft:${activeTab}`, JSON.stringify(payload))

      // Update "initial" snapshot so dirty resets after draft save
      initialFormDataRef.current = JSON.parse(JSON.stringify(formData))

      setStatusModal({
        isOpen: true,
        type: 'success',
        message: 'Draft saved successfully!',
      })
    } catch (err) {
      console.error('Failed to save draft:', err)
      setStatusModal({
        isOpen: true,
        type: 'error',
        message: 'Failed to save draft. Please try again.',
      })
    }
  }, [activeTab, formData])

  useEffect(() => {
    if (typeof registerDraftSaver === 'function') {
      registerDraftSaver(saveDraftToLocalStorage, activeTab)
    }
  }, [registerDraftSaver, saveDraftToLocalStorage, activeTab])

  const getMissingRequiredFieldIds = () => {
    const missing = []
    const isBlank = (v) => v == null || String(v).trim() === ''

    // NOA & NTP
    if (activeTab === 'noa_ntp') {
      const required = [
        { id: 'noaDocDate', value: formData.noaDocDate },
        { id: 'noaName', value: formData.noaName },
        { id: 'noaPosition', value: formData.noaPosition },
        { id: 'noaAddress', value: formData.noaAddress },
        { id: 'noaActivity', value: formData.noaActivity },
        { id: 'noaProcurementWhat', value: formData.noaProcurementWhat },
        { id: 'noaProcurementMop', value: formData.noaProcurementMop },
        { id: 'noaDate', value: formData.noaDate },
        { id: 'noaAmount', value: formData.noaAmount },

        { id: 'ntpDocDate', value: formData.ntpDocDate },
        { id: 'ntpName', value: formData.ntpName },
        { id: 'ntpPosition', value: formData.ntpPosition },
        { id: 'ntpAddress', value: formData.ntpAddress },
        { id: 'ntpActivity', value: formData.ntpActivity },
        { id: 'ntpProcurementWhat', value: formData.ntpProcurementWhat },
        { id: 'ntpProcurementMop', value: formData.ntpProcurementMop },
        { id: 'ntpDate', value: formData.ntpDate },
        { id: 'ntpAmount', value: formData.ntpAmount },
      ]
      required.forEach(r => {
        if (isBlank(r.value)) missing.push(r.id)
      })
      return missing
    }

    // Reso Direct Acquisition
    if (activeTab === 'reso_direct_acquisition') {
      ;[
        { id: 'resoDate', value: formData.resoDate },
        { id: 'resoCompany', value: formData.resoCompany },
        { id: 'resoItems', value: formData.resoItems },
        { id: 'resoPurpose', value: formData.resoPurpose },
        { id: 'resoDateOfConduct', value: formData.resoDateOfConduct },
        { id: 'resoMaxAmount', value: formData.resoMaxAmount },
        { id: 'resoAmount', value: formData.resoAmount },
      ].forEach(r => {
        if (isBlank(r.value)) missing.push(r.id)
      })
      return missing
    }

// Reso SVP
    if (activeTab === 'reso_svp') {
      // Ensure validation matches the actual shared formData keys.
      ;[
        { id: 'resoDateSVP', value: formData.resoDate },
        { id: 'resoCompanySVP', value: formData.resoCompany },
        { id: 'resoItemsSVP', value: formData.resoItems },
        { id: 'resoPurposeSVP', value: formData.resoPurpose },
        { id: 'resoAmountSVP', value: formData.resoAmount },
      ].forEach(r => {
        if (isBlank(r.value)) missing.push(r.id)
      })
      return missing
    }


    // Reso LOV
    if (activeTab === 'reso_lov') {
      ;[
        { id: 'resoDateLOV', value: formData.resoDate },
        { id: 'resoCompanyLOV', value: formData.resoCompany },
        { id: 'lovLessor1', value: formData.lovLessor1 },
        { id: 'lovLessor2', value: formData.lovLessor2 },
        { id: 'lovLessor3', value: formData.lovLessor3 },
        { id: 'resoPurposeLOV', value: formData.resoPurpose },
        { id: 'resoDateOfConductLOV', value: formData.resoDateOfConduct },
        { id: 'resoMaxAmountLOV', value: formData.resoMaxAmount },
        { id: 'resoAmountLOV', value: formData.resoAmount },
        { id: 'resoRatingLOV', value: formData.resoRating },
      ].forEach(r => {
        if (isBlank(r.value)) missing.push(r.id)
      })
      return missing
    }

    // Reso Emergency Split
    if (activeTab === 'reso_emergency_split') {
      ;[
        { id: 'resoDateSplit', value: formData.resoDate },
        { id: 'resoCompanySplit', value: formData.resoCompany },
        { id: 'resoItemsSplit', value: formData.resoItems },
        { id: 'resoPurposeSplit', value: formData.resoPurpose },
        { id: 'resoDateOfConductSplit', value: formData.resoDateOfConduct },
        { id: 'resoMaxAmountSplit', value: formData.resoMaxAmount },
        { id: 'resoAmountSplit', value: formData.resoAmount },
      ].forEach(r => {
        if (isBlank(r.value)) missing.push(r.id)
      })
      return missing
    }

    return missing
  }

  const handleGenerateDocument = async () => {
    setIsConfirmModalOpen(false)
    const missingFieldIds = getMissingRequiredFieldIds()
    if (missingFieldIds.length > 0) {
      setShowMissingDocCorners(true)
      setStatusModal({
        isOpen: true,
        type: 'error',
        message: 'Please fill in all required fields before generating and saving to the database.',
      })
      // Focus the first missing field
      const firstId = missingFieldIds[0]
      const el = document.getElementById(firstId)
      if (el && typeof el.focus === 'function') el.focus()
      return
    }

    setShowMissingDocCorners(false)
    setIsSaving(true)
    try {
      if (activeTab === 'noa_ntp') {
        if (!formData.noaDocDate || !formData.noaDate || !formData.ntpDocDate || !formData.ntpDate) {
          throw new Error('Please fill in all document and conduct dates for NOA and NTP.')
        }

        const noaPayload = {
          doc_date: formData.noaDocDate,
          name: formData.noaName || 'Unknown',
          position: formData.noaPosition || 'Unknown',
          address: formData.noaAddress || 'Unknown',
          activity: formData.noaActivity || 'Unknown',
          date_of_conduct: formData.noaDate,
          amount: parseAmount(formData.noaAmount),
          ...noaExtraFields(formData),
        }
        const ntpPayload = {
          doc_date: formData.ntpDocDate,
          name: formData.ntpName || 'Unknown',
          position: formData.ntpPosition || 'Unknown',
          address: formData.ntpAddress || 'Unknown',
          activity: formData.ntpActivity || 'Unknown',
          date_of_conduct: formData.ntpDate,
          amount: parseAmount(formData.ntpAmount),
          ...ntpExtraFields(formData),
        }

        let noaRecord = null
        try {
          noaRecord = await saveDocument('noa', noaPayload, currentUser, 'Failed to save NOA Document.')
          await saveDocument('ntp', ntpPayload, currentUser, 'Failed to save NTP Document.')
        } catch (err) {
          if (noaRecord?.id) {
            await fetch(`http://127.0.0.1:8000/api/noa/${noaRecord.id}/`, {
              method: 'DELETE',
              headers: apiHeaders(currentUser),
            })
          }
          throw err
        }

        setStatusModal({ isOpen: true, type: 'success', message: 'NOA & NTP documents successfully created and saved!' })
      } else if (activeTab === 'reso_direct_acquisition') {
        if (!formData.resoDate) throw new Error('Please set the resolution date.')
        await saveDocument('reso', {
          reso_date: formData.resoDate,
          company_name: formData.resoCompany || 'Unknown',
          items_services: formData.resoItems || 'Unknown',
          purpose: formData.resoPurpose || 'Unknown',
          date_of_conduct: formData.resoDateOfConduct || 'Unknown',
          max_amount: parseAmount(formData.resoMaxAmount),
          award_amount: parseAmount(formData.resoAmount),
          ...resoSignatoryFields(formData),
        }, currentUser, 'Failed to save Resolution for Direct Acquisition.')
        setStatusModal({ isOpen: true, type: 'success', message: 'Direct Acquisition Resolution successfully created and saved!' })
      } else if (activeTab === 'reso_svp') {
        if (!formData.resoDate) throw new Error('Please set the resolution date.')
        await saveDocument('reso_svp', {
          reso_date: formData.resoDate,
          company_name: formData.resoCompany || 'Unknown',
          items: formData.resoItems || 'Unknown',
          purpose: formData.resoPurpose || 'Unknown',
          award_amount: parseAmount(formData.resoAmount),
          ...resoSignatoryFields(formData),
        }, currentUser, 'Failed to save SVP Resolution.')
        setStatusModal({ isOpen: true, type: 'success', message: 'SVP Resolution successfully created and saved!' })
      } else if (activeTab === 'reso_lov') {
        if (!formData.resoDate) throw new Error('Please set the resolution date.')
        await saveDocument('reso_lov', {
          reso_date: formData.resoDate,
          company_name: formData.resoCompany || 'Unknown',
          purpose: formData.resoPurpose || 'Unknown',
          date_of_conduct: formData.resoDateOfConduct || 'Unknown',
          max_amount: parseAmount(formData.resoMaxAmount),
          award_amount: parseAmount(formData.resoAmount),
          rating_score: formData.resoRating || '0%',
          lov_lessor_1: textOrEmpty(formData.lovLessor1),
          lov_lessor_2: textOrEmpty(formData.lovLessor2),
          lov_lessor_3: textOrEmpty(formData.lovLessor3),
          ...resoSignatoryFields(formData),
        }, currentUser, 'Failed to save LOV Resolution.')
        setStatusModal({ isOpen: true, type: 'success', message: 'LOV Resolution successfully created and saved!' })
      } else if (activeTab === 'reso_emergency_split') {
        if (!formData.resoDate) throw new Error('Please set the resolution date.')
        await saveDocument('reso_emergency_split', {
          reso_date: formData.resoDate,
          company_name: formData.resoCompany || 'Unknown',
          items: formData.resoItems || 'Unknown',
          purpose: formData.resoPurpose || 'Unknown',
          date_of_conduct: formData.resoDateOfConduct || 'Unknown',
          max_amount: parseAmount(formData.resoMaxAmount),
          award_amount: parseAmount(formData.resoAmount),
          ...resoSignatoryFields(formData),
        }, currentUser, 'Failed to save Emergency Split Resolution.')
        setStatusModal({ isOpen: true, type: 'success', message: 'Emergency Split Resolution successfully created and saved!' })
      } else {
        throw new Error('Unknown template type. Please select a valid document template.')
      }
    } catch (err) {
      console.error(err)
      const isNetworkError =
        err instanceof TypeError ||
        err?.message === 'Failed to fetch' ||
        err?.message === 'NetworkError when attempting to fetch resource.'
      const message = isNetworkError
        ? 'Could not reach the server. Make sure the Django backend is running on http://127.0.0.1:8000 and try again.'
        : (err.message || 'Failed to save to database.')
      setStatusModal({ isOpen: true, type: 'error', message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2.5))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))

  /* ── PDF Download ── */
  const handleDownloadPDF = async () => {
    if (isDownloading) return
    const exportEl = document.getElementById('pdf-export-area')
    if (!exportEl) return
    setIsDownloading(true)
    exportEl.classList.add('pdf-exporting')

    const filename = activeTab === 'noa_ntp' ? 'NOA_NTP_Document.pdf' : `${activeTab}_document.pdf`

    // Clone the export area so html2canvas can properly render it in the viewport flow
    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'
    wrapper.style.top = '0'
    wrapper.style.left = '0'
    wrapper.style.width = '8.5in'
    wrapper.style.zIndex = '-9999'
    wrapper.innerHTML = exportEl.innerHTML
    document.body.appendChild(wrapper)

    try {
      const isReso = activeTab.startsWith('reso_')
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: isReso ? [8.5, 13] : 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] }
        })
        .from(wrapper)
        .save()
    } catch (err) {
      console.error(err)
    } finally {
      document.body.removeChild(wrapper)
      exportEl.classList.remove('pdf-exporting')
      setIsDownloading(false)
    }
  }

  /* ── Word Download (.doc) ── */
  const handleDownloadDocx = () => {
    const exportEl = document.getElementById('pdf-export-area')
    if (!exportEl) return

    const isReso = activeTab.startsWith('reso_')
    const pageSize = isReso ? '8.5in 13in' : '8.5in 11in'
    
    // Create clean filename based on active template
    let docTitle = activeTab.toUpperCase().replace(/_/g, '-')
    let filename = `${docTitle}-${new Date().toISOString().split('T')[0]}.doc`

    // Capture exact React rendered HTML inside the export element
    let htmlContent = exportEl.innerHTML;

    // Remove print-page structural classes so Word uses standard page flow
    htmlContent = htmlContent.replace(/class="pdf-page-break[^"]*"/g, '');

    // Bulletproof Microsoft Office Word XML block to enforce paper size, margin & styles
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${docTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: ${pageSize};
            margin: 0.4in 0.4in 0.4in 0.4in;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 10pt;
            line-height: 1.15;
            color: #000000;
            background-color: #ffffff;
          }
          p {
            margin: 0;
            text-align: justify;
          }
          strong, b {
            font-weight: bold;
          }
          .dynamic-text {
            font-weight: bold;
          }
          ol, ul {
            margin: 6px 0;
            padding-left: 20px;
          }
          li {
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
    `;
    
    const footer = "</body></html>";
    const source = header + htmlContent + footer;

    // Initiate download blob
    const blob = new Blob(['\ufeff' + source], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /* ── Print ── */
  const handlePrint = () => {
    const exportEl = document.getElementById('pdf-export-area')
    if (!exportEl) return
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        message: 'Pop-up Blocked. Please allow pop-ups to enable printing.',
      })
      return
    }
    
    const isReso = activeTab.startsWith('reso_')
    const pageSize = isReso ? '8.5in 13in' : 'letter'
    const pageMinHeight = isReso ? '13in' : '11in'

    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>
        @page { size: ${pageSize} portrait; margin: 0; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; padding: 0; background: white; }
        .print-page { width: 8.5in; min-height: ${pageMinHeight}; padding: 0.4in; display: flex; flex-direction: column; page-break-after: always; break-after: page; }
        .print-page:last-child { page-break-after: avoid; break-after: avoid; }
        img { max-width: 100%; }
      </style></head><body>
      ${exportEl.innerHTML.replace(/class="pdf-page-break[^"]*"/g, '')}
      <script>
        window.focus();
        setTimeout(function() {
          window.print();
          window.close();
        }, 150);
      </script>
      </body></html>
    `)
    printWindow.document.close()
  }

  /* ── Resizer ── */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !mainRef.current) return
      const rect = mainRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      if (pct > 25 && pct < 75) setEditPanelWidth(pct)
    }
    const handleMouseUp = () => setIsResizing(false)
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div ref={mainRef} className="h-full flex overflow-hidden relative">

      {/* ── Hidden PDF/Print export area ── */}
      <div
        id="pdf-export-area"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none', zIndex: -1 }}
      >
        {activeTab === 'noa_ntp' ? (
          <>
            <div className="print-page" style={pageCardStyle}>
              <NOAContent data={formData} />
            </div>
            <div className="pdf-page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />
            <div className="print-page" style={pageCardStyle}>
              <NTPContent data={formData} />
            </div>
          </>
        ) : activeTab === 'reso_direct_acquisition' ? (
          <div className="print-page" style={longPageCardStyle}>
            <ResoDirectAcquisitionContent data={formData} />
          </div>
        ) : activeTab === 'reso_svp' ? (
          <div className="print-page" style={longPageCardStyle}>
            <ResoSVPContent data={formData} />
          </div>
        ) : activeTab === 'reso_lov' ? (
          <>
            <div className="print-page" style={longPageCardStyle}>
              <ResoLOVPage1 data={formData} />
            </div>
            <div className="pdf-page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />
            <div className="print-page" style={longPageCardStyle}>
              <ResoLOVPage2 data={formData} />
            </div>
          </>
        ) : activeTab === 'reso_emergency_split' ? (
          <div className="print-page" style={longPageCardStyle}>
            <ResoEmergencySplitContent data={formData} />
          </div>
        ) : (
          <div className="print-page" style={pageCardStyle}>
            <OfficialHeader />
          </div>
        )}
      </div>

      {/* ── Editing Panel ── */}
      <div
        style={{ width: `${editPanelWidth}%` }}
        className="h-full border-r border-slate-200 bg-slate-50/50 overflow-y-auto relative flex-shrink-0"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Editing Panel</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Fields update both documents in real time</p>
            </div>
            <button
              onClick={() => setIsSignatoriesModalOpen(true)}
              className="text-xs font-bold text-white bg-[#0B6623] hover:bg-[#09501b] px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#0B6623]/10"
            >
              <MdPerson className="w-3.5 h-3.5" />
              Signatories
            </button>
          </div>

          {activeTab === 'noa_ntp' && (
            <>
              {/* ── NOA FIELDS ── */}
              <SectionLabel title="Notice of Award" color="#0B6623" />

              <Field icon={MdCalendarToday} label="Document Date" id="noaDocDate" type="date"
                value={formData.noaDocDate} onChange={setField('noaDocDate')} />

              <SelectField icon={MdPerson} label="Greeting Salutation" id="noaNtpGreeting"
                value={formData.noaNtpGreeting} onChange={setField('noaNtpGreeting')}
                options={[
                  { value: "Ma'am/Sir", label: "Ma'am/Sir" },
                  { value: "Ma'am", label: "Ma'am" },
                  { value: "Sir", label: "Sir" }
                ]} />

              <Field icon={MdPerson} label="Name of Representative / Company" id="noaName"
                value={formData.noaName} onChange={setField('noaName')}
                placeholder="e.g. Juan Dela Cruz / ABC Corporation" />

              <Field icon={MdBusiness} label="Position" id="noaPosition"
                value={formData.noaPosition} onChange={setField('noaPosition')}
                placeholder="e.g. General Manager" />

              <Field icon={MdLocationOn} label="Address" id="noaAddress"
                value={formData.noaAddress} onChange={setField('noaAddress')}
                placeholder="e.g. 123 Main St, San Fernando, La Union" />

              <Field icon={MdDescription} label="Activity / Project Title" id="noaActivity"
                value={formData.noaActivity} onChange={setField('noaActivity')}
                placeholder="e.g. Supply of Office Supplies" />

              <Field icon={MdDescription} label="Procurement Item (WHAT?)" id="noaProcurementWhat"
                value={formData.noaProcurementWhat} onChange={setField('noaProcurementWhat')}
                placeholder="e.g. MEALS & SNACKS" />

              <Field icon={MdGavel} label="Mode of Procurement (MOP)" id="noaProcurementMop"
                value={formData.noaProcurementMop} onChange={setField('noaProcurementMop')}
                placeholder="e.g. DIRECT ACQUISITION" />

              <Field icon={MdCalendarToday} label="Date of Conduct" id="noaDate" type="date"
                value={formData.noaDate} onChange={setField('noaDate')} />

              <Field icon={TbCurrencyPeso} label="Amount" id="noaAmount"
                value={formData.noaAmount} onChange={setAmountField('noaAmount')}
                placeholder="e.g. 245765.00"
                hint="Enter the raw number (e.g. 245765.00). The system will automatically convert it to words." />

              {/* ── NTP FIELDS ── */}
              <SectionLabel title="Notice to Proceed" color="#7c3aed" />

              <Field icon={MdCalendarToday} label="Document Date" id="ntpDocDate" type="date"
                value={formData.ntpDocDate} onChange={setField('ntpDocDate')} />

              <Field icon={MdPerson} label="Name of Representative / Company" id="ntpName"
                value={formData.ntpName} onChange={setField('ntpName')}
                placeholder="e.g. Juan Dela Cruz / ABC Corporation" />

              <Field icon={MdBusiness} label="Position" id="ntpPosition"
                value={formData.ntpPosition} onChange={setField('ntpPosition')}
                placeholder="e.g. General Manager" />

              <Field icon={MdLocationOn} label="Address" id="ntpAddress"
                value={formData.ntpAddress} onChange={setField('ntpAddress')}
                placeholder="e.g. 123 Main St, San Fernando, La Union" />

              <Field icon={MdDescription} label="Activity / Project Title" id="ntpActivity"
                value={formData.ntpActivity} onChange={setField('ntpActivity')}
                placeholder="e.g. Supply of Office Supplies" />

              <Field icon={MdDescription} label="Procurement Item (WHAT?)" id="ntpProcurementWhat"
                value={formData.ntpProcurementWhat} onChange={setField('ntpProcurementWhat')}
                placeholder="e.g. MEALS & SNACKS" />

              <Field icon={MdGavel} label="Mode of Procurement (MOP)" id="ntpProcurementMop"
                value={formData.ntpProcurementMop} onChange={setField('ntpProcurementMop')}
                placeholder="e.g. DIRECT ACQUISITION" />

              <Field icon={MdCalendarToday} label="Date of Conduct" id="ntpDate" type="date"
                value={formData.ntpDate} onChange={setField('ntpDate')} />

              <Field icon={TbCurrencyPeso} label="Amount" id="ntpAmount"
                value={formData.ntpAmount} onChange={setAmountField('ntpAmount')}
                placeholder="e.g. 245765.00"
                hint="Enter the raw number (e.g. 245765.00). The system will automatically convert it to words." />

              {/* Copy NOA → NTP button */}
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  ntpName: prev.noaName,
                  ntpPosition: prev.noaPosition,
                  ntpAddress: prev.noaAddress,
                  ntpActivity: prev.noaActivity,
                  ntpDate: prev.noaDate,
                  ntpAmount: prev.noaAmount,
                }))}
                className="w-full border border-[#0B6623]/30 text-[#0B6623] text-xs font-bold py-2.5 rounded-xl hover:bg-[#0B6623]/5 active:scale-[0.98] transition-all"
              >
                ↓ Copy NOA fields to NTP
              </button>
            </>
          )}

          {activeTab === 'reso_direct_acquisition' && (
            <>
              <SectionLabel title="Resolution Details" color="#0B6623" />
              
              <Field icon={MdCalendarToday} label="Resolution Date" id="resoDate" type="date"
                value={formData.resoDate} onChange={setField('resoDate')} />
              
              <Field icon={MdBusiness} label="Awardee Company Name" id="resoCompany"
                value={formData.resoCompany} onChange={setField('resoCompany')}
                placeholder="e.g. LU OVERLOAD RESTAURANT..." />

              <Field icon={MdDescription} label="Items / Services" id="resoItems"
                value={formData.resoItems} onChange={setField('resoItems')}
                placeholder="e.g. MEALS AND SNACKS" />

              <Field icon={MdDescription} label="Meeting / Purpose" id="resoPurpose"
                value={formData.resoPurpose} onChange={setField('resoPurpose')}
                placeholder="e.g. MEETING FOR THE PREPARATION OF NWMC" />

              <Field icon={MdCalendarToday} label="Date of Conduct / Period" id="resoDateOfConduct"
                value={formData.resoDateOfConduct} onChange={setField('resoDateOfConduct')}
                placeholder="e.g. MARCH 2026 & CY2026 PLANS" />

              <Field icon={TbCurrencyPeso} label="Max ABC Amount" id="resoMaxAmount"
                value={formData.resoMaxAmount} onChange={setAmountField('resoMaxAmount')}
                placeholder="e.g. 200000.00"
                hint="For the WHEREAS clauses (e.g. 200,000.00)" />

              <Field icon={TbCurrencyPeso} label="Award Amount" id="resoAmount"
                value={formData.resoAmount} onChange={setAmountField('resoAmount')}
                placeholder="e.g. 32000.00"
                hint="Final awarded amount" />

              <Field icon={MdPerson} label="End-user/Rep. Name" id="resoEndUser"
                value={formData.resoEndUser} onChange={setField('resoEndUser')}
                placeholder="e.g. BEN B. RIOS" />
            </>
          )}

          {activeTab === 'reso_svp' && (
            <>
              <SectionLabel title="SVP Resolution Details" color="#0B6623" />
              
              <Field icon={MdCalendarToday} label="Resolution Date" id="resoDateSVP" type="date"
                value={formData.resoDate} onChange={setField('resoDate')} />
              
              <Field icon={MdBusiness} label="Awardee Company Name" id="resoCompanySVP"
                value={formData.resoCompany} onChange={setField('resoCompany')}
                placeholder="e.g. ABC SUPPLIES..." />

              <Field icon={MdDescription} label="Specific Goods / Items" id="resoItemsSVP"
                value={formData.resoItems} onChange={setField('resoItems')}
                placeholder="e.g. OFFICE SUPPLIES" />

              <Field icon={MdDescription} label="Activity / Purpose" id="resoPurposeSVP"
                value={formData.resoPurpose} onChange={setField('resoPurpose')}
                placeholder="e.g. 1ST QUARTER REQUIREMENTS" />

              <Field icon={TbCurrencyPeso} label="Award Amount" id="resoAmountSVP"
                value={formData.resoAmount} onChange={setAmountField('resoAmount')}
                placeholder="e.g. 50000.00"
                hint="Final awarded amount" />

              <Field icon={MdPerson} label="End-user/Rep. Name" id="resoEndUserSVP"
                value={formData.resoEndUser} onChange={setField('resoEndUser')}
                placeholder="e.g. BEN B. RIOS" />

            </>
          )}

          {activeTab === 'reso_lov' && (
            <>
              <SectionLabel title="LOV Resolution Details" color="#0B6623" />
              <Field icon={MdCalendarToday} label="Resolution Date" id="resoDateLOV" type="date"
                value={formData.resoDate} onChange={setField('resoDate')} />
              <Field icon={MdBusiness} label="Awardee Company Name" id="resoCompanyLOV"
                value={formData.resoCompany} onChange={setField('resoCompany')}
                placeholder="e.g. ABC HOTEL..." />
              <Field icon={MdBusiness} label="Lessor/Supplier 1" id="lovLessor1"
                value={formData.lovLessor1} onChange={setField('lovLessor1')}
                placeholder="e.g. LU OVERLOAD RESTAURANT AND CATERING SERVICES" />
              <Field icon={MdBusiness} label="Lessor/Supplier 2" id="lovLessor2"
                value={formData.lovLessor2} onChange={setField('lovLessor2')}
                placeholder="e.g. HOTEL 2" />
              <Field icon={MdBusiness} label="Lessor/Supplier 3" id="lovLessor3"
                value={formData.lovLessor3} onChange={setField('lovLessor3')}
                placeholder="e.g. HOTEL 3" />
              <Field icon={MdDescription} label="Activity Name" id="resoPurposeLOV"
                value={formData.resoPurpose} onChange={setField('resoPurpose')}
                placeholder="e.g. YEAR-END ASSESSMENT" />
              <Field icon={MdCalendarToday} label="Date of Activity" id="resoDateOfConductLOV"
                value={formData.resoDateOfConduct} onChange={setField('resoDateOfConduct')}
                placeholder="e.g. DECEMBER 15-16, 2026" />
              <Field icon={TbCurrencyPeso} label="ABC Amount (PPMP-PROPOSAL-PR)" id="resoMaxAmountLOV"
                value={formData.resoMaxAmount} onChange={setAmountField('resoMaxAmount')}
                placeholder="e.g. 150000.00" hint="Total Approved Budget" />
              <Field icon={TbCurrencyPeso} label="Award Amount (Quoted)" id="resoAmountLOV"
                value={formData.resoAmount} onChange={setAmountField('resoAmount')}
                placeholder="e.g. 145000.00" hint="Final awarded amount" />
              <Field icon={MdAssessment} label="Rating Score" id="resoRatingLOV"
                value={formData.resoRating} onChange={setField('resoRating')}
                placeholder="e.g. 98.5%" hint="Factor rating result" />

              <Field icon={MdPerson} label="End-user/Rep. Name" id="resoEndUserLOV"
                value={formData.resoEndUser} onChange={setField('resoEndUser')}
                placeholder="e.g. BEN B. RIOS" />
            </>
          )}

          {activeTab === 'reso_emergency_split' && (
            <>
              <SectionLabel title="Emergency Resolution Details" color="#0B6623" />
              <Field icon={MdCalendarToday} label="Resolution Date" id="resoDateSplit" type="date"
                value={formData.resoDate} onChange={setField('resoDate')} />
              <Field icon={MdBusiness} label="Awardee Company Name" id="resoCompanySplit"
                value={formData.resoCompany} onChange={setField('resoCompany')}
                placeholder="e.g. ABC SUPPLIES..." />
              <Field icon={MdDescription} label="Specific Goods / Items" id="resoItemsSplit"
                value={formData.resoItems} onChange={setField('resoItems')}
                placeholder="e.g. MEALS AND SNACKS" />
              <Field icon={MdDescription} label="Activity Name" id="resoPurposeSplit"
                value={formData.resoPurpose} onChange={setField('resoPurpose')}
                placeholder="e.g. EMERGENCY RESPONSE MEETING" />
              <Field icon={MdCalendarToday} label="Date of Activity" id="resoDateOfConductSplit"
                value={formData.resoDateOfConduct} onChange={setField('resoDateOfConduct')}
                placeholder="e.g. JULY 14, 2026" />
              <Field icon={TbCurrencyPeso} label="Amount Based on PR" id="resoMaxAmountSplit"
                value={formData.resoMaxAmount} onChange={setAmountField('resoMaxAmount')}
                placeholder="e.g. 80000.00" hint="PR Budget" />
              <Field icon={TbCurrencyPeso} label="Award Amount" id="resoAmountSplit"
                value={formData.resoAmount} onChange={setAmountField('resoAmount')}
                placeholder="e.g. 78000.00" hint="Final awarded amount" />

              <Field icon={MdPerson} label="End-user/Rep. Name" id="resoEndUserSplit"
                value={formData.resoEndUser} onChange={setField('resoEndUser')}
                placeholder="e.g. BEN B. RIOS" />
            </>
          )}

          {/* Generate button */}
          <button 
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={isSaving}
            className="w-full bg-[#0B6623] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#0B6623]/20 hover:bg-[#09501c] active:scale-[0.98] text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? 'SAVING...' : 'GENERATE DOCUMENT'}
          </button>
        </div>
      </div>

      {/* ── Resizer Bar ── */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className={`w-1.5 h-full cursor-col-resize hover:bg-[#0B6623]/20 flex-shrink-0 z-30 transition-colors ${isResizing ? 'bg-[#0B6623]/40' : 'bg-transparent'}`}
      />

      {/* ── Preview Panel ── */}
      <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">

        {/* Zoom Controls */}
        <div className="absolute top-6 left-8 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl border border-slate-200 p-1.5 flex items-center space-x-1 z-40">
          <button onClick={handleZoomOut} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 transition-all active:scale-90" title="Zoom Out">
            <MdRemove className="w-5 h-5" />
          </button>
          <div className="px-3 py-1 bg-slate-50 rounded-lg flex flex-col items-center min-w-[70px]">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Scale</span>
            <span className="text-xs font-mono font-bold text-[#0B6623]">{Math.round(zoomLevel * 100)}%</span>
          </div>
          <button onClick={handleZoomIn} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-emerald-500 transition-all active:scale-90" title="Zoom In">
            <MdAdd className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Top Right */}
        <div className="absolute top-6 right-8 flex items-center gap-3 z-20">
          {/* Download Word Button */}
          <button
            onClick={handleDownloadDocx}
            title="Download as Microsoft Word (.doc)"
            className="p-3 bg-white shadow-md rounded-xl hover:bg-slate-50 border border-slate-200 flex items-center justify-center transition-all active:scale-95 text-[#2b579a]"
          >
            <MdDescription className="w-6 h-6" />
          </button>
          
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            title="Save to Computer (PDF)"
            className="p-3 bg-white shadow-md rounded-xl hover:bg-slate-50 border border-slate-200 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center transition-all active:scale-95 text-[#0B6623]"
          >
            {isDownloading
              ? <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              : <MdFileDownload className="w-6 h-6" />
            }
          </button>
        </div>

        {/* Floating Buttons */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
          <button className="flex flex-row-reverse items-center bg-[#E8F5E9] text-[#0B6623] p-3 rounded-full shadow-lg font-bold border border-[#0B6623]/20 hover:bg-[#d0e8d3] active:scale-95 transition-all duration-300 group overflow-hidden w-[48px] hover:w-[160px]">
            <MdSave className="w-6 h-6 min-w-[24px]" />
              <span className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-xs">Save as Draft</span>
          </button>
          <button onClick={handlePrint} className="flex flex-row-reverse items-center bg-[#0B6623] text-white p-3 rounded-full shadow-lg font-bold hover:bg-[#09501c] active:scale-95 transition-all duration-300 group overflow-hidden w-[48px] hover:w-[160px]">
            <MdPrint className="w-6 h-6 min-w-[24px]" />
              <span className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-xs">Print Document</span>
          </button>
        </div>

        {/* Document Preview */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-10 flex flex-col items-center">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              transition: 'transform 0.2s',
              marginBottom: `${(zoomLevel - 1) * 800}px`,
            }}
          >
            {activeTab === 'noa_ntp' ? (
              <>
                <div
                  id="noa-preview-page"
                  className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                  style={{ ...pageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
                >
                  <NOAContent data={formData} />
                </div>
                <div
                  id="ntp-preview-page"
                  className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                  style={{ ...pageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
                >
                  <NTPContent data={formData} />
                </div>
              </>
            ) : activeTab === 'reso_direct_acquisition' ? (
              <div
                id="reso-direct-preview-page"
                className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                style={{ ...longPageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
              >
                <ResoDirectAcquisitionContent data={formData} />
              </div>
            ) : activeTab === 'reso_svp' ? (
              <div
                id="reso-svp-preview-page"
                className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                style={{ ...longPageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
              >
                <ResoSVPContent data={formData} />
              </div>
            ) : activeTab === 'reso_lov' ? (
              <>
                <div
                  id="reso-lov-preview-page-1"
                  className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                  style={{ ...longPageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
                >
                  <ResoLOVPage1 data={formData} />
                </div>
                <div
                  id="reso-lov-preview-page-2"
                  className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                  style={{ ...longPageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
                >
                  <ResoLOVPage2 data={formData} />
                </div>
              </>
            ) : activeTab === 'reso_emergency_split' ? (
              <div
                id="reso-emergency-split-preview-page"
                className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                style={{ ...longPageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
              >
                <ResoEmergencySplitContent data={formData} />
              </div>
            ) : (
              <div
                id="single-preview-page"
                className={showMissingDocCorners ? 'missing-doc-corner' : ''}
                style={{ ...pageCardStyle, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
              >
                <OfficialHeader />
                <div className="w-full space-y-12 mt-12">
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                </div>
                <OfficialFooter />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Document Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdDescription className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Generate Document?</h3>
            <p className="text-slate-500 text-sm mb-8">Are you sure you want to generate and save this document to the database?</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsConfirmModalOpen(false)} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateDocument}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center"
              >
                {isSaving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal (Success/Error) */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            {statusModal.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdCheckCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdError className="w-8 h-8" />
              </div>
            )}
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {statusModal.type === 'success' ? 'Success!' : 'Error'}
            </h3>
            <p className="text-slate-500 text-sm mb-8">{statusModal.message}</p>
            
            <button 
              onClick={() => setStatusModal({ ...statusModal, isOpen: false })} 
              className={`w-full py-3 text-white font-bold rounded-xl transition-colors shadow-lg ${
                statusModal.type === 'success' 
                  ? 'bg-[#0B6623] hover:bg-[#09501b] shadow-[#0B6623]/20' 
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Signatory Selector Modal */}
      {isSignatoriesModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Change Signatories</h3>
                <p className="text-xs text-slate-500 mt-1">Select from official signatories or type custom names.</p>
              </div>
              <button 
                onClick={() => setIsSignatoriesModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {activeTab === 'noa_ntp' ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">NOA & NTP Signatory (HOPE)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Signatory</label>
                      <select 
                        onChange={e => {
                          const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                          if (selected) {
                            setFormData(prev => ({
                              ...prev,
                              noaHopeName: selected.name,
                              noaHopeDesignation: selected.designation,
                              noaHopeDesignationNtp: selected.designation
                            }))
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                      >
                        <option value="">-- Choose from List --</option>
                        {dbSignatories.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Or Type Custom Name</label>
                      <input 
                        type="text" 
                        value={formData.noaHopeName} 
                        onChange={e => setField('noaHopeName')(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Designation (NOA)</label>
                      <input 
                        type="text" 
                        value={formData.noaHopeDesignation} 
                        onChange={e => setField('noaHopeDesignation')(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Designation (NTP)</label>
                      <input 
                        type="text" 
                        value={formData.noaHopeDesignationNtp} 
                        onChange={e => setField('noaHopeDesignationNtp')(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chairperson */}
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">RESO Chairperson</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Select</label>
                        <select 
                          onChange={e => {
                            const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                            if (selected) {
                              setFormData(prev => ({
                                ...prev,
                                resoChairpersonName: selected.name,
                                resoChairpersonDesignation: selected.designation
                              }))
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700"
                        >
                          <option value="">-- Choose --</option>
                          {dbSignatories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Name</label>
                        <input 
                          type="text" 
                          value={formData.resoChairpersonName} 
                          onChange={e => setField('resoChairpersonName')(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Designation</label>
                        <input 
                          type="text" 
                          value={formData.resoChairpersonDesignation} 
                          onChange={e => setField('resoChairpersonDesignation')(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vice Chairperson */}
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">RESO Vice Chairperson</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Select</label>
                        <select 
                          onChange={e => {
                            const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                            if (selected) {
                              setFormData(prev => ({
                                ...prev,
                                resoViceName: selected.name,
                                resoViceDesignation: selected.designation
                              }))
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700"
                        >
                          <option value="">-- Choose --</option>
                          {dbSignatories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Name</label>
                        <input 
                          type="text" 
                          value={formData.resoViceName} 
                          onChange={e => setField('resoViceName')(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Designation</label>
                        <input 
                          type="text" 
                          value={formData.resoViceDesignation} 
                          onChange={e => setField('resoViceDesignation')(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">RESO Committee Members (4)</h4>
                    
                    {/* Member 1 */}
                    <div className="border-b border-slate-200/60 pb-3 last:border-0 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Member 1</label>
                        <select 
                          onChange={e => {
                            const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                            if (selected) {
                              setFormData(prev => ({ ...prev, resoMember1Name: selected.name, resoMember1Designation: selected.designation }))
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="">-- Choose --</option>
                          {dbSignatories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2 flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                          <input type="text" value={formData.resoMember1Name} onChange={e => setField('resoMember1Name')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Designation</label>
                          <input type="text" value={formData.resoMember1Designation} onChange={e => setField('resoMember1Designation')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                      </div>
                    </div>

                    {/* Member 2 */}
                    <div className="border-b border-slate-200/60 pb-3 last:border-0 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Member 2</label>
                        <select 
                          onChange={e => {
                            const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                            if (selected) {
                              setFormData(prev => ({ ...prev, resoMember2Name: selected.name, resoMember2Designation: selected.designation }))
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="">-- Choose --</option>
                          {dbSignatories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2 flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                          <input type="text" value={formData.resoMember2Name} onChange={e => setField('resoMember2Name')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Designation</label>
                          <input type="text" value={formData.resoMember2Designation} onChange={e => setField('resoMember2Designation')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                      </div>
                    </div>

                    {/* Member 3 */}
                    <div className="border-b border-slate-200/60 pb-3 last:border-0 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Member 3</label>
                        <select 
                          onChange={e => {
                            const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                            if (selected) {
                              setFormData(prev => ({ ...prev, resoMember3Name: selected.name, resoMember3Designation: selected.designation }))
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="">-- Choose --</option>
                          {dbSignatories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2 flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                          <input type="text" value={formData.resoMember3Name} onChange={e => setField('resoMember3Name')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Designation</label>
                          <input type="text" value={formData.resoMember3Designation} onChange={e => setField('resoMember3Designation')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                      </div>
                    </div>

                    {/* Member 4 */}
                    <div className="border-b border-slate-200/60 pb-3 last:border-0 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Member 4</label>
                        <select 
                          onChange={e => {
                            const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                            if (selected) {
                              setFormData(prev => ({ ...prev, resoMember4Name: selected.name, resoMember4Designation: selected.designation }))
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="">-- Choose --</option>
                          {dbSignatories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2 flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                          <input type="text" value={formData.resoMember4Name} onChange={e => setField('resoMember4Name')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Designation</label>
                          <input type="text" value={formData.resoMember4Designation} onChange={e => setField('resoMember4Designation')(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approved By */}
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">RESO Approved By (HOPE)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Select</label>
                        <select 
                          onChange={e => {
                            const selected = dbSignatories.find(s => s.id === parseInt(e.target.value))
                            if (selected) {
                              setFormData(prev => ({
                                ...prev,
                                resoApprovedByName: selected.name,
                                resoApprovedByDesignation: selected.designation
                              }))
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700"
                        >
                          <option value="">-- Choose --</option>
                          {dbSignatories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Name</label>
                        <input 
                          type="text" 
                          value={formData.resoApprovedByName} 
                          onChange={e => setField('resoApprovedByName')(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Designation</label>
                        <input 
                          type="text" 
                          value={formData.resoApprovedByDesignation} 
                          onChange={e => setField('resoApprovedByDesignation')(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsSignatoriesModalOpen(false)} 
                className="px-5 py-2.5 rounded-xl font-medium bg-[#0B6623] hover:bg-[#09501b] text-white transition-all shadow-sm shadow-[#0B6623]/20 cursor-pointer text-sm font-semibold"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Templates