import { useState } from 'react'
import { MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import darLogo from '../assets/Department_of_Agrarian_Reform_(DAR).svg.png'
import bagongPilipinasLogo from '../assets/Header_Footer/Bagong_Pilipinas_logo.png'
import { apiUrl } from '../utils/apiConfig'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please enter your username and password.')
      return
    }

    setIsLoading(true)

    // Real API call to Django backend
    try {
      const res = await fetch(apiUrl('accounts/login/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        onLogin({
          role: data.role,
          name: data.first_name || data.last_name ? `${data.first_name} ${data.last_name}`.trim() : data.username,
          username: data.username
        })
      } else {
        setError(data.error || 'Invalid username or password.')
      }
    } catch (err) {
      console.error(err)
      setError('Cannot connect to the server.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#F5F5F0]">

      {/* Card Container */}
      <div className="w-full max-w-5xl h-[560px] flex rounded-3xl shadow-2xl overflow-hidden border border-stone-200">

        {/* ── LEFT: Login Credentials ── */}
        <div className="w-1/2 h-full bg-[#FAFAF7] flex flex-col justify-center px-14 py-12">

          {/* Heading */}
          <div className="mb-8">
<h1 className="text-2xl font-extrabold leading-tight tracking-tight" style={{ color: '#0B6623' }}>DAR - DOCS</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Username
              </label>
              <div className="relative">
                <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full bg-white border border-stone-200 text-slate-800 placeholder-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/25 focus:border-[#0B6623] transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-white border border-stone-200 text-slate-800 placeholder-slate-300 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6623]/25 focus:border-[#0B6623] transition-all duration-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword
                    ? <MdVisibilityOff className="w-5 h-5" />
                    : <MdVisibility className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0B6623] text-white font-bold py-3.5 rounded-xl text-sm tracking-wide shadow-md shadow-[#0B6623]/20 hover:bg-[#09501c] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-stone-400 text-[11px] text-center mt-8">
            For account access, contact your system administrator.
          </p>
        </div>

        {/* ── RIGHT: Branding ── */}
        <div className="w-1/2 h-full bg-[#0B6623] flex flex-col items-center justify-center px-12 py-10 relative overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute top-[-60px] right-[-60px] w-56 h-56 bg-white/5 rounded-full" />
          <div className="absolute bottom-[-80px] left-[-50px] w-72 h-72 bg-[#F4C430]/10 rounded-full" />
          <div className="absolute top-1/3 right-[-30px] w-32 h-32 bg-white/5 rounded-full" />

          {/* Logos */}
          <div className="relative z-10 flex items-center justify-center gap-8 mb-8">
            <img src={darLogo} alt="DAR Logo" className="h-20 w-auto drop-shadow-lg" />
            <div className="w-px h-14 bg-white/20" />
            <img src={bagongPilipinasLogo} alt="Bagong Pilipinas" className="h-20 w-auto drop-shadow-lg" />
          </div>

          {/* Company name / org info */}
          <div className="relative z-10 text-center space-y-2">
            <p className="text-white/50 text-[11px] font-semibold tracking-[0.25em] uppercase">
              Republic of the Philippines
            </p>
            <h2 className="text-white text-2xl font-black leading-snug">
              Department of<br />Agrarian Reform
            </h2>
            <div className="inline-block bg-[#F4C430] text-[#0B6623] text-xs font-black px-4 py-1 rounded-full tracking-widest uppercase mt-1">
              Regional Office I
            </div>
          </div>

          {/* Tagline */}
          <p className="relative z-10 text-white/40 text-xs italic mt-6 text-center leading-relaxed">
            "Tunay na Pagbabago sa Repormang Agraryo"
          </p>

          {/* Bottom label */}
          <p className="absolute bottom-5 z-10 text-white/20 text-[10px] tracking-widest uppercase">
DAR Docs &copy; {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login
