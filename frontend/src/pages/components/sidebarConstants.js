import {
  MdDashboard,
  MdDescription,
  MdFilePresent,
  MdAssessment,
  MdSettings,
  MdPeople,
  MdDisplaySettings,
  MdHistory,
  MdCloudUpload,
} from 'react-icons/md'

export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
  { id: 'templates', label: 'Templates', icon: MdDescription, hasDropdown: true },
  { id: 'file_manager', label: 'File Manager', icon: MdFilePresent },
  { id: 'report', label: 'Reports', icon: MdAssessment },
  { id: 'options', label: 'Options', icon: MdSettings, hasDropdown: true },
]

export const templateDocs = [
  { id: 'noa_ntp', label: 'NOA & NTP' },
  { id: 'reso_direct_acquisition', label: 'RESO FOR DIRECT ACQUISITION' },
  { id: 'reso_svp', label: 'RESO FOR SVP' },
  { id: 'reso_lov', label: 'RESO FOR LOV' },
  { id: 'reso_emergency_split', label: 'RESO FOR EMERGENCY - SPLIT' },
]

export const optionsSubItems = [
  { id: 'user_management', label: 'User Management', icon: MdPeople },
  { id: 'document_settings', label: 'Utilities', icon: MdDisplaySettings },
  { id: 'activity_logs', label: 'Activity Logs', icon: MdHistory },
  { id: 'backup', label: 'Back Up', icon: MdCloudUpload },
]
