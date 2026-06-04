import React, { useState, useEffect, useRef } from 'react'
import { MdAssessment, MdPersonAdd, MdClose, MdCheckCircle, MdError, MdAdd, MdEdit, MdDelete, MdSettingsBackupRestore, MdCloudDownload, MdUploadFile, MdWarning, MdSchedule, MdDragIndicator } from 'react-icons/md'
import { apiUrl } from '../utils/apiConfig'

const Backup = ({ currentUser }) => {
  const [status, setStatus] = useState({ isOpen: false, type: 'success', message: '' })
  const [isRestoring, setIsRestoring] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [backupInfo, setBackupInfo] = useState(null)
  const [lastBackupTime, setLastBackupTime] = useState(() => {
    const saved = localStorage.getItem('dar_last_backup')
    return saved ? new Date(saved) : null
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchBackupInfo()
  }, [])

  const fetchBackupInfo = async () => {
    try {
      const res = await fetch(apiUrl('backup/info/'))
      if (res.ok) {
        const data = await res.json()
        setBackupInfo(data)
      }
    } catch (err) {
      console.error('Could not fetch backup info:', err)
    }
  }

  const handleDownloadBackup = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const response = await fetch(apiUrl('backup/download/'))
      if (!response.ok) throw new Error('Server error')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const now = new Date()
      const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`
      a.download = `dar_backup_${stamp}.sqlite3`
      a.click()
      URL.revokeObjectURL(url)
      const ts = new Date()
      localStorage.setItem('dar_last_backup', ts.toISOString())
      setLastBackupTime(ts)
      setStatus({ isOpen: true, type: 'success', message: 'Database backup downloaded successfully!' })
    } catch (err) {
      console.error(err)
      setStatus({ isOpen: true, type: 'error', message: 'Failed to download backup. Is the Django server running?' })
    } finally {
      setIsDownloading(false)
    }
  }

  const readApiError = async (res, fallback) => {
    try {
      const data = await res.json()
      if (data?.error) return data.error
      if (data?.message) return data.message
    } catch {
      // Response body was not JSON
    }
    return fallback
  }

  const handleFileSelect = (file) => {
    if (!file) return
    const name = file.name.toLowerCase()
    if (!name.endsWith('.sqlite3') && !name.endsWith('.db')) {
      setStatus({ isOpen: true, type: 'error', message: 'Invalid file. Please select a .sqlite3 or .db backup file.' })
      return
    }
    setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0])
    e.target.value = ''
  }

  const handleConfirmRestore = async () => {
    setConfirmModal(false)
    if (!selectedFile) return
    const formData = new FormData()
    formData.append('backup_file', selectedFile)
    setIsRestoring(true)
    try {
      const res = await fetch(apiUrl('backup/restore/'), {
        method: 'POST',
        headers: { 'X-User': currentUser?.name || 'System' },
        body: formData,
      })
      if (res.ok) {
        let data = {}
        try {
          data = await res.json()
        } catch {
          // ignore non-JSON success body
        }
        setStatus({
          isOpen: true,
          type: 'success',
          message: data.message || 'Database restored successfully! Please refresh the page to load the restored data.',
        })
        setSelectedFile(null)
        fetchBackupInfo()
      } else {
        const message = await readApiError(res, 'Failed to restore database.')
        setStatus({ isOpen: true, type: 'error', message })
      }
    } catch (err) {
      console.error(err)
      setStatus({ isOpen: true, type: 'error', message: err.message || 'Network error or server unavailable.' })
    } finally {
      setIsRestoring(false)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Database Backup & Restore</h2>
        <p className="text-slate-500 text-sm mt-1">Safeguard your system data with periodic backups.</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start space-x-4">
        <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 shrink-0">
          <MdWarning className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Important Warning</h4>
          <p className="text-sm text-amber-700 mt-0.5">Restoring a backup will <strong>permanently overwrite</strong> all current data. Ensure all other users are logged out before restoring. This action cannot be undone.</p>
        </div>
      </div>

      {/* What's Included Panel */}
      {backupInfo && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">What's Included in the Backup</h3>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Total rows: <span className="font-bold text-slate-600">{backupInfo.total_rows.toLocaleString()}</span></span>
              <span>DB size: <span className="font-bold text-slate-600">{backupInfo.file_size_kb} KB</span></span>
              <button onClick={fetchBackupInfo} className="text-[#0B6623] hover:underline font-semibold">Refresh</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries({
              'documents_noadocument':          { label: 'NOA Documents',           color: 'emerald' },
              'documents_ntpdocument':          { label: 'NTP Documents',           color: 'emerald' },
              'documents_resodirectacquisition':{ label: 'RESO Direct Acquisition', color: 'amber' },
              'documents_resosvp':              { label: 'RESO SVP',                color: 'amber' },
              'documents_resolov':              { label: 'RESO LOV',                color: 'amber' },
              'documents_resoemergencysplit':   { label: 'RESO Emergency Split',    color: 'amber' },
              'documents_activitylog':          { label: 'Activity Logs',           color: 'purple' },
              'documents_signatory':            { label: 'Signatories',             color: 'blue' },
              'auth_user':                      { label: 'User Accounts',           color: 'slate' },
              'auth_group':                     { label: 'User Groups',             color: 'slate' },
              'auth_user_groups':               { label: 'User-Group Links',        color: 'slate' },
            }).map(([key, { label, color }]) => {
              const styleMap = {
                emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                amber: 'bg-amber-50 border-amber-100 text-amber-700',
                purple: 'bg-purple-50 border-purple-100 text-purple-700',
                blue: 'bg-blue-50 border-blue-100 text-blue-700',
                slate: 'bg-slate-50 border-slate-100 text-slate-700',
              }

              const cls = styleMap[color] || styleMap.slate
              return (
                <div key={key} className={`flex items-center justify-between ${cls} rounded-xl px-4 py-3`}>
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-sm font-black text-current">
                    {(backupInfo.tables[key] ?? 0).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── DOWNLOAD CARD ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-14 h-14 bg-[#0B6623]/10 rounded-2xl flex items-center justify-center mb-5">
              <MdCloudDownload className="w-8 h-8 text-[#0B6623]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Download Backup</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Downloads the full SQLite database file to your machine, timestamped for easy organization.</p>

            {lastBackupTime && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <MdSchedule className="w-4 h-4" />
                <span>Last backup: <span className="font-semibold text-slate-500">{lastBackupTime.toLocaleString()}</span></span>
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={isDownloading}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-[#0B6623] text-white font-bold py-3 rounded-xl hover:bg-[#09501c] transition-all shadow-md shadow-[#0B6623]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDownloading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Preparing Download...
              </>
            ) : (
              <>
                <MdCloudDownload className="w-5 h-5" />
                Download Now
              </>
            )}
          </button>
        </div>

        {/* ── RESTORE CARD ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
            <MdUploadFile className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Restore Backup</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">Upload a previously saved <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.sqlite3</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.db</code> file to replace the active database.</p>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".sqlite3,.db"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <MdCheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-bold text-emerald-700 text-sm">{selectedFile.name}</p>
                <p className="text-xs text-emerald-600 mt-1">{formatSize(selectedFile.size)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                  className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <MdDragIndicator className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-500">Drag & drop file here</p>
                <p className="text-xs text-slate-400 mt-1">or <span className="text-blue-500 underline">browse to select</span></p>
                <p className="text-xs text-slate-300 mt-2">.sqlite3 / .db only</p>
              </>
            )}
          </div>

          <button
            onClick={() => selectedFile && setConfirmModal(true)}
            disabled={!selectedFile || isRestoring}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRestoring ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Restoring...
              </>
            ) : (
              <>
                <MdSettingsBackupRestore className="w-5 h-5" />
                Restore Database
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Confirm Restore Modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdWarning className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Restore</h3>
            <p className="text-slate-500 text-sm mb-2">You are about to restore the database from:</p>
            <p className="text-sm font-bold text-slate-700 bg-slate-100 rounded-xl px-4 py-2 mb-5 break-all">{selectedFile?.name}</p>
            <p className="text-red-600 text-xs font-semibold mb-6">⚠ This will permanently overwrite all current data and cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 py-3 font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg cursor-pointer"
              >
                Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Modal ── */}
      {status.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            {status.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdCheckCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdError className="w-8 h-8" />
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {status.type === 'success' ? 'Success!' : 'Error'}
            </h3>
            <p className="text-slate-500 text-sm mb-8">{status.message}</p>
            <button
              onClick={() => setStatus({ ...status, isOpen: false })}
              className={`w-full py-3 text-white font-bold rounded-xl transition-colors shadow-lg cursor-pointer ${
                status.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch(apiUrl('activity_logs/'))
      if (!res.ok) {
        console.error(`API returned status: ${res.status}`)
      }
      const data = await res.json()
      const logsArray = Array.isArray(data) ? data : (data.results || [])
      setLogs(logsArray)
    } catch (err) {
      console.error('Failed to fetch logs:', err)
      setLogs([]) // Ensure it's always an array
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !selectedDate || 
      new Date(log.timestamp).toISOString().split('T')[0] === selectedDate
    
    return matchesSearch && matchesDate
  })

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      <h2 className="text-3xl font-bold" style={{ color: 'black' }}>Activity Logs</h2>
      
      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Search by Name / Description</label>
            <input 
              type="text"
              placeholder="Search by user name or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Filter by Date</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
            />
          </div>
          {(searchTerm || selectedDate) && (
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setSelectedDate('') }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading activity logs...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-700">{log.user}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      log.action === 'CREATE' ? 'bg-blue-100 text-blue-700' :
                      log.action === 'UPDATE' ? 'bg-amber-100 text-amber-700' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                      log.action === 'LOGIN' ? 'bg-green-100 text-green-700' :
                      log.action === 'LOGOUT' ? 'bg-slate-100 text-slate-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{log.description}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">{formatDate(log.timestamp)}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No activity logs found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const DocumentSettings = ({ currentUser }) => {
  const [signatories, setSignatories] = useState([])
  const [deletedSignatories, setDeletedSignatories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSignatory, setEditingSignatory] = useState(null)
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' })
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, sigId: null, sigName: '' })
  const [isModalOpenArchived, setIsModalOpenArchived] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    role: 'Member'
  })
  const [selectedRoleOption, setSelectedRoleOption] = useState('Member')
  const [customRole, setCustomRole] = useState('')
  const [triedSubmitSignatory, setTriedSubmitSignatory] = useState(false)

  useEffect(() => {
    fetchSignatories()
  }, [])

  const fetchSignatories = async () => {
    try {
      const res = await fetch(apiUrl('signatories/'))
      const data = await res.json()
      setSignatories(data)

      const delRes = await fetch(apiUrl('signatories/deleted/'))
      if (delRes.ok) {
        const delData = await delRes.json()
        setDeletedSignatories(delData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreSignatory = async (id) => {
    try {
      const res = await fetch(apiUrl(`signatories/${id}/restore/`), {
        method: 'POST',
        headers: { 'X-User': currentUser?.name || 'System' }
      })
      if (res.ok) {
        fetchSignatories()
        setStatusModal({
          isOpen: true,
          type: 'success',
          message: 'Signatory restored successfully!'
        })
      } else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          message: 'Failed to restore signatory.'
        })
      }
    } catch (err) {
      console.error(err)
      setStatusModal({
        isOpen: true,
        type: 'error',
        message: 'Connection error.'
      })
    }
  }

  const handleRestoreDefaults = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/signatories/restore_defaults/', {
        method: 'POST',
        headers: { 'X-User': currentUser?.name || 'System' }
      })
      if (res.ok) {
        fetchSignatories()
        setStatusModal({
          isOpen: true,
          type: 'success',
          message: 'Default signatories restored successfully!'
        })
      } else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          message: 'Failed to restore defaults.'
        })
      }
    } catch (err) {
      console.error(err)
      setStatusModal({
        isOpen: true,
        type: 'error',
        message: 'Connection error.'
      })
    }
  }

  const handleOpenAddModal = () => {
    setEditingSignatory(null)
    setFormData({ name: '', designation: '', role: 'Member' })
    setSelectedRoleOption('Member')
    setCustomRole('')
    setTriedSubmitSignatory(false)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (sig) => {
    setEditingSignatory(sig)
    setFormData({ name: sig.name, designation: sig.designation, role: sig.role })
    if (['Chairperson', 'Vice Chairperson', 'Member', 'HOPE'].includes(sig.role)) {
      setSelectedRoleOption(sig.role)
      setCustomRole('')
    } else {
      setSelectedRoleOption('Other')
      setCustomRole(sig.role)
    }
    setTriedSubmitSignatory(false)
    setIsModalOpen(true)
  }

  const handleRoleOptionChange = (val) => {
    setSelectedRoleOption(val)
    if (val !== 'Other') {
      setFormData(prev => ({ ...prev, role: val }))
      setCustomRole('')
    } else {
      setFormData(prev => ({ ...prev, role: customRole }))
    }
  }

  const handleCustomRoleChange = (val) => {
    setCustomRole(val)
    setFormData(prev => ({ ...prev, role: val }))
  }

  const handleSaveSignatory = async () => {
    setTriedSubmitSignatory(true)
    if (!formData.name.trim() || !formData.designation.trim() || !formData.role.trim()) {
      setStatusModal({ isOpen: true, type: 'error', message: 'All fields (Name, Designation, and Role) are required. No blank spaces can be passed.' })
      return
    }

    try {
      const url = editingSignatory 
        ? apiUrl(`signatories/${editingSignatory.id}/`) 
        : apiUrl('signatories/')
      
      const method = editingSignatory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-User': currentUser?.name || 'System'
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchSignatories()
        setStatusModal({ 
          isOpen: true, 
          type: 'success', 
          message: editingSignatory ? 'Signatory updated successfully!' : 'Signatory added successfully!' 
        })
      } else {
        setStatusModal({ isOpen: true, type: 'error', message: 'Failed to save signatory.' })
      }
    } catch (err) {
      console.error(err)
      setStatusModal({ isOpen: true, type: 'error', message: 'Connection error.' })
    }
  }

  const handleDeleteSignatory = async (id) => {
    const sig = signatories.find(s => s.id === id)
    if (!sig) return
    setDeleteConfirmModal({
      isOpen: true,
      sigId: id,
      sigName: sig.name
    })
  }

  const confirmDeleteSignatory = async () => {
    const { sigId } = deleteConfirmModal
    setDeleteConfirmModal({ isOpen: false, sigId: null, sigName: '' })
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/signatories/${sigId}/`, {
        method: 'DELETE',
        headers: { 'X-User': currentUser?.name || 'System' }
      })
      if (res.ok) {
        fetchSignatories()
        setStatusModal({
          isOpen: true,
          type: 'success',
          message: 'Signatory deleted successfully!'
        })
      } else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          message: 'Failed to delete signatory.'
        })
      }
    } catch (err) {
      console.error(err)
      setStatusModal({
        isOpen: true,
        type: 'error',
        message: 'Connection error.'
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 relative">
      <h2 className="text-3xl font-bold" style={{ color: 'black' }}>Document Settings</h2>
      
      {/* Watermark Settings and Auto-Export controls removed as requested */}

      {/* Official Signatories Management */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Official Signatories</h3>
            <p className="text-xs text-slate-500 mt-1">Manage signatories available in the document generation templates.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleRestoreDefaults}
              className="flex items-center gap-2 border border-[#0B6623] hover:bg-[#0B6623]/5 text-[#0B6623] px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm cursor-pointer"
            >
              <MdSettingsBackupRestore className="w-5 h-5" />
              Restore Defaults
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-[#0B6623] hover:bg-[#09501b] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm cursor-pointer"
            >
              <MdAdd className="w-5 h-5" />
              Add Signatory
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading signatories...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Role / Category</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {signatories.map(sig => (
                <tr key={sig.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800">{sig.name}</td>
                  <td className="p-4 text-slate-500">{sig.designation}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      {sig.role}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-3">
                    <button 
                      onClick={() => handleOpenEditModal(sig)} 
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <MdEdit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteSignatory(sig.id)} 
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <MdDelete className="w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {signatories.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No signatories found. Please add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Archived / Deleted Signatories */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-8">
        <div className="p-6 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Archived / Deleted Signatories</h3>
            <p className="text-xs text-slate-500 mt-1">View and restore signatories that were previously deleted.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpenArchived(true)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <MdSettingsBackupRestore className="w-5 h-5" />
            View Archived
            <span className="text-xs font-bold text-slate-500">({deletedSignatories.length})</span>
          </button>
        </div>
      </div>

      {/* Archived Signatories Modal */}
      {isModalOpenArchived && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden mx-4">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Archived / Deleted Signatories</h3>
                <p className="text-xs text-slate-500 mt-1">Restore a signatory to make it available again.</p>
              </div>
              <button
                onClick={() => setIsModalOpenArchived(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Loading archived signatories...</div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Designation</th>
                        <th className="p-4">Role / Category</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deletedSignatories.map(sig => (
                        <tr key={sig.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-400 line-through">{sig.name}</td>
                          <td className="p-4 text-slate-400">{sig.designation}</td>
                          <td className="p-4 text-slate-400">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200/50">
                              {sig.role}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleRestoreSignatory(sig.id)}
                              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MdSettingsBackupRestore className="w-4 h-4" /> Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                      {deletedSignatories.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-500">No archived signatories found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Signatory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingSignatory ? 'Edit Signatory' : 'Add New Signatory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-red-500 font-semibold">* All fields must be filled. No blank spaces allowed.</p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 font-semibold text-slate-500">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. ATTY. GLAIZA MAE MASAOY-ONIA"
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] ${
                    triedSubmitSignatory && !formData.name.trim() ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 font-semibold text-slate-500">Designation</label>
                <input 
                  type="text" 
                  value={formData.designation} 
                  onChange={e => setFormData({...formData, designation: e.target.value})} 
                  placeholder="e.g. Chairperson / Regional Director"
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] ${
                    triedSubmitSignatory && !formData.designation.trim() ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 font-semibold text-slate-500">Role / Category</label>
                <select 
                  value={selectedRoleOption} 
                  onChange={e => handleRoleOptionChange(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] text-slate-700"
                >
                  <option value="Chairperson">Chairperson</option>
                  <option value="Vice Chairperson">Vice Chairperson</option>
                  <option value="Member">Member</option>
                  <option value="HOPE">Head of Procuring Entity (HOPE)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {selectedRoleOption === 'Other' && (
                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 font-semibold text-slate-500">Custom Role Name</label>
                  <input 
                    type="text" 
                    value={customRole} 
                    onChange={e => handleCustomRoleChange(e.target.value)} 
                    placeholder="e.g. Director / Secretariat"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] ${
                      triedSubmitSignatory && !customRole.trim() ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                    }`} 
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSaveSignatory} className="px-5 py-2.5 rounded-xl font-medium bg-[#0B6623] text-white hover:bg-[#09501b] shadow-sm shadow-[#0B6623]/20 transition-all cursor-pointer">
                {editingSignatory ? 'Update' : 'Save'}
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
              className={`w-full py-3 text-white font-bold rounded-xl transition-colors shadow-lg cursor-pointer ${
                statusModal.type === 'success' 
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdWarning className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Signatory?</h3>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete <strong>{deleteConfirmModal.sigName}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmModal({ isOpen: false, sigId: null, sigName: '' })}
                className="flex-1 py-3 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteSignatory}
                className="flex-1 py-3 text-white font-bold bg-red-600 rounded-xl hover:bg-red-700 shadow-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


const UserManagement = ({ currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' })
  const [archiveConfirmModal, setArchiveConfirmModal] = useState({ isOpen: false, userId: null, userName: '' })
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'Employee',
    password: ''
  })
  const [triedSubmit, setTriedSubmit] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiUrl('accounts/users/'))
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'All' || user.role === selectedRole
    const matchesSearch = !searchTerm || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesSearch
  })
  const handleOpenCreateModal = () => {
    setTriedSubmit(false)
    setFormData({ first_name: '', last_name: '', email: '', role: 'Employee', password: '' })
    setIsModalOpen(true)
  }
  const handleCreateUser = async () => {
    setTriedSubmit(true)
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setStatusModal({ isOpen: true, type: 'error', message: 'All fields (First Name, Last Name, and Email) are required. No blank spaces can be passed.' })
      return
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/accounts/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User': currentUser?.name || 'System'
        },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          username: formData.email.trim(),
          password: formData.password || 'dar12345',
          role: formData.role
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setIsModalOpen(false)
        setTriedSubmit(false)
        setFormData({ first_name: '', last_name: '', email: '', role: 'Employee', password: '' })
        fetchUsers()
        setStatusModal({ isOpen: true, type: 'success', message: 'User created successfully!' })
      } else {
        const errorMsg = data.username ? `Username: ${data.username[0]}` : (data.email ? `Email: ${data.email[0]}` : 'Failed to create user.')
        setStatusModal({ isOpen: true, type: 'error', message: errorMsg })
      }
    } catch (err) {
      console.error('Error creating user', err)
      setStatusModal({ isOpen: true, type: 'error', message: 'Cannot connect to server.' })
    }
  }

  const handleArchiveUser = async (id) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    setArchiveConfirmModal({
      isOpen: true,
      userId: id,
      userName: user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username
    })
  }

  const confirmArchiveUser = async () => {
    const { userId } = archiveConfirmModal
    setArchiveConfirmModal({ isOpen: false, userId: null, userName: '' })
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/accounts/users/${userId}/archive/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User': currentUser?.name || 'System'
        }
      })
      if (res.ok) {
        fetchUsers()
        setStatusModal({ isOpen: true, type: 'success', message: 'User archived successfully!' })
      } else {
        setStatusModal({ isOpen: true, type: 'error', message: 'Failed to archive user.' })
      }
    } catch (err) {
      console.error(err)
      setStatusModal({ isOpen: true, type: 'error', message: 'Connection error.' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold" style={{ color: 'black' }}>User Management</h2>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-[#0B6623] hover:bg-[#09501b] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
        >
          <MdPersonAdd className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Search</label>
            <input 
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Filter by Role</label>
            <select 
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] text-slate-700"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Email / Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-slate-800">
                    {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                  </td>
                  <td className="p-4 text-slate-500">{user.email || user.username}</td>
                  <td className="p-4 text-slate-600">{user.role}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button onClick={() => handleArchiveUser(user.id)} className="text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors">Archive</button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Create New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-red-500 font-semibold">* All fields must be filled. No blank spaces allowed.</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={formData.first_name} 
                    onChange={e => setFormData({...formData, first_name: e.target.value})} 
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] ${
                      triedSubmit && !formData.first_name.trim() ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                    }`} 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.last_name} 
                    onChange={e => setFormData({...formData, last_name: e.target.value})} 
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] ${
                      triedSubmit && !formData.last_name.trim() ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                    }`} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] ${
                    triedSubmit && !formData.email.trim() ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                  }`} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Leave blank for dar12345" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623] text-slate-700">
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleCreateUser} className="px-5 py-2.5 rounded-xl font-medium bg-[#0B6623] text-white hover:bg-[#09501b] shadow-sm shadow-[#0B6623]/20 transition-all">Create User</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archiveConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdWarning className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Archive User?</h3>
            <p className="text-slate-600 text-sm mb-2">
              Are you sure you want to archive <strong>{archiveConfirmModal.userName}</strong>?
            </p>
            <p className="text-slate-500 text-xs mb-6">
              Archived users will not be able to log in to the system.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setArchiveConfirmModal({ isOpen: false, userId: null, userName: '' })}
                className="flex-1 py-3 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmArchiveUser}
                className="flex-1 py-3 text-white font-bold bg-amber-600 rounded-xl hover:bg-amber-700 shadow-lg transition-colors"
              >
                Archive
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
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const Options = ({ activeTab, currentUser }) => {
  switch (activeTab) {
    case 'backup':
      return <Backup currentUser={currentUser} />
    case 'activity_logs':
      return <ActivityLogs />
    case 'document_settings':
      return <DocumentSettings currentUser={currentUser} />
    case 'user_management':
      return <UserManagement currentUser={currentUser} />
    default:
      return null
  }
}

export default Options
