import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MdVisibility, MdPrint, MdRefresh, MdError, MdDescription, MdSearch, MdClose, MdAdd, MdRemove, MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { fetchAllDocuments } from '../utils/supabaseServices'

/* ─────────────────────────────────────────────
   Official Header (matching templates.jsx)
───────────────────────────────────────────── */
const OfficialHeader = ({ darLogo, bagongPilipinasLogo }) => (
  <div
    style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '10px',
      borderBottom: '1px solid black',
      flexShrink: 0,
    }}
  >
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
   Official Footer (matching templates.jsx)
───────────────────────────────────────────── */
const OfficialFooter = ({ darLogo, socotecLogo }) => (
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
   Page card styles (1:1 from templates.jsx)
───────────────────────────────────────────── */
const pageCardStyle = {
  width: '8.5in',
  height: '11in',
  background: 'white',
  position: 'relative',
  padding: '0.4in',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  overflow: 'hidden',
}

const longPageCardStyle = {
  width: '8.5in',
  minHeight: '13in',
  height: '13in',
  background: 'white',
  position: 'relative',
  padding: '0.4in',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  overflow: 'visible',
}

const pageContentStyle = {
  textAlign: 'justify',
  fontFamily: '"Times New Roman", Times, serif',
  fontSize: '11pt',
  lineHeight: '1.15',
  color: '#000',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '24px',
  marginLeft: '0.6in',
  marginRight: '0.6in',
  flexGrow: 1,
}

const val = (v, fallback) => v && String(v).trim() ? String(v) : fallback

const formatOfficialDate = (dateString, uppercase = false) => {
  if (!dateString) return ''
  const parts = String(dateString).split('-')
  if (parts.length === 3) {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const day = parseInt(parts[2], 10)
    const month = months[parseInt(parts[1], 10) - 1]
    const year = parts[0]
    const formatted = `${day} ${month} ${year}`
    return uppercase ? formatted.toUpperCase() : formatted
  }
  return uppercase ? dateString.toUpperCase() : dateString
}

const convertNumberToWords = (amount) => {
  if (!amount || isNaN(amount)) return ''
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  const convertBlock = (num) => {
    if (num === 0) return ''
    if (num < 20) return a[num]
    if (num < 100) return b[Math.floor(num/10)] + (num%10!==0?' '+a[num%10]:'')
    return a[Math.floor(num/100)]+' Hundred'+(num%100!==0?' '+convertBlock(num%100):'')
  }
  const convertLarge = (num) => {
    if (num===0) return 'Zero'
    let result=''
    const trillions=Math.floor(num/1000000000000); if(trillions>0) result+=convertBlock(trillions)+' Trillion '
    const billions=Math.floor((num%1000000000000)/1000000000); if(billions>0) result+=convertBlock(billions)+' Billion '
    const millions=Math.floor((num%1000000000)/1000000); if(millions>0) result+=convertBlock(millions)+' Million '
    const thousands=Math.floor((num%1000000)/1000); if(thousands>0) result+=convertBlock(thousands)+' Thousand '
    const remainder=num%1000; if(remainder>0) result+=convertBlock(remainder)
    return result.trim()
  }
  const parts = Number(amount).toFixed(2).split('.')
  const pesos = parseInt(parts[0],10)
  const centavos = parseInt(parts[1],10)
  let text = convertLarge(pesos)+' Pesos'
  if(centavos>0) text+=' and '+convertLarge(centavos)+' Centavos'
  return text
}

const formatAmountDisplay = (formattedNumberStr) => {
  if (!formattedNumberStr) return 'Two Hundred Thirty-Seven Thousand Four Hundred Forty Pesos (₱ 237,440.00) only'
  const rawNum = parseFloat(String(formattedNumberStr).replace(/,/g,''))
  if (isNaN(rawNum)) return formattedNumberStr
  const words = convertNumberToWords(rawNum)
  const displayNum = rawNum.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return `${words} (₱ ${displayNum}) only`
}

const formatResoAmount = (formattedNumberStr, includeOnly=true, uppercase=true) => {
  if (!formattedNumberStr) {
    if (includeOnly) return 'THIRTY-TWO THOUSAND PESOS (₱32,000.00) ONLY.'
    return 'Two Hundred Thousand Pesos (₱200,000.00)'
  }
  const rawNum = parseFloat(String(formattedNumberStr).replace(/,/g,''))
  if (isNaN(rawNum)) return formattedNumberStr
  const words = convertNumberToWords(rawNum)
  const displayNum = rawNum.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  let text = `${words} (₱${displayNum})`
  if (includeOnly) text += ' only.'
  return uppercase ? text.toUpperCase() : text
}

/* ─────────────────────────────────────────────
   Map API raw row → formData shape for content components
───────────────────────────────────────────── */
const mapRawToFormData = (item) => {
  const raw = item?.raw || {}
  const docTypeKey = item?.docTypeKey || ''

  if (docTypeKey === 'noa') {
    return {
      noaNtpGreeting: raw.greeting || "Ma'am/Sir",
      noaDocDate: raw.date_created || raw.doc_date || '',
      noaName: raw.name || raw.company_name || item?.name || '',
      noaPosition: raw.position || raw.noaPosition || '',
      noaAddress: raw.address || '',
      noaActivity: raw.activity || raw.purpose || raw.title || '',
      noaProcurementWhat: raw.procurement_what || raw.what || raw.items_services || '',
      noaProcurementMop: raw.procurement_mop || raw.mop || raw.mode_of_procurement || '',
      noaDate: raw.date_of_conduct || raw.date || '',
      noaAmount: raw.award_amount != null ? String(raw.award_amount) : (raw.amount != null ? String(raw.amount) : ''),
      noaHopeName: raw.hope_name || 'MARIA ANA B. FRANCISCO, CESO III',
      noaHopeDesignation: raw.hope_designation || 'Head of Procuring Entity/Regional Director',
    }
  }

  if (docTypeKey === 'ntp') {
    return {
      noaNtpGreeting: raw.greeting || "Ma'am/Sir",
      ntpDocDate: raw.date_created || raw.doc_date || '',
      ntpName: raw.name || raw.company_name || item?.name || '',
      ntpPosition: raw.position || '',
      ntpAddress: raw.address || '',
      ntpActivity: raw.activity || raw.purpose || raw.title || '',
      ntpProcurementWhat: raw.procurement_what || raw.what || '',
      ntpProcurementMop: raw.procurement_mop || raw.mop || '',
      ntpDate: raw.date_of_conduct || raw.date || '',
      ntpAmount: raw.award_amount != null ? String(raw.award_amount) : (raw.amount != null ? String(raw.amount) : ''),
      noaHopeName: raw.hope_name || 'MARIA ANA B. FRANCISCO, CESO III',
      noaHopeDesignationNtp: raw.hope_designation_ntp || 'Regional Director',
    }
  }

  // Shared reso fields
  const resoBase = {
    resoDate: raw.reso_date || raw.date_created || '',
    resoCompany: raw.company_name || raw.company || item?.name || '',
    resoItems: raw.items || raw.reso_items || raw.goods || '',
    resoPurpose: raw.purpose || raw.activity || raw.title || '',
    resoDateOfConduct: raw.date_of_conduct || raw.date_of_conductation || '',
    resoAmount: raw.award_amount != null ? String(raw.award_amount) : '',
    resoMaxAmount: raw.max_amount != null ? String(raw.max_amount) : (raw.abc_amount != null ? String(raw.abc_amount) : ''),
    resoRating: raw.rating_score || raw.reso_rating || '',
    resoEndUser: raw.end_user || raw.reso_end_user || '',
    lovLessor1: raw.lov_lessor_1 || '',
    lovLessor2: raw.lov_lessor_2 || '',
    lovLessor3: raw.lov_lessor_3 || '',
    resoChairpersonName: raw.chairperson_name || 'ATTY. GLAIZA MAE MASAOY-ONIA',
    resoChairpersonDesignation: raw.chairperson_designation || 'Chairperson',
    resoViceName: raw.vice_name || 'NENITA C. MADRIAGA',
    resoViceDesignation: raw.vice_designation || 'Vice Chairperson',
    resoMember1Name: raw.member1_name || 'ATTY. ROMIN A. CADIENTE',
    resoMember1Designation: raw.member1_designation || 'Member',
    resoMember2Name: raw.member2_name || 'BEN B. RIOS',
    resoMember2Designation: raw.member2_designation || 'Member',
    resoMember3Name: raw.member3_name || 'BOBBY S. BAUTISTA',
    resoMember3Designation: raw.member3_designation || 'Member',
    resoMember4Name: raw.member4_name || 'BOBBY S. BALTAZAR',
    resoMember4Designation: raw.member4_designation || 'Member',
    resoApprovedByName: raw.approved_by_name || 'MARIA ANA B. FRANCISCO, CESO III',
    resoApprovedByDesignation: raw.approved_by_designation || 'Head of Procuring Entity',
  }
  return resoBase
}

/* ─────────────────────────────────────────────
   Content Components (1:1 from templates.jsx)
───────────────────────────────────────────── */
const NOAContent = ({ data, darLogo, bagongPilipinasLogo, socotecLogo }) => {
  const name = val(data.noaName, 'NAME OF REPRESENTATIVE / NAME OF COMPANY')
  const position = val(data.noaPosition, 'Position /')
  const address = val(data.noaAddress, 'Narciso St, Angeles City, 2009 Pampanga')
  const activity = val(data.noaActivity, '(ACTIVITY OR PROJECT TITLE)')
  const date = data.noaDate ? formatOfficialDate(data.noaDate, false) : '(DATE OF CONDUCT)'
  const docDate = data.noaDocDate ? formatOfficialDate(data.noaDocDate, false) : '13 November 2025'
  const amount = data.noaAmount ? formatAmountDisplay(data.noaAmount) : 'Two Hundred Thirty-Seven Thousand Four Hundred Forty Pesos (₱ 237,440.00) only'
  const procurementWhat = val(data.noaProcurementWhat, 'WHAT?').toUpperCase()
  const procurementMop = val(data.noaProcurementMop, 'MOP').toUpperCase()

  return (
    <>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
      <div style={pageContentStyle}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: '900', fontSize: '20pt', margin: 0 }}>NOTICE OF AWARD</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
          <p style={{ margin: 0 }}>{docDate}</p>
          <p style={{ fontWeight: '700', margin: '24px 0 0' }}>{name}</p>
          <p style={{ fontWeight: '700', margin: 0 }}>{position}</p>
          <p style={{ fontStyle: 'italic', margin: 0 }}>{address}</p>
        </div>
        <p style={{ margin: 0 }}>Dear <strong style={{ fontStyle: 'italic' }}>{val(data.noaNtpGreeting, "Ma'am/Sir")},</strong></p>
        <p style={{ margin: 0, textAlign: 'justify' }}>
          Please be informed that, upon the recommendation of the Regional Bids and Award Committee (RBAC) and as a result of thorough review based on existing laws, <span style={{ textDecoration: 'underline' }}>PhilGEPS</span>, and Procurement under the Republic Act 12009 also known as the New Government Procurement Act, the Department of Agrarian Reform – Regional Office I, is awarding the Contract to{' '}
          <strong><em>{name}</em></strong> for the{' '}
          <strong>PROCUREMENT OF {procurementWhat} THROUGH {procurementMop} FOR THE {activity} ON {date}</strong>{' '}
          in the amount of <strong><em>{amount}</em>,</strong> inclusive of all taxes and other lawful charges.
        </p>
        <p style={{ margin: 0, textAlign: 'justify' }}>
          Therefore, within ten (10) days from receipt of this Notice of Award, you must enter into a contract with us formally. Failure to enter into said contract shall constitute sufficient grounds for cancellation of said award and forfeiture of your Bid Security, if applicable.
        </p>
        <p style={{ margin: 0, textAlign: 'justify' }}>
          Please return the original copy of this Notice duly signed by you to DAR Regional Office I, through the RBAC Secretariat, located at the Northgate Square, <span style={{ textDecoration: 'underline' }}>Añes</span> Bldg., <span style={{ textDecoration: 'underline' }}>Carlatan</span>, City of San Fernando, La Union.
        </p>
        <div>
          <p style={{ margin: 0 }}>Very truly yours,</p>
          <p style={{ fontWeight: '700', margin: '48px 0 0' }}>{val(data.noaHopeName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
          <p style={{ fontStyle: 'italic', fontSize: '12px', margin: 0 }}>{val(data.noaHopeDesignation, 'Head of Procuring Entity/Regional Director')}</p>
        </div>
        <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
          <p style={{ fontWeight: '700', fontStyle: 'italic', textDecoration: 'underline', margin: '0 0 16px' }}>CONFORME :</p>
          <p style={{ margin: '0 0 24px' }}>Acknowledge date of receipt and acceptance of this Notice ___________________________</p>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: '50%' }}><p style={{ margin: 0 }}>Name of Bidder/Representative of the bidder</p></div>
            <div style={{ width: '50%', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid black', width: '90%', margin: '0 auto 2px', height: '14px' }}></div>
              <p style={{ margin: 0, fontSize: '11pt' }}>Printed Name &amp; Signature</p>
            </div>
          </div>
        </div>
      </div>
      <OfficialFooter darLogo={darLogo} socotecLogo={socotecLogo} />
    </>
  )
}

const NTPContent = ({ data, darLogo, bagongPilipinasLogo, socotecLogo }) => {
  const name = val(data.ntpName, 'NAME OF REPRESENTATIVE / NAME OF COMPANY')
  const position = val(data.ntpPosition, 'Position /')
  const address = val(data.ntpAddress, 'Narciso St, Angeles City, 2009 Pampanga')
  const activity = val(data.ntpActivity, '(ACTIVITY OR PROJECT TITLE)')
  const date = data.ntpDate ? formatOfficialDate(data.ntpDate, false) : '(DATE OF CONDUCT)'
  const docDate = data.ntpDocDate ? formatOfficialDate(data.ntpDocDate, true) : '10 NOVEMBER 2025'
  const amount = data.ntpAmount ? formatAmountDisplay(data.ntpAmount) : 'Two Hundred Thirty-Seven Thousand Four Hundred Forty Pesos (₱ 237,440.00) only'
  const procurementWhat = val(data.ntpProcurementWhat, 'WHAT?').toUpperCase()
  const procurementMop = val(data.ntpProcurementMop, 'MOP').toUpperCase()

  return (
    <>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
      <div style={pageContentStyle}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: '900', fontSize: '20pt', margin: 0 }}>NOTICE TO PROCEED</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
          <p style={{ margin: 0 }}>{docDate}</p>
          <p style={{ fontWeight: '700', margin: '24px 0 0' }}>{name}</p>
          <p style={{ fontWeight: '700', margin: 0 }}>{position}</p>
          <p style={{ fontStyle: 'italic', margin: 0 }}>{address}</p>
        </div>
        <p style={{ margin: 0 }}>Dear <strong style={{ fontStyle: 'italic' }}>{val(data.noaNtpGreeting, "Ma'am/Sir")},</strong></p>
        <p style={{ margin: 0, textAlign: 'justify' }}>
          Pursuant to the result of the final evaluation made on the proposal submitted and the contract having been approved and notarized; <strong>NOTICE</strong> is hereby given to{' '}
          <strong><em>{name}</em></strong> for the{' '}
          <strong>PROCUREMENT OF {procurementWhat} THROUGH {procurementMop} FOR THE {activity} ON {date}</strong>{' '}
          in the amount of <strong><em>{amount}</em>,</strong> inclusive of all taxes and other lawful charges.
        </p>
        <p style={{ margin: 0, textAlign: 'justify' }}>
          Upon receipt of this notice, you are responsible for performing the service under the terms and conditions provided in the signed and received <strong>Purchase Order/Contract</strong> of the aforementioned activity.
        </p>
        <p style={{ margin: 0, textAlign: 'justify' }}>
          Please return the original copy of this Notice duly signed by you to DAR Regional Office I, through the RBAC Secretariat, located at the Northgate Square, <span style={{ textDecoration: 'underline' }}>Añes</span> Bldg., <span style={{ textDecoration: 'underline' }}>Carlatan</span>, City of San Fernando, La Union.
        </p>
        <div>
          <p style={{ margin: 0 }}>Very truly yours,</p>
          <p style={{ fontWeight: '700', margin: '48px 0 0' }}>{val(data.noaHopeName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
          <p style={{ fontSize: '12px', margin: 0 }}>{val(data.noaHopeDesignationNtp, 'Regional Director')}</p>
        </div>
        <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
          <p style={{ fontWeight: '700', fontStyle: 'italic', textDecoration: 'underline', margin: '0 0 16px' }}>CONFORME :</p>
          <p style={{ margin: '0 0 24px' }}>Acknowledge date of receipt and acceptance of this Notice ___________________________</p>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: '50%' }}><p style={{ margin: 0 }}>Name of Bidder/Representative of the bidder</p></div>
            <div style={{ width: '50%', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid black', width: '90%', margin: '0 auto 2px', height: '14px' }}></div>
              <p style={{ margin: 0, fontSize: '11pt' }}>Printed Name &amp; Signature</p>
            </div>
          </div>
        </div>
      </div>
      <OfficialFooter darLogo={darLogo} socotecLogo={socotecLogo} />
    </>
  )
}

const ResoSignatoryBlock = ({ data }) => (
  <div style={{ marginTop: '4px' }}>
    <div style={{ textAlign: 'center', marginBottom: '6px' }}>
      <p style={{ fontWeight: '700', margin: '14px 0 0 0' }}>{val(data.resoChairpersonName, 'ATTY. GLAIZA MAE MASAOY-ONIA')}</p>
      <p style={{ margin: 0 }}>{val(data.resoChairpersonDesignation, 'Chairperson')}</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '6px' }}>
      <div style={{ width: '30%' }}>
        <p style={{ fontWeight: '700', margin: '14px 0 0 0' }}>{val(data.resoViceName, 'NENITA C. MADRIAGA')}</p>
        <p style={{ margin: 0 }}>{val(data.resoViceDesignation, 'Vice Chairperson')}</p>
      </div>
      <div style={{ width: '30%' }}>
        <p style={{ fontWeight: '700', margin: '14px 0 0 0' }}>{val(data.resoMember1Name, 'ATTY. ROMIN A. CADIENTE')}</p>
        <p style={{ margin: 0 }}>{val(data.resoMember1Designation, 'Member')}</p>
      </div>
      <div style={{ width: '30%' }}>
        <p style={{ fontWeight: '700', margin: '14px 0 0 0' }}>{val(data.resoMember2Name, 'BEN B. RIOS')}</p>
        <p style={{ margin: 0 }}>{val(data.resoMember2Designation, 'Member')}</p>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '6px' }}>
      <div style={{ width: '30%' }}>
        <p style={{ fontWeight: '700', margin: '14px 0 0 0' }}>{val(data.resoMember3Name, 'BOBBY S. BAUTISTA')}</p>
        <p style={{ margin: 0 }}>{val(data.resoMember3Designation, 'Member')}</p>
      </div>
      <div style={{ width: '30%' }}>
        <p style={{ fontWeight: '700', margin: '14px 0 0 0' }}>{val(data.resoMember4Name, 'BOBBY S. BALTAZAR')}</p>
        <p style={{ margin: 0 }}>{val(data.resoMember4Designation, 'Member')}</p>
      </div>
      <div style={{ width: '30%' }}>
        <p style={{ fontWeight: '700', margin: '14px 0 0 0' }}>{data.resoEndUser ? data.resoEndUser.toUpperCase() : <>&nbsp;</>}</p>
        <p style={{ margin: 0 }}>End-user/Rep.</p>
      </div>
    </div>
    <div style={{ marginTop: '16px', marginBottom: '24px' }}>
      <p style={{ margin: '0 0 4px 0' }}>Approved by:</p>
      <div style={{ textAlign: 'left', marginLeft: '40px' }}>
        <p style={{ fontWeight: '700', margin: '10px 0 0 0' }}>{val(data.resoApprovedByName, 'MARIA ANA B. FRANCISCO, CESO III')}</p>
        <p style={{ margin: 0 }}>{val(data.resoApprovedByDesignation, 'Head of Procuring Entity')}</p>
      </div>
    </div>
  </div>
)

const ResoDirectAcquisitionContent = ({ data, darLogo, bagongPilipinasLogo, socotecLogo }) => {
  const company = val(data.resoCompany, 'LU OVERLOAD RESTAURANT AND CATERING SERVICES')
  const items = val(data.resoItems, 'MEALS & SNACKS')
  const purpose = val(data.resoPurpose, 'MEETING FOR THE PREPARATION OF NWMC')
  const dateOfConduct = val(data.resoDateOfConduct, 'MARCH 2026 & CY2026 PLANS')
  const amount = formatResoAmount(data.resoAmount, true, true)
  const maxAmount = formatResoAmount(data.resoMaxAmount, false, false)
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '18 FEBRUARY 2026'

  const resoContentStyle = { ...pageContentStyle, gap: '3px', fontSize: '11pt', marginLeft: '0.6in', marginRight: '0.6in', marginTop: '6px' }

  return (
    <>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
      <div style={resoContentStyle}>
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>REGIONAL BIDS AND AWARDS COMMITTEE (RBAC)</p>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>Resolution No. _______, Series of 2026</p>
        </div>
        <div style={{ textAlign: 'center', margin: '8px 0', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>
            RECOMMENDING TO THE HEAD OF PROCURING ENTITY THE AWARD OF CONTRACT TO {company.toUpperCase()} FOR THE PROCUREMENT OF {items.toUpperCase()} FOR THE CONDUCT OF GAD {purpose.toUpperCase()} ON {dateOfConduct.toUpperCase()}
          </p>
        </div>
        <p style={{ margin: 0, textAlign: 'justify' }}>Presented for approval before the members of the Regional Bids and Awards Committee (RBAC) a RESOLUTION awarding <strong>{company.toUpperCase()}</strong> for the provision of {items.toUpperCase()} through DIRECT ACQUISITION pursuant to the IRR of Republic Act of 12009 also known as the New Government Procurement Act:</p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, Rule IV Section 26.1 (f) of the IRR. Of the R.A. 12009, otherwise known as The New Government Procurement Act, provides for Direct Acquisition; as one of the modes of procurement consistent with the Fit-for-Purpose procurement approach;</p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, Section 32.1 of the said IRR stated that Direct Acquisition is a mode of procurement of CSE not available in the PS-DBM, Non-CSE, and services with ABC not exceeding {maxAmount}, where the Procuring Entity, without need to conduct a canvass or request for quotations, may procure directly from any known and reputable sources;</p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, the RBAC has deemed it proper to conduct Direct Acquisition as the mode of procurement in the interest of efficiency and economy, pursuant to Section 32.1 of the IRR of RA 12009;</p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, upon examination of the goods to be procured, the RBAC found out that the items for procurement are classified as CSE not available in the PS-DBM, non-CSE or services not Exceeding {maxAmount};</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, pursuant to the guideline under Sections 32.2 and 32.3 of the IRR of RA 12009, the RBAC found <strong>{company.toUpperCase()}</strong> to be a reputable source with legal, technical, and financial capacity and eligible for the provision of {items.toUpperCase()};</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREFORE</strong>, after careful deliberations and study of the matter, the Regional Bids and Awards Committee <strong>RESOLVES</strong>, as it is <strong>HEREBY RESOLVED</strong>, to <strong>RECOMMEND</strong> the award of the <strong>PROCUREMENT OF {items.toUpperCase()}</strong> THROUGH DIRECT ACQUISITION to <strong>{company.toUpperCase()}</strong> in the amount of <strong>{amount}</strong></p>
        <p style={{ margin: '14px 0 0 0' }}><strong>RESOLVED UNANIMOUSLY</strong> on <strong>{resoDate}</strong> at DAR Regional Office I, Carlatan, City of San Fernando, La Union.</p>
        <ResoSignatoryBlock data={data} />
      </div>
      <OfficialFooter darLogo={darLogo} socotecLogo={socotecLogo} />
    </>
  )
}

const ResoSVPContent = ({ data, darLogo, bagongPilipinasLogo, socotecLogo }) => {
  const company = val(data.resoCompany, '[SUPPLIER NAME]')
  const items = val(data.resoItems, '[SPECIFIC GOODS]')
  const purpose = val(data.resoPurpose, '[TITLE ACTIVITY]')
  const amount = formatResoAmount(data.resoAmount, true, true)
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '[DATE OF SIGNING]'

  const resoContentStyle = { ...pageContentStyle, gap: '8px', fontSize: '10.5pt', marginLeft: '0.6in', marginRight: '0.6in', marginTop: '6px' }

  return (
    <>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
      <div style={resoContentStyle}>
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>REGIONAL BIDS AND AWARDS COMMITTEE (RBAC)</p>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>Resolution No. _______, Series of 2026</p>
        </div>
        <div style={{ textAlign: 'center', margin: '8px 0', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0, textTransform: 'uppercase' }}>
            RESOLUTION RECOMMENDING THE AWARD OF CONTRACT TO {company} AMOUNTING {amount} THROUGH SMALL VALUE PROCUREMENT UNDER NEGOTIATED PROCUREMENT IN PROCURING THE {items} FOR THE {purpose}
          </p>
        </div>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, Section 34 of R.A 12009, otherwise known as The Implementing Rules and Regulations of Republic Act No. 12009 or The New Government Procurement Act, provides for Small Value Procurement whereby the Procuring Entity requests for the submission of at least three (3) price quotations for Goods not available in the PS-DBM, Infrastructure Projects, and Consulting Services;</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, the amount involved does not exceed Two Million Pesos (P2,000,000.00), subject to the periodic review of the threshold amount;</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, to effect responsive, accessible, comprehensive, efficient and immediate response to procure the {items.toUpperCase()}, there is a need to procure goods using the Small Value Procurement;</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, in compliance with Section 34.3 of the IRR, the BAC prepared and sent RFQs to at least three (3) suppliers, contractors or consultants of known qualifications, as the case may be;</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, after the deadline for submission of quotations or proposals, and Abstract of Quotations or Ratings shall be prepared setting forth the names of those who responded to the RFQ or RFP, and their corresponding price quotations or ratings;</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, the BAC shall recommend to the HoPE the award of a contract in favor of the supplier, contractor, or consultant, as the case may be, with the Lowest Calculated Responsive Quotation;</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>WHEREAS</strong>, upon confirmation of such capabilities and after due deliberation of the submitted price quotations, the BAC found the offer of {company.toUpperCase()} to be the lowest calculated and responsive bid;</p>
        <p style={{ margin: '14px 0 0 0', textAlign: 'justify' }}><strong>NOW, THEREFORE</strong>, the Regional Bids and Awards Committee <strong>RESOLVES</strong>, as it <strong>HEREBY RESOLVED</strong>, to recommend the Head of the Procuring Entity (HoPe) that the Contract for the procurement of the {items.toUpperCase()} FOR {purpose.toUpperCase()}, be awarded to {company.toUpperCase()} through Small Value Procurement under Negotiated Procurement pursuant to and in accordance with Section 34 of R.A. 12009, and that a Notice of Award be issued for this undertaking.</p>
        <p style={{ margin: '14px 0 0 0' }}><strong>RESOLVED UNANIMOUSLY</strong> on <strong>{resoDate}</strong> at DAR Regional Office I, Carlatan, City of San Fernando, La Union.</p>
        <ResoSignatoryBlock data={data} />
      </div>
      <OfficialFooter darLogo={darLogo} socotecLogo={socotecLogo} />
    </>
  )
}

/* ─────────────────────────────────────────────
   Reso LOV Page 1 (body / whereas clauses)
───────────────────────────────────────────── */
const ResoLOVPage1Content = ({ data, darLogo, bagongPilipinasLogo, socotecLogo }) => {
  const company = val(data.resoCompany, '[NAME OF SUPPLIER]')
  const abcAmount = formatResoAmount(data.resoMaxAmount, true, false)
  const amount = formatResoAmount(data.resoAmount, true, false)
  const purpose = val(data.resoPurpose, '[ACTIVITY/PROJECT NAME]')
  const dateOfConduct = val(data.resoDateOfConduct, '[DATE OF ACTIVITY]')
  const rating = val(data.resoRating, '[RATING SHEET]')
  const lessor1 = val(data.lovLessor1, 'LU OVERLOAD RESTAURANT AND CATERING SERVICES').toUpperCase()
  const lessor2 = val(data.lovLessor2, 'Supplier 2').toUpperCase()
  const lessor3 = val(data.lovLessor3, 'Supplier 3').toUpperCase()

  const resoContentStyle = { ...pageContentStyle, gap: '5px', fontSize: '11pt', marginLeft: '0.6in', marginRight: '0.6in', marginTop: '12px' }

  return (
    <>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
      <div style={resoContentStyle}>
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>REGIONAL BIDS AND AWARDS COMMITTEE (RBAC)</p>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0 }}>Resolution No. _______, Series of 2026</p>
        </div>
        <div style={{ textAlign: 'center', margin: '12px 0', lineHeight: '1.2' }}>
          <p style={{ fontWeight: '700', fontSize: '12pt', margin: 0, textTransform: 'uppercase' }}>
            RECOMMENDING TO THE HEAD OF THE PROCURING ENTITY THE AWARD OF CONTRACT TO {company} FOR THE PROCUREMENT OF LEASE OF VENUE WITH FOOD AND ACCOMMODATION FOR THE CONDUCT OF {purpose} ON {dateOfConduct}
          </p>
        </div>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, DAR Regional Office I has undertaken procurement of Lease of Real Property and Venue for the aforementioned activity;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the Approved Budget for the Contract (ABC) is {abcAmount} only;
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
            <li style={{ paddingLeft: '4px' }}><strong>{lessor1}</strong></li>
            <li style={{ paddingLeft: '4px' }}><strong>{lessor2}</strong></li>
            <li style={{ paddingLeft: '4px' }}><strong>{lessor3}</strong></li>
          </ol>
        </div>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, after due deliberation of the submitted price quotations, the BAC found the offer of {company} to be the Lowest Calculated Quotation (LCQ);
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, based on the result of the ocular inspection reflected in the Rating Factors and Determination of Reasonableness of Rental Rate {company} has been rated by with the score of {rating};
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, the report containing the result of the evaluation and its attachments is attached hereto as Annex "A" made an integral part hereof;
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>WHEREAS</strong>, upon determination of the responsiveness and reasonableness of the quotation, {company} complied with the requirements and is hereby declared as the Lowest Calculated and Responsive Quotation (LRQ);
        </p>
        <p style={{ margin: '8px 0 0 0', textAlign: 'justify' }}>
          <strong>NOW, THEREFORE</strong>, the BAC hereby <strong>RESOLVES</strong>, as it hereby <strong>RESOLVED</strong>:
        </p>
        <ol style={{ margin: '8px 0 0 2em', paddingLeft: '1em', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>To <strong>DECLARE</strong> the quotation of {company} as the Lowest Calculated Responsive Quotation (LCRQ)</li>
          <li>To <strong>RECOMMEND</strong> to the Regional Director, as the Head of Procuring Entity, the award of the project to {company} in the amount of {amount} for the LEASE OF VENUE for the {purpose}.</li>
        </ol>
      </div>
      <OfficialFooter darLogo={darLogo} socotecLogo={socotecLogo} />
    </>
  )
}

/* ─────────────────────────────────────────────
   Reso LOV Page 2 (RESOLVED UNANIMOUSLY + signatories)
───────────────────────────────────────────── */
const ResoLOVPage2Content = ({ data, darLogo, bagongPilipinasLogo, socotecLogo }) => {
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '[DATE OF SIGNING]'
  const endUser = val(data.resoEndUser, '').toUpperCase()

  const resoContentStyle = {
    ...pageContentStyle,
    gap: '5px',
    fontSize: '11pt',
    marginLeft: '0.6in',
    marginRight: '0.6in',
    marginTop: '12px',
  }

  return (
    <>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
      <div style={resoContentStyle}>
        <p style={{ margin: '0' }}>
          <strong>RESOLVED UNANIMOUSLY</strong> on <strong>{resoDate}</strong> at DAR Regional Office I, Carlatan, City of San Fernando, La Union
        </p>
        <div style={{ marginTop: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{val(data.resoChairpersonName, 'ATTY. GLAIZA MAE MASAOY-ONIA')}</p>
            <p style={{ margin: 0 }}>{val(data.resoChairpersonDesignation, 'Chairperson')}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{val(data.resoViceName, 'NENITA C. MADRIAGA')}</p>
              <p style={{ margin: 0 }}>{val(data.resoViceDesignation, 'Vice Chairperson')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{val(data.resoMember1Name, 'ATTY. ROMIN A. CADIENTE')}</p>
              <p style={{ margin: 0 }}>{val(data.resoMember1Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{val(data.resoMember2Name, 'BEN B. RIOS')}</p>
              <p style={{ margin: 0 }}>{val(data.resoMember2Designation, 'Member')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{val(data.resoMember3Name, 'BOBBY S. BAUTISTA')}</p>
              <p style={{ margin: 0 }}>{val(data.resoMember3Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{val(data.resoMember4Name, 'BOBBY S. BALTAZAR')}</p>
              <p style={{ margin: 0 }}>{val(data.resoMember4Designation, 'Member')}</p>
            </div>
            <div style={{ width: '30%' }}>
              <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{endUser || <>&nbsp;</>}</p>
              <p style={{ margin: 0 }}>End-user/Rep.</p>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '48px', marginBottom: '24px' }}>
          <p style={{ margin: '0 0 8px 0' }}>Approved by:</p>
          <div style={{ textAlign: 'left', marginLeft: '40px' }}>
            <p style={{ fontWeight: '700', margin: '24px 0 0 0' }}>{val(data.resoApprovedByName, 'MARIAANA B. FRANCISCO, CESO III')}</p>
            <p style={{ margin: 0 }}>{val(data.resoApprovedByDesignation, 'Head of Procuring Entity')}</p>
          </div>
        </div>
      </div>
      <OfficialFooter darLogo={darLogo} socotecLogo={socotecLogo} />
    </>
  )
}

const ResoEmergencySplitContent = ({ data, darLogo, bagongPilipinasLogo, socotecLogo }) => {
  const company = val(data.resoCompany, '[SUPPLIER NAME]')
  const items = val(data.resoItems, '[SPECIFIC GOODS]')
  const purpose = val(data.resoPurpose, '[ACTIVITY NAME]')
  const dateOfConduct = val(data.resoDateOfConduct, '[DATE]')
  const amount = formatResoAmount(data.resoAmount, true, true)
  const maxAmount = formatResoAmount(data.resoMaxAmount, true, true)
  const resoDate = data.resoDate ? formatOfficialDate(data.resoDate, true) : '[DATE OF SIGNING]'

  const resoContentStyle = { ...pageContentStyle, gap: '3px', fontSize: '11pt', marginLeft: '0.6in', marginRight: '0.6in', marginTop: '6px' }

  return (
    <>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
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

        <ResoSignatoryBlock data={data} />
      </div>
      <OfficialFooter darLogo={darLogo} socotecLogo={socotecLogo} />
    </>
  )
}

/* ─────────────────────────────────────────────
   Document Preview Renderer
───────────────────────────────────────────── */
const DocumentPreview = ({ item, logos }) => {
  const { darLogo, bagongPilipinasLogo, socotecLogo } = logos
  const formData = mapRawToFormData(item)
  const docTypeKey = item?.docTypeKey || ''

  const cardShadow = { boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }

  if (docTypeKey === 'noa') {
    return (
      <div style={{ ...pageCardStyle, ...cardShadow }}>
        <NOAContent data={formData} darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} socotecLogo={socotecLogo} />
      </div>
    )
  }
  if (docTypeKey === 'ntp') {
    return (
      <div style={{ ...pageCardStyle, ...cardShadow }}>
        <NTPContent data={formData} darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} socotecLogo={socotecLogo} />
      </div>
    )
  }
  if (docTypeKey === 'reso_direct_acquisition') {
    return (
      <div style={{ ...longPageCardStyle, ...cardShadow }}>
        <ResoDirectAcquisitionContent data={formData} darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} socotecLogo={socotecLogo} />
      </div>
    )
  }
  if (docTypeKey === 'reso_svp') {
    return (
      <div style={{ ...longPageCardStyle, ...cardShadow }}>
        <ResoSVPContent data={formData} darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} socotecLogo={socotecLogo} />
      </div>
    )
  }
  if (docTypeKey === 'reso_lov') {
    return (
      <>
        <div style={{ ...longPageCardStyle, ...cardShadow }}>
          <ResoLOVPage1Content data={formData} darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} socotecLogo={socotecLogo} />
        </div>
        <div style={{ ...longPageCardStyle, ...cardShadow }}>
          <ResoLOVPage2Content data={formData} darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} socotecLogo={socotecLogo} />
        </div>
      </>
    )
  }
  if (docTypeKey === 'reso_emergency_split') {
    return (
      <div style={{ ...longPageCardStyle, ...cardShadow }}>
        <ResoEmergencySplitContent data={formData} darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} socotecLogo={socotecLogo} />
      </div>
    )
  }
  return (
    <div style={{ ...pageCardStyle, ...cardShadow }}>
      <OfficialHeader darLogo={darLogo} bagongPilipinasLogo={bagongPilipinasLogo} />
    </div>
  )
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return String(value)
  }
}

const templatesHtml = (() => {
  // Load static templates stored in frontend/src/documents/*.html
  const modules = import.meta.glob('../documents/*.html', { query: '?raw', import: 'default', eager: true })
  const byName = {}
  for (const [path, raw] of Object.entries(modules)) {
    const name = path.split('/').pop()?.replace('.html', '')
    if (name) byName[name] = raw
  }
  return byName
})()

const getTemplateKey = (docTypeKey) => {
  switch (docTypeKey) {
    case 'noa_ntp':
      return 'noa'
    case 'reso_direct_acquisition':
      return 'direct'
    case 'reso_svp':
      return 'svp'
    case 'reso_lov':
      return 'lov'
    case 'reso_emergency_split':
      return 'split'
    default:
      return null
  }
}

const renderTemplateHtmlForItem = (item) => {
  const templateName = getTemplateKey(item?.docTypeKey)
  if (!templateName) return ''

  const template = templatesHtml[templateName] || ''
  const raw = item?.raw || {}

  // Best-effort placeholder replacement. If a specific placeholder is missing,
  // the template will keep its original token text.
  const html = (template || '')
    .replaceAll('[SUPPLIER NAME]', raw?.company_name || raw?.company || item?.name || '')
    .replaceAll('[NAME OF REPRESENTATIVE / NAME OF COMPANY]', raw?.name || raw?.company_name || raw?.company || item?.name || '')
    .replaceAll('[WHAT]', raw?.what || raw?.items_services || raw?.items || item?.name || '')
    .replaceAll('[PROCURE WHAT]', raw?.what || raw?.items_services || raw?.items || '')
    .replaceAll('[PROCUREMENT OF (WHAT?)]', raw?.what || raw?.items_services || raw?.items || '')
    .replaceAll('MOP', raw?.mop || raw?.mode_of_procurement || raw?.procurement_mop || '')
    .replaceAll('[SPECIFIC GOODS]', raw?.items || raw?.resoItems || raw?.reso_items || raw?.goods || '')
    .replaceAll('[MEALS AND SNACKS? / ACTIVITY NAME]', raw?.items || raw?.resoItems || raw?.reso_items || raw?.purpose || '')
    .replaceAll('[ACTIVITY/PROJECT TITLE]', raw?.activity || raw?.purpose || raw?.title || raw?.project_title || '')
    .replaceAll('[TITLE ACTIVITY]', raw?.purpose || raw?.activity || raw?.title || '')
    .replaceAll('[ACTIVITY]', raw?.purpose || raw?.activity || raw?.title || '')
    .replaceAll('[DATE OF SIGNING]', raw?.reso_date || raw?.date_created || item?.dateCreated || item?.date_created || '')
    .replaceAll('[DATE]', raw?.date_of_conduct || raw?.reso_date_of_conduct || raw?.date_of_conductation || '')
    .replaceAll('[DATE OF ACTIVITY]', raw?.date_of_conduct || raw?.date_of_conductation || '')
    .replaceAll('[IN FIGURES]', raw?.award_amount || raw?.amount || raw?.reso_amount || '')
    .replaceAll('[AMOUNT IN FIGURES]', raw?.award_amount || raw?.amount || raw?.reso_amount || '')
    .replaceAll('[AMOUNT QUOTED]', raw?.award_amount || raw?.amount || raw?.reso_amount || '')
    .replaceAll('[AMOUNT OF BID]', raw?.award_amount || raw?.amount || raw?.reso_amount || '')
    .replaceAll('[AMOUNT BASED ON PR]', raw?.max_amount || raw?.reso_max_amount || raw?.amount || '')
    .replaceAll('[ABC IN PPMP-PROPOSAL-PR]', raw?.max_amount || raw?.abc_amount || raw?.reso_max_amount || '')
    .replaceAll('[RATING SHEET]', raw?.rating_score || raw?.reso_rating || '')
    .replaceAll('Name of Company', raw?.company_name || raw?.company || item?.name || '')
    .replaceAll('Position /', raw?.position || raw?.noaPosition || '')
    .replaceAll('Ma\u0027am/Sir,', raw?.greeting || 'Ma\u0027am/Sir')
    .replaceAll('Ma7am/Sir,', raw?.greeting || 'Ma\u0027am/Sir')

  // Wrap in a root element so modal and print share consistent typography.
  // Also ensure the document is rendered (templates already include the official header/footer markup).
  return `<div class="template-preview-root">${html}</div>`
}


/* ─────────────────────────────────────────────
   Date Range Picker Component
───────────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

const DateRangePicker = ({ dateFrom, dateTo, onFromChange, onToChange, onClear }) => {
  const [open, setOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState(null)
  const today = new Date()
  const [leftYear, setLeftYear]   = React.useState(today.getFullYear())
  const [leftMonth, setLeftMonth] = React.useState(today.getMonth())
  const ref = React.useRef(null)

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1
  const rightYear  = leftMonth === 11 ? leftYear + 1 : leftYear

  React.useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toYMD = (d) => {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  }

  const parseYMD = (s) => { if (!s) return null; const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d) }

  const getDaysInMonth = (year, month) => {
    const first = new Date(year, month, 1).getDay()
    const total = new Date(year, month + 1, 0).getDate()
    return { first, total }
  }

  const handleDayClick = (ymd) => {
    if (!dateFrom || (dateFrom && dateTo)) {
      onFromChange(ymd)
      onToChange('')
    } else {
      if (ymd < dateFrom) { onFromChange(ymd); onToChange(dateFrom) }
      else { onToChange(ymd) }
    }
  }

  const renderCalendar = (year, month) => {
    const { first, total } = getDaysInMonth(year, month)
    const cells = []
    for (let i = 0; i < first; i++) cells.push(null)
    for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d))

    return (
      <div className="select-none">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />
            const ymd = toYMD(date)
            const isFrom = ymd === dateFrom
            const isTo   = ymd === dateTo
            const activeEnd = dateTo || hovered
            const inRange = dateFrom && activeEnd && ymd > dateFrom && ymd < (activeEnd)
            const isToday = toYMD(today) === ymd

            let cls = 'relative h-8 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all '
            if (isFrom || isTo) {
              cls += 'bg-[#0B6623] text-white rounded-lg z-10 '
            } else if (inRange) {
              cls += 'bg-[#0B6623]/10 text-[#0B6623] '
            } else {
              cls += 'text-slate-700 hover:bg-slate-100 rounded-lg '
            }
            if (isToday && !isFrom && !isTo) cls += 'font-black underline decoration-[#0B6623] decoration-2 underline-offset-2 '

            return (
              <div
                key={ymd}
                className={cls}
                onClick={() => handleDayClick(ymd)}
                onMouseEnter={() => { if (dateFrom && !dateTo) setHovered(ymd) }}
                onMouseLeave={() => setHovered(null)}
              >
                {date.getDate()}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const formatLabel = (ymd) => {
    if (!ymd) return null
    const [y,m,d] = ymd.split('-')
    return `${MONTHS[parseInt(m,10)-1].slice(0,3)} ${parseInt(d,10)}, ${y}`
  }

  const hasValue = dateFrom || dateTo
  const label = hasValue
    ? `${formatLabel(dateFrom) || '\u2014'}  \u2192  ${formatLabel(dateTo) || '\u2014'}`
    : 'Select date range'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer ${open ? 'border-[#0B6623] ring-2 ring-[#0B6623]/20 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'} ${hasValue ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}
      >
        <MdCalendarToday className="w-4 h-4 flex-shrink-0 text-[#0B6623]" />
        <span className="flex-1 text-left truncate text-xs">{label}</span>
        {hasValue && (
          <span
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            onClick={(e) => { e.stopPropagation(); onClear() }}
          >
            <MdClose className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-[260px]">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => { if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y-1) } else setLeftMonth(m => m-1) }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                >
                  <MdChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {MONTHS[leftMonth]} {leftYear}
                </span>
                <div className="w-6" />
              </div>
              {renderCalendar(leftYear, leftMonth)}
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-6" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {MONTHS[rightMonth]} {rightYear}
                </span>
                <button
                  type="button"
                  onClick={() => { if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y+1) } else setLeftMonth(m => m+1) }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                >
                  <MdChevronRight className="w-4 h-4" />
                </button>
              </div>
              {renderCalendar(rightYear, rightMonth)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-semibold">
              {!dateFrom && !dateTo && 'Click a start date, then an end date'}
              {dateFrom && !dateTo && 'Now click an end date'}
              {dateFrom && dateTo && (
                <span className="text-[#0B6623] font-bold">{formatLabel(dateFrom)} \u2192 {formatLabel(dateTo)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 bg-[#0B6623] hover:bg-[#09501c] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const FileManager = () => {
  const documentTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'noa', label: 'NOA' },
    { value: 'ntp', label: 'NTP' },
    { value: 'reso_svp', label: 'Reso SVP' },
    { value: 'reso_lov', label: 'Reso LOV' },
    { value: 'reso_emergency_split', label: 'Emergency Split' },
    { value: 'reso_direct_acquisition', label: 'Reso Direct Acquisition' },
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')


  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [refreshTick, setRefreshTick] = useState(0)

  /* Modal state for view preview */
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(0.7)

  /* Logos: loaded lazily from Vite asset imports */
  const [logos, setLogos] = useState({ darLogo: '', bagongPilipinasLogo: '', socotecLogo: '' })

  useEffect(() => {
    Promise.all([
      import('../assets/Department_of_Agrarian_Reform_(DAR).svg.png'),
      import('../assets/Header_Footer/Bagong_Pilipinas_logo.png'),
      import('../assets/SOCOTEC-LOGO.png'),
    ]).then(([dar, bagong, socotec]) => {
      setLogos({
        darLogo: dar.default,
        bagongPilipinasLogo: bagong.default,
        socotecLogo: socotec.default,
      })
    }).catch(() => {})
  }, [])
  const [selectedItem, setSelectedItem] = useState(null)
  const [previewHtml, setPreviewHtml] = useState('')

  const documentSources = useMemo(
    () => [
      { key: 'noa', label: 'NOTICE OF AWARD', type: 'noa', nameField: 'name', dateField: 'date_created' },
      { key: 'ntp', label: 'NOTICE TO PROCEED', type: 'ntp', nameField: 'name', dateField: 'date_created' },
      {
        key: 'reso',
        label: 'RESO FOR DIRECT ACQUISITION',
        type: 'reso_direct_acquisition',
        nameField: 'company_name',
        dateField: 'date_created',
      },
      { key: 'reso_svp', label: 'RESO FOR SVP', type: 'reso_svp', nameField: 'company_name', dateField: 'date_created' },
      { key: 'reso_lov', label: 'RESO FOR LOV', type: 'reso_lov', nameField: 'company_name', dateField: 'date_created' },
      { key: 'reso_emergency_split', label: 'RESO FOR EMERGENCY - SPLIT', type: 'reso_emergency_split', nameField: 'company_name', dateField: 'date_created' },
    ],
    []
  )

  const fetchAll = async () => {
    setIsLoading(true)
    setError('')

    try {
      const results = await fetchAllDocuments()
      const flattened = documentSources.flatMap((source) => {
        const rows = results[source.key] || []
        return rows.map((row) => ({
          id: row.id,
          docTypeLabel: source.label,
          docTypeKey: source.type,
          name: row[source.nameField] || row.name || row.company_name || row.title || `#${row.id}`,
          dateCreated: row[source.dateField] || row.date_created || row.doc_date || row.reso_date || row.timestamp || row.created_at || null,
          raw: row,
        }))
      })

      flattened.sort((a, b) => {
        const da = a.dateCreated ? new Date(a.dateCreated).getTime() : 0
        const db = b.dateCreated ? new Date(b.dateCreated).getTime() : 0
        return db - da
      })

      setItems(flattened)
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick])

  const openView = (item) => {
    setSelectedItem(item)
    setPreviewHtml('')
    setZoomLevel(0.7)
    setIsPreviewModalOpen(true)
  }


  const printItem = (item) => {
    const isReso = item?.docTypeKey && item.docTypeKey.startsWith('reso_')
    const pageSize = isReso ? '8.5in 13in' : 'letter'
    const pageMinHeight = isReso ? '13in' : '11in'

    // Mount a hidden print container, render the React preview into it,
    // then clone its innerHTML into a popup window.
    const container = document.createElement('div')
    container.style.cssText = 'position:absolute;left:-9999px;top:0;width:8.5in;pointer-events:none;'
    document.body.appendChild(container)

    // We need to render the React tree into the container.
    // Use the same DocumentPreview but without card shadow/border.
    // Since we're in a browser context with Vite, use ReactDOM.
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container)
      const formData = mapRawToFormData(item)
      const docTypeKey = item?.docTypeKey || ''

      const pageStyle = isReso ? longPageCardStyle : pageCardStyle
      const noShadowStyle = { ...pageStyle, boxShadow: 'none', border: 'none' }

      let content = null
      if (docTypeKey === 'noa') {
        content = <div style={noShadowStyle}><NOAContent data={formData} darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} socotecLogo={logos.socotecLogo} /></div>
      } else if (docTypeKey === 'ntp') {
        content = <div style={noShadowStyle}><NTPContent data={formData} darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} socotecLogo={logos.socotecLogo} /></div>
      } else if (docTypeKey === 'reso_direct_acquisition') {
        content = <div style={noShadowStyle}><ResoDirectAcquisitionContent data={formData} darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} socotecLogo={logos.socotecLogo} /></div>
      } else if (docTypeKey === 'reso_svp') {
        content = <div style={noShadowStyle}><ResoSVPContent data={formData} darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} socotecLogo={logos.socotecLogo} /></div>
      } else if (docTypeKey === 'reso_lov') {
        content = (
          <>
            <div style={{ ...noShadowStyle, pageBreakAfter: 'always', breakAfter: 'page' }}>
              <ResoLOVPage1Content data={formData} darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} socotecLogo={logos.socotecLogo} />
            </div>
            <div style={noShadowStyle}>
              <ResoLOVPage2Content data={formData} darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} socotecLogo={logos.socotecLogo} />
            </div>
          </>
        )
      } else if (docTypeKey === 'reso_emergency_split') {
        content = <div style={noShadowStyle}><ResoEmergencySplitContent data={formData} darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} socotecLogo={logos.socotecLogo} /></div>
      } else {
        content = <div style={noShadowStyle}><OfficialHeader darLogo={logos.darLogo} bagongPilipinasLogo={logos.bagongPilipinasLogo} /></div>
      }

      root.render(content)

      // Give React one tick to flush the render
      setTimeout(() => {
        const printWindow = window.open('', '_blank', 'width=900,height=700')
        if (!printWindow) {
          root.unmount()
          document.body.removeChild(container)
          return
        }

        printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
          <style>
            @page { size: ${pageSize} portrait; margin: 0; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { margin: 0; padding: 0; background: white; font-family: "Times New Roman", Times, serif; }
            img { max-width: 100%; }
            .print-page { width: 8.5in; min-height: ${pageMinHeight}; padding: 0.4in; display: flex; flex-direction: column; }
            [style*="page-break-after"] { page-break-after: always; break-after: page; }
          </style>
        </head><body>
          ${container.innerHTML}
          <script>
            window.focus();
            setTimeout(function() { window.print(); window.close(); }, 200);
          <\/script>
        </body></html>`)

        printWindow.document.close()
        root.unmount()
        document.body.removeChild(container)
      }, 80)
    })
  }













  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return items.filter((it) => {
      const matchesSearch = !term || it.name?.toLowerCase().includes(term) || it.docTypeLabel?.toLowerCase().includes(term)
      const matchesType = selectedType === 'all' || it.docTypeKey === selectedType

      // Date range filter: normalize item date to YYYY-MM-DD for comparison
      let matchesDate = true
      if (dateFrom || dateTo) {
        matchesDate = (() => {
          if (!it?.dateCreated) return false
          const created = new Date(it.dateCreated)
          if (Number.isNaN(created.getTime())) return false
          const createdLocal = created.toISOString().slice(0, 10)
          if (dateFrom && createdLocal < dateFrom) return false
          if (dateTo && createdLocal > dateTo) return false
          return true
        })()
      }

      return matchesSearch && matchesType && matchesDate
    })
  }, [items, searchTerm, selectedType, dateFrom, dateTo])

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">File Manager</h2>
          <p className="text-slate-500 mt-1">Table of all generated documents (NOA &amp; NTP, Reso SVP, Reso LOV, Emergency Split, Reso Direct Acquisition).</p>
        </div>

        <button
          onClick={() => setRefreshTick((t) => t + 1)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0B6623] hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
          disabled={isLoading}
          title="Refresh"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3">
          <MdError className="w-5 h-5" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdDescription className="w-5 h-5 text-[#0B6623]" />
            <h3 className="font-bold text-slate-800">Documents</h3>
          </div>
          <div className="text-xs text-slate-500 font-semibold">{filteredItems.length} items</div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-end justify-between">
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Search</label>
              <div className="relative">
                <MdSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by document name or type..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
                />
              </div>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Filter by Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
              >
                {documentTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Filter by Date</label>
              <DateRangePicker
                dateFrom={dateFrom}
                dateTo={dateTo}
                onFromChange={setDateFrom}
                onToChange={setDateTo}
                onClear={() => { setDateFrom(''); setDateTo('') }}
              />
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedType('all')
                  setDateFrom('')
                  setDateTo('')
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading files...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredItems.map((it) => {
                  const tagConfig = {
                    noa:                   { label: 'NOA',       bg: 'bg-blue-100',   text: 'text-blue-700'   },
                    ntp:                   { label: 'NTP',       bg: 'bg-violet-100', text: 'text-violet-700' },
                    reso_direct_acquisition:{ label: 'DIRECT',   bg: 'bg-amber-100',  text: 'text-amber-700'  },
                    reso_svp:              { label: 'SVP',       bg: 'bg-teal-100',   text: 'text-teal-700'   },
                    reso_lov:              { label: 'LOV',       bg: 'bg-orange-100', text: 'text-orange-700' },
                    reso_emergency_split:  { label: 'SPLIT',     bg: 'bg-red-100',    text: 'text-red-700'    },
                  }
                  const tag = tagConfig[it.docTypeKey]

                  return (
                  <tr key={`${it.docTypeKey}-${it.id}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        {tag && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${tag.bg} ${tag.text}`}>
                            {tag.label}
                          </span>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate max-w-[460px]">{it.name}</span>
                          <span className="text-[11px] font-semibold text-slate-400">{it.docTypeLabel}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{formatDate(it.dateCreated)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openView(it)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          title="View"
                        >
                          <MdVisibility className="inline-block w-4 h-4 mr-2" />
                          View
                        </button>
                        <button
                          onClick={() => printItem(it)}
                          className="px-3 py-2 bg-[#0B6623] hover:bg-[#09501c] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          title="Direct Print"
                        >
                          <MdPrint className="inline-block w-4 h-4 mr-2" />
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-slate-500 font-semibold">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Preview Modal (1:1 templates.jsx preview panel) ── */}
      {isPreviewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col">
          {/* Modal chrome */}
          <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#0B6623] to-[#09501c] flex-shrink-0">
            <div className="flex items-center gap-3">
              <MdDescription className="w-5 h-5 text-white/80" />
              <div>
                <h2 className="text-sm font-black text-white leading-tight">{selectedItem.docTypeLabel}</h2>
                <p className="text-[11px] text-white/60 leading-tight">{selectedItem.name}</p>
              </div>
            </div>

            {/* Zoom controls — identical to templates.jsx */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1 flex items-center space-x-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.3))}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition-all active:scale-90"
                title="Zoom Out"
              >
                <MdRemove className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 bg-white/10 rounded-lg flex flex-col items-center min-w-[60px]">
                <span className="text-[9px] font-black text-white/60 uppercase tracking-tighter leading-none mb-0.5">Scale</span>
                <span className="text-xs font-mono font-bold text-white">{Math.round(zoomLevel * 100)}%</span>
              </div>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2.0))}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition-all active:scale-90"
                title="Zoom In"
              >
                <MdAdd className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => printItem(selectedItem)}
                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-colors border border-white/20"
              >
                <MdPrint className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false)
                  setSelectedItem(null)
                  setPreviewHtml('')
                  setZoomLevel(0.7)
                }}
                className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview area — identical layout to templates.jsx preview panel */}
          <div className="flex-1 bg-slate-100 overflow-y-auto overflow-x-hidden p-10 flex flex-col items-center">
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
              <DocumentPreview item={selectedItem} logos={logos} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileManager