import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MdAssessment,
  MdNotifications,
  MdClose,
  MdDescription,
} from 'react-icons/md'

import Login from './pages/login'
import Sidebar from './pages/components/sidebar'
import { sidebarItems, templateDocs, optionsSubItems } from './pages/components/sidebarConstants'
import Dashboard from './pages/dashboard'
import Templates from './pages/templates'
import Reports from './pages/reports'
import Options from './pages/options'
import FileManager from './pages/file-manager'


const NOTIF_LIMIT = 10
const POLL_INTERVAL = 30000 // 30 seconds

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('dar_is_logged_in') === 'true'
  })

  // ── Template exit warning modal ──
  const [templateExitModal, setTemplateExitModal] = useState({
    isOpen: false,
    templateId: null,
    templateLabel: '',
    pending: null, // { type: 'switch', targetId } | { type: 'close', targetId }
  })
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dar_current_user')
    return saved ? JSON.parse(saved) : null
  })
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dar_active_tab') || 'dashboard'
  })
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(() => {
    return localStorage.getItem('dar_is_templates_open') === 'true'
  })
  const [isOptionsOpen, setIsOptionsOpen] = useState(() => {
    return localStorage.getItem('dar_is_options_open') === 'true'
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('dar_is_sidebar_collapsed') === 'true'
  })
  const [openTabs, setOpenTabs] = useState(() => {
    const saved = localStorage.getItem('dar_open_tabs')
    return saved ? JSON.parse(saved) : []
  })

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('dar_is_logged_in', String(isLoggedIn))
    if (currentUser) {
      localStorage.setItem('dar_current_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('dar_current_user')
    }
  }, [isLoggedIn, currentUser])

  useEffect(() => {
    localStorage.setItem('dar_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('dar_is_templates_open', String(isTemplatesOpen))
  }, [isTemplatesOpen])

  useEffect(() => {
    localStorage.setItem('dar_is_options_open', String(isOptionsOpen))
  }, [isOptionsOpen])

  useEffect(() => {
    localStorage.setItem('dar_is_sidebar_collapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const tabsToSave = openTabs.map(tab => ({ id: tab.id, label: tab.label }))
    localStorage.setItem('dar_open_tabs', JSON.stringify(tabsToSave))
  }, [openTabs])

  // Prevent accidental reloads and notify the user about potential loss of unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isLoggedIn) {
        e.preventDefault()
        e.returnValue = 'Unsaved changes may be lost.'
        return 'Unsaved changes may be lost.'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoggedIn])

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [hasNewNotif, setHasNewNotif] = useState(false)
  const notifRef = useRef(null)
  const bellRef = useRef(null)

  // Fetch recent activity logs for notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/activity_logs/?limit=${NOTIF_LIMIT}`)
      if (res.ok) {
        const data = await res.json()
        const logs = Array.isArray(data) ? data : (data.results || [])
        const items = logs.slice(0, NOTIF_LIMIT)
        setNotifications(items)

        // Check for new notifications using the latest log id stored in localStorage
        const lastSeenId = localStorage.getItem('dar_last_seen_notif_id')
        if (items.length > 0) {
          const latestId = String(items[0].id)
          if (!lastSeenId || lastSeenId !== latestId) {
            setHasNewNotif(true)
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [])

  // Poll for notifications
  useEffect(() => {
    if (!isLoggedIn) return
    const t = setTimeout(fetchNotifications, 0)
    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => {
      clearTimeout(t)
      clearInterval(interval)
    }
  }, [isLoggedIn, fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isNotifOpen &&
        notifRef.current && !notifRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNotifOpen])

  // When opening the panel, mark notifications as seen
  const toggleNotifPanel = () => {
    const opening = !isNotifOpen
    setIsNotifOpen(opening)
    if (opening && notifications.length > 0) {
      localStorage.setItem('dar_last_seen_notif_id', String(notifications[0].id))
      setHasNewNotif(false)
    }
  }

  // Format timestamp for notification items
  const formatNotifTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = Math.abs(now - date)
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } catch {
      return 'Recent'
    }
  }

  // Action color mapping for notification badges
  const notifActionColor = (action) => {
    const map = {
      CREATE:   { bg: 'bg-emerald-500', text: 'text-white' },
      UPDATE:   { bg: 'bg-blue-500', text: 'text-white' },
      DELETE:   { bg: 'bg-red-500', text: 'text-white' },
      GENERATE: { bg: 'bg-purple-500', text: 'text-white' },
      LOGIN:    { bg: 'bg-amber-500', text: 'text-white' },
      LOGOUT:   { bg: 'bg-slate-400', text: 'text-white' },
    }
    return map[action] || { bg: 'bg-slate-400', text: 'text-white' }
  }

  // Action icon text
  const notifActionIcon = (action) => {
    const map = {
      CREATE: '+', UPDATE: '✎', DELETE: '✕', GENERATE: '⬇', LOGIN: '→', LOGOUT: '←',
    }
    return map[action] || '•'
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
    setActiveTab('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setActiveTab('dashboard')
    setOpenTabs([])
    setIsTemplatesOpen(false)
    setIsOptionsOpen(false)
    localStorage.removeItem('dar_is_logged_in')
    localStorage.removeItem('dar_current_user')
    localStorage.removeItem('dar_active_tab')
    localStorage.removeItem('dar_open_tabs')
    localStorage.removeItem('dar_is_templates_open')
    localStorage.removeItem('dar_is_options_open')
  }

  const [templateDirtyById, setTemplateDirtyById] = useState({})
  const draftSaverRef = useRef(null) // set by Templates via registerDraftSaver

  const handleCloseTab = (e, id) => {
    e.stopPropagation()

    const isDirty = Boolean(templateDirtyById[id])
    const templateLabel = openTabs.find(t => t.id === id)?.label || id

    if (isDirty) {
      setTemplateExitModal({
        isOpen: true,
        templateId: id,
        templateLabel,
        pending: { type: 'close', targetId: id },
      })
      return
    }

    const newTabs = openTabs.filter(tab => tab.id !== id)
    setOpenTabs(newTabs)
    if (activeTab === id) {
      if (newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id)
      } else {
        setActiveTab('dashboard')
      }
    }
  }

  const isTemplateActive = templateDocs.some(doc => doc.id === activeTab) && activeTab !== 'file_manager'

  const isOptionsActive = optionsSubItems.some(sub => sub.id === activeTab)

  const activeLabel = templateDocs.find(t => t.id === activeTab)?.label ||
    optionsSubItems.find(t => t.id === activeTab)?.label ||
    sidebarItems.find(t => t.id === activeTab)?.label ||
    activeTab

  useEffect(() => {
    if (!isLoggedIn) {
      document.title = "DAR Docs - Login"
    } else {
      const formattedLabel = typeof activeLabel === 'string' 
        ? activeLabel.charAt(0).toUpperCase() + activeLabel.slice(1) 
        : activeLabel
      document.title = `DAR Docs - ${formattedLabel}`
    }
  }, [isLoggedIn, activeLabel])

  const renderContent = () => {
    if (activeTab === 'file_manager') {
      return <FileManager />
    }

    if (isTemplateActive)
      return (
        <Templates
          activeTab={activeTab}
          currentUser={currentUser}
          onDirtyChange={(dirty, templateId) => {
            setTemplateDirtyById(prev => ({ ...prev, [templateId]: dirty }))
          }}
          registerDraftSaver={(saveDraftFn) => {
            draftSaverRef.current = saveDraftFn
          }}
        />
      )

    if (isOptionsActive) {
      if (currentUser?.role !== 'Admin') return <Dashboard />
      return <Options activeTab={activeTab} currentUser={currentUser} />
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'report':
        return <Reports />
      case 'activity_logs':
        return <Options activeTab={activeTab} currentUser={currentUser} />
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <MdAssessment className="w-20 h-20 mb-4 opacity-20" />
            <p className="font-medium text-lg uppercase tracking-widest">Section under development</p>
          </div>
        )
    }
  }

  // Show Login page if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div
      className={`h-screen w-full grid ${isSidebarCollapsed ? 'grid-cols-[80px_1fr]' : 'grid-cols-[260px_1fr]'} grid-rows-[80px_1fr] overflow-hidden font-sans transition-all duration-300 ease-in-out print:flex print:flex-col print:h-auto print:overflow-visible print:bg-white print:text-black`}
    >
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTemplatesOpen={isTemplatesOpen}
        setIsTemplatesOpen={setIsTemplatesOpen}
        isOptionsOpen={isOptionsOpen}
        setIsOptionsOpen={setIsOptionsOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        openTabs={openTabs}
        setOpenTabs={setOpenTabs}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <div className="row-span-2 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-[80px] bg-[#0B6623] border-b border-[#09501c] flex items-center justify-between px-8 shadow-sm print:hidden">
          <h2 className="text-white text-xl font-semibold capitalize">
            {activeLabel}
          </h2>
          <div className="flex items-center space-x-6 relative">
            <button
              ref={bellRef}
              onClick={toggleNotifPanel}
              className="text-white hover:text-[#F4C430] relative transition-colors duration-200 cursor-pointer flex-shrink-0"
              title="Notifications"
            >
              <MdNotifications className="w-6 h-6" />
              {hasNewNotif && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F4C430] rounded-full border-2 border-[#0B6623]" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div
                ref={notifRef}
                className="absolute top-full right-0 mt-3 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                style={{ animation: 'notifSlideIn 0.2s ease-out' }}
              >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-[#0B6623] to-[#0d7a2b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MdNotifications className="w-5 h-5 text-white/80" />
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">Notifications</h3>
                  </div>
                  <span className="text-[11px] text-white/60 font-medium">
                    {notifications.length} recent
                  </span>
                </div>

                {/* Notification Items */}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <MdNotifications className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((log, i) => {
                      const colors = notifActionColor(log.action)
                      return (
                        <div
                          key={log.id || i}
                          className={`px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors duration-150 cursor-default ${
                            i < notifications.length - 1 ? 'border-b border-slate-100' : ''
                          }`}
                        >
                          {/* Action Icon Circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${colors.bg} ${colors.text}`}>
                            {notifActionIcon(log.action)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[13px] font-semibold text-slate-800 truncate">
                                {log.user || 'System'}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider ${colors.bg} ${colors.text}`}>
                                {log.action}
                              </span>
                            </div>
                            <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">
                              {log.description}
                            </p>
                          </div>

                          {/* Time */}
                          <span className="text-[11px] text-slate-400 font-medium flex-shrink-0 pt-0.5">
                            {formatNotifTime(log.timestamp)}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveTab('activity_logs')
                        setIsNotifOpen(false)
                      }}
                      className="w-full text-center text-xs font-semibold text-[#0B6623] hover:text-[#094d1b] transition-colors cursor-pointer tracking-wide uppercase"
                    >
                      View All Activity Logs
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Tab Bar */}
        {openTabs.length > 0 && (
          <div className="bg-white px-4 flex items-end overflow-x-auto no-scrollbar h-10 border-b border-gray-100 print:hidden">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => {
                  if (tab.id === activeTab) return

                  const isDirty = Boolean(templateDirtyById[activeTab])
                  if (!isDirty) return setActiveTab(tab.id)

                  const templateLabel = openTabs.find(t => t.id === activeTab)?.label || activeTab
                  setTemplateExitModal({
                    isOpen: true,
                    templateId: activeTab,
                    templateLabel,
                    pending: { type: 'switch', targetId: tab.id },
                  })
                }}
                className={`group relative flex items-center min-w-[140px] max-w-[220px] h-[34px] px-4 rounded-t-lg cursor-pointer mx-0.5 ${
                  activeTab === tab.id
                    ? 'bg-[#0B6623] text-white z-10 shadow-sm'
                    : 'bg-[#E8F5E9] text-[#0B6623] hover:bg-[#C8E6C9]'
                }`}
              >
                <div className="flex items-center space-x-2 flex-1 truncate">
                  <MdDescription className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-semibold truncate uppercase tracking-wider">{tab.label}</span>
                </div>
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className={`ml-2 p-0.5 rounded-full hover:bg-black/10 ${activeTab === tab.id ? 'opacity-80' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <MdClose className="w-3.5 h-3.5" />
                </button>
                {activeTab === tab.id && (
                  <>
                    <div className="absolute -left-[1px] bottom-0 w-1 h-1 bg-[#0B6623]" />
                    <div className="absolute -right-[1px] bottom-0 w-1 h-1 bg-[#0B6623]" />
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <main className={`flex-1 bg-white relative ${!isTemplateActive ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {renderContent()}
        </main>

        {/* Template exit warning modal */}
        {templateExitModal.isOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdDescription className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Save changes on "{templateExitModal.templateLabel}"
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Your current edits are not saved. Choose how you want to proceed.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const pending = templateExitModal.pending
                    setTemplateExitModal({ isOpen: false, templateId: null, templateLabel: '', pending: null })

                    if (!pending) return

                    if (pending.type === 'switch') {
                      setActiveTab(pending.targetId)
                    } else if (pending.type === 'close') {
                      const id = pending.targetId
                      const newTabs = openTabs.filter(tab => tab.id !== id)
                      setOpenTabs(newTabs)
                      if (activeTab === id) {
                        if (newTabs.length > 0) setActiveTab(newTabs[newTabs.length - 1].id)
                        else setActiveTab('dashboard')
                      }
                    }
                  }}
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (typeof draftSaverRef.current === 'function') {
                        await draftSaverRef.current()
                      }
                    } catch (err) {
                      console.error('Error saving draft on exit:', err)
                    }

                    const pending = templateExitModal.pending
                    setTemplateExitModal({ isOpen: false, templateId: null, templateLabel: '', pending: null })

                    if (!pending) return
                    if (pending.type === 'switch') {
                      setActiveTab(pending.targetId)
                    } else if (pending.type === 'close') {
                      const id = pending.targetId
                      const newTabs = openTabs.filter(tab => tab.id !== id)
                      setOpenTabs(newTabs)
                      if (activeTab === id) {
                        if (newTabs.length > 0) setActiveTab(newTabs[newTabs.length - 1].id)
                        else setActiveTab('dashboard')
                      }
                    }
                  }}
                  className="w-full py-3 bg-[#0B6623] text-white font-bold rounded-xl hover:bg-[#09501b] transition-colors shadow-lg shadow-[#0B6623]/20"
                >
                  Save as draft
                </button>

                <button
                  onClick={() => setTemplateExitModal({ isOpen: false, templateId: null, templateLabel: '', pending: null })}
                  className="w-full py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
