import React, { useState } from 'react'
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdLogout,
  MdClose,
  MdCheckCircle,
  MdError,
  MdDescription,
  MdInsertDriveFile,
} from 'react-icons/md'

import darLogo from '../../assets/Department_of_Agrarian_Reform_(DAR).svg.png'
import { changePassword } from '../../utils/supabaseServices'
import { sidebarItems, templateDocs, optionsSubItems } from './sidebarConstants'

const Sidebar = ({
  activeTab,
  setActiveTab,
  isTemplatesOpen,
  setIsTemplatesOpen,
  isOptionsOpen,
  setIsOptionsOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  openTabs,
  setOpenTabs,
  onLogout,
  currentUser,
}) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordStatus, setPasswordStatus] = useState({ isOpen: false, type: 'success', message: '' })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const isOptionsActive = optionsSubItems.some(sub => sub.id === activeTab)

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ isOpen: true, type: 'error', message: 'All fields are required.' })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ isOpen: true, type: 'error', message: 'New password and confirm password do not match.' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ isOpen: true, type: 'error', message: 'New password must be at least 6 characters long.' })
      return
    }

    setIsChangingPassword(true)
    try {
      const { data, error } = await changePassword(passwordForm.newPassword)

      if (error) {
        throw new Error(error.message || 'Failed to change password.')
      }

      setPasswordStatus({ isOpen: true, type: 'success', message: 'Password changed successfully!' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        setIsChangePasswordOpen(false)
        setPasswordStatus({ isOpen: false, type: 'success', message: '' })
      }, 2000)
    } catch (err) {
      console.error(err)
      setPasswordStatus({ isOpen: true, type: 'error', message: err?.message || 'Failed to change password.' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (currentUser?.role !== 'Admin' && item.id === 'options') {
      return false
    }
    return true
  })

  const handleOpenTab = (item, isTemplate = false) => {
    setActiveTab(item.id)
    if (isTemplate) {
      if (!openTabs.find(tab => tab.id === item.id)) {
        setOpenTabs([...openTabs, { ...item, icon: MdDescription }])
      }
    }
  }

  return (
    <div className="row-span-2 flex flex-col bg-[#0B6623] border-r border-[#09501c] print:hidden">

      {/* Logo / Collapse Toggle */}
      <div className={`h-[80px] border-b border-[#09501c] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 transition-all duration-300`}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="flex items-center space-x-3 group/logo focus:outline-none"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover/logo:bg-emerald-100 transition-all duration-300 overflow-hidden p-1">
            <img src={darLogo} alt="DAR Logo" className="w-[85%] h-[85%] object-contain" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-white font-bold text-lg tracking-tight group-hover/logo:text-emerald-100 transition-all duration-300">
              DAR Docs
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <aside className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'p-3' : 'p-6'} flex flex-col`}>
        <nav className="space-y-1">
          {filteredSidebarItems.map((item) => (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (item.hasDropdown) {
                    if (item.id === 'templates') setIsTemplatesOpen(!isTemplatesOpen)
                    if (item.id === 'options') setIsOptionsOpen(!isOptionsOpen)
                    if (isSidebarCollapsed) setIsSidebarCollapsed(false)
                  } else {
                    handleOpenTab(item, false)
                  }
                }}
                title={isSidebarCollapsed ? item.label : ''}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl group transition-all duration-300 ${
                  activeTab === item.id || (item.id === 'options' && isOptionsActive)
                    ? 'bg-[#F4C430] text-[#0B6623] shadow-md shadow-black/20'
                    : 'text-emerald-50 hover:bg-[#F4C430] hover:text-[#0B6623]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </div>
                {!isSidebarCollapsed && item.hasDropdown && (
                  <div className="transition-transform duration-300">
                    {(item.id === 'templates' ? isTemplatesOpen : isOptionsOpen)
                      ? <MdKeyboardArrowDown className="w-5 h-5" />
                      : <MdKeyboardArrowRight className="w-5 h-5" />}
                  </div>
                )}
              </button>

              {/* Templates Dropdown */}
              {item.id === 'templates' && isTemplatesOpen && !isSidebarCollapsed && (
                <div className="pl-6 mt-1 space-y-1 transition-all duration-300">
                  {templateDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleOpenTab(doc, true)}
                      className={`w-full flex items-center px-4 py-2 rounded-lg text-xs transition-all duration-300 ${
                        activeTab === doc.id
                          ? 'bg-white/10 text-[#F4C430] font-semibold'
                          : 'text-emerald-100/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <MdInsertDriveFile className={`w-4 h-4 mr-3 transition-colors duration-300 ${activeTab === doc.id ? 'text-[#F4C430]' : 'text-emerald-100/40'}`} />
                      <span>{doc.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Options Dropdown */}
              {item.id === 'options' && isOptionsOpen && !isSidebarCollapsed && (
                <div className="pl-6 mt-1 space-y-1 transition-all duration-300">
                  {optionsSubItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveTab(sub.id)}
                      className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                        activeTab === sub.id
                          ? 'bg-white/10 text-[#F4C430] font-semibold'
                          : 'text-emerald-100/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <sub.icon className={`w-4 h-4 mr-3 transition-colors duration-300 ${activeTab === sub.id ? 'text-[#F4C430]' : 'text-emerald-100/40'}`} />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* User Profile Footer */}
      <div className="p-4">
        <div
          onClick={() => setIsChangePasswordOpen(true)}
          className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all duration-300`}
          title="Click to change password"
        >
          <div className="w-10 h-10 bg-white/10 rounded-full border border-white/20 flex items-center justify-center text-white font-bold shadow-inner flex-shrink-0 transition-all duration-300">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0 transition-all duration-300">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-emerald-100/60 truncate">{currentUser?.role || 'Role'}</p>
            </div>
          )}
          {!isSidebarCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsLogoutModalOpen(true)
              }}
              title="Logout"
              className="text-emerald-100/40 hover:text-white transition-colors duration-300"
            >
              <MdLogout className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Change Password</h3>
              <button 
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                <input 
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password"
                  placeholder="Enter your new password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input 
                  type="password"
                  placeholder="Confirm your new password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/20 focus:border-[#0B6623]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsChangePasswordOpen(false)}
                className="flex-1 px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 px-5 py-2.5 rounded-xl font-medium bg-[#0B6623] text-white hover:bg-[#09501b] shadow-sm shadow-[#0B6623]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Status Modal */}
      {passwordStatus.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            {passwordStatus.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdCheckCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdError className="w-8 h-8" />
              </div>
            )}
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {passwordStatus.type === 'success' ? 'Success!' : 'Error'}
            </h3>
            <p className="text-slate-500 text-sm mb-8">{passwordStatus.message}</p>
            
            <button 
              onClick={() => setPasswordStatus({ ...passwordStatus, isOpen: false })} 
              className={`w-full py-3 text-white font-bold rounded-xl transition-colors shadow-lg ${
                passwordStatus.type === 'success' 
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdLogout className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Logout</h3>
            <p className="text-slate-500 text-sm mb-8">Are you sure you want to log out of your session?</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsLogoutModalOpen(false)} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsLogoutModalOpen(false)
                  onLogout()
                }} 
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
