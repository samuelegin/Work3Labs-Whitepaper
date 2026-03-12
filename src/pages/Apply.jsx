import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina',
  'Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados',
  'Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina',
  'Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon',
  'Canada','Cape Verde','Central African Republic','Chad','Chile','China','Colombia',
  'Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Djibouti','Dominican Republic','DR Congo','Ecuador','Egypt','El Salvador',
  'Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guatemala','Guinea','Guinea-Bissau',
  'Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya',
  'Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya',
  'Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives',
  'Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway',
  'Oman','Pakistan','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland',
  'Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia',
  'Sierra Leone','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Trinidad and Tobago',
  'Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam',
  'Yemen','Zambia','Zimbabwe',
]

const inputBase = `font-sans text-[14px] font-light text-ink bg-white border-[1.5px] border-black/[0.09] rounded-[10px] px-3.5 py-3 outline-none transition-all duration-150 w-full placeholder-[#D0D0D0]
  focus:border-green focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]`
const inputErr  = `border-[#E53E3E] shadow-[0_0_0_3px_rgba(229,62,62,0.06)]`

export default function Apply() {
  const [params] = useSearchParams()
  const [mode, setMode]         = useState(params.get('type') === 'project' ? 'project' : 'talent')
  const [consented, setConsented] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [refId, setRefId]       = useState('')
  const [progress, setProgress] = useState(0)

  const [fields, setFields] = useState({ fn:'', ln:'', em:'', un:'', co:'' })
  const [errors, setErrors] = useState({})

  // progress bar
  useEffect(() => {
    const filled = Object.values(fields).filter(Boolean).length + (consented ? 1 : 0)
    setProgress(Math.round((filled / 6) * 100))
  }, [fields, consented])

  function update(key, val) {
    setFields(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: false }))
  }

  function validate() {
    const errs = {}
    if (!fields.fn.trim())  errs.fn = 'Required'
    if (!fields.ln.trim())  errs.ln = 'Required'
    if (!fields.em.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.em)) errs.em = 'Enter a valid email address'
    if (!fields.un.trim())  errs.un = 'Required'
    if (!fields.co)         errs.co = 'Please select your country'
    if (!consented)         errs.consent = true
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function submit() {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const ref = 'W3L-' + Date.now().toString(36).toUpperCase().slice(-6)
      setRefId(ref)
      setProgress(100)
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1800)
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[65vw] h-[65vw] rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(45,252,68,0.07) 0%,rgba(45,252,68,0.02) 40%,transparent 70%)' }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(80,200,255,0.05) 0%,transparent 65%)' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-[200] h-[56px] flex items-center justify-between px-10 bg-[rgba(250,250,248,0.92)] backdrop-blur-xl border-b border-black/[0.07] max-sm:px-5">
        <Link to="/">
          <img src="/logo.png" alt="Work3 Labs" className="h-6 block" />
        </Link>
        <Link to="/" className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] flex items-center gap-1.5 hover:text-ink transition-colors">
          ← Back to Whitepaper
        </Link>
      </nav>

      {/* Progress bar */}
      <div className="fixed top-[56px] inset-x-0 h-[2px] bg-black/[0.05] z-[199]">
        <div className="h-full bg-green transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 pt-[56px] flex items-center justify-center min-h-screen relative z-[1]">
        <div className="w-full max-w-[460px] mx-6 my-16">

          {/* SUCCESS */}
          {success && (
            <div className="text-center pt-10 pb-5 flex flex-col items-center pop-anim">
              <div className="w-[60px] h-[60px] rounded-full bg-green flex items-center justify-center mb-[22px]">
                <i className="bi bi-check-lg text-[26px] text-ink" />
              </div>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] mb-3.5">Application Received</span>
              <h2 className="font-serif font-light leading-[0.95] tracking-[-0.05em] text-ink mb-3.5"
                style={{ fontSize: 'clamp(32px,5vw,46px)' }}>
                You're on the <em className="italic text-green">list.</em>
              </h2>
              <p className="text-[14px] font-light text-[#999] leading-[1.68] tracking-[-0.01em] max-w-[320px] mb-5">
                We'll review your application and send a dashboard link to your email. Once you click it, you'll complete your profile directly in the platform.
              </p>
              <p className="font-mono text-[10.5px] tracking-[0.06em] text-[#CCC] mb-7 flex items-center gap-1.5 justify-center">
                # Ref: <span className="text-ink font-medium">{refId}</span>
              </p>
              <div className="flex gap-2.5 flex-wrap justify-center">
                <Link to="/" className="px-[22px] py-3 bg-ink text-paper rounded-[9px] text-[14px] font-medium tracking-[-0.01em] hover:bg-[#222] transition-colors">
                  Read the Whitepaper
                </Link>
                <Link to="/" className="px-[22px] py-3 border-[1.5px] border-black/[0.1] text-[#666] rounded-[9px] text-[14px] font-normal tracking-[-0.01em] hover:border-black/25 transition-colors">
                  Back to Site
                </Link>
              </div>
            </div>
          )}

          {/* FORM */}
          {!success && (
            <>
              {/* Eyebrow */}
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] flex items-center gap-2.5 mb-[18px]"
                style={{ opacity: 0, animation: 'up 0.8s 0.05s both' }}>
                <span className="block w-5 h-px bg-[#D0D0D0]" />
                Early Access
              </div>

              {/* Title */}
              <h1 className="font-serif font-extralight leading-[0.93] tracking-[-0.05em] text-ink mb-3.5"
                style={{ fontSize: 'clamp(38px,6vw,58px)', opacity: 0, animation: 'up 0.9s 0.12s both' }}>
                limited spots.<br /><em className="italic text-green">Apply now.</em>
              </h1>

              <p className="text-[14.5px] font-light text-[#888] leading-[1.68] tracking-[-0.01em] mb-[30px]"
                style={{ opacity: 0, animation: 'up 0.8s 0.2s both' }}>
                If accepted, you'll receive a dashboard link by email to complete your profile and join a pod.
              </p>

              {/* Spots pill */}
              <div className="inline-flex items-center gap-[9px] bg-white border border-black/[0.07] rounded-full px-3.5 py-2 mb-8"
                style={{ opacity: 0, animation: 'up 0.8s 0.27s both' }}>
                <span className="w-[7px] h-[7px] rounded-full bg-green flex-shrink-0"
                  style={{ boxShadow: '0 0 0 3px rgba(45,252,68,0.15)' }} />
                <span className="font-mono text-[10px] tracking-[0.05em] text-[#888]">
                  Limited spots available — reviewed in order of application
                </span>
              </div>

              {/* Type selector */}
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-2.5"
                style={{ opacity: 0, animation: 'up 0.8s 0.38s both' }}>
                I am applying as a —
              </span>
              <div className="grid grid-cols-2 gap-2 mb-6"
                style={{ opacity: 0, animation: 'up 0.8s 0.43s both' }}>
                {[
                  { key:'talent',  icon:'bi-person-check', label:'Talent',  sub:'I want to execute' },
                  { key:'project', icon:'bi-buildings',    label:'Project', sub:'I need a pod' },
                ].map(({ key, icon, label, sub }) => {
                  const sel = mode === key
                  return (
                    <button
                      key={key}
                      onClick={() => setMode(key)}
                      className={`flex items-center gap-2.5 px-4 py-3.5 rounded-[11px] border-[1.5px] bg-white cursor-pointer text-left transition-all
                        ${sel ? 'border-green' : 'border-black/[0.09] hover:border-black/[0.18]'}`}
                      style={sel ? { backgroundColor: 'rgba(45,252,68,0.03)' } : {}}
                    >
                      <div className={`w-[30px] h-[30px] rounded-[7px] border flex items-center justify-center text-[14px] flex-shrink-0 transition-all
                        ${sel ? 'bg-green border-green text-ink' : 'bg-[#F4F4F2] border-black/[0.07] text-[#999]'}`}>
                        <i className={`bi ${icon}`} />
                      </div>
                      <div className="flex-1">
                        <span className="font-serif text-[15px] font-light text-ink tracking-[-0.02em] block leading-none mb-0.5">{label}</span>
                        <span className="text-[11px] font-light text-[#CCC] leading-none">{sub}</span>
                      </div>
                      <div className={`w-[17px] h-[17px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all
                        ${sel ? 'bg-green border-green' : 'border-[#DDD]'}`}>
                        {sel && <i className="bi bi-check text-[8px] text-ink" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-[11px]" style={{ opacity: 0, animation: 'up 0.8s 0.48s both' }}>
                {/* Name row */}
                <div className="grid grid-cols-2 gap-[11px]">
                  {[['fn','First Name','Adaeze','given-name'],['ln','Last Name','Kalu','family-name']].map(([id,label,ph,ac]) => (
                    <div key={id} className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-normal text-[#555] tracking-[-0.01em]">
                        {label} <span className="text-green text-[11px]">*</span>
                      </label>
                      <input
                        className={`${inputBase} ${errors[id] ? inputErr : ''}`}
                        value={fields[id]}
                        onChange={e => update(id, e.target.value)}
                        placeholder={ph}
                        autoComplete={ac}
                      />
                      {errors[id] && <span className="text-[11.5px] text-[#E53E3E] flex items-center gap-1">⚠ {errors[id]}</span>}
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-[#555] tracking-[-0.01em]">
                    Email Address <span className="text-green text-[11px]">*</span>
                  </label>
                  <div className="relative">
                    <i className="bi bi-envelope absolute left-[13px] top-1/2 -translate-y-1/2 text-[14px] text-[#D0D0D0] pointer-events-none" />
                    <input
                      className={`${inputBase} pl-[37px] ${errors.em ? inputErr : ''}`}
                      type="email"
                      value={fields.em}
                      onChange={e => update('em', e.target.value)}
                      placeholder="adaeze@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.em && <span className="text-[11.5px] text-[#E53E3E] flex items-center gap-1">⚠ {errors.em}</span>}
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-[#555] tracking-[-0.01em]">
                    Username <span className="text-green text-[11px]">*</span>
                  </label>
                  <div className="relative">
                    <i className="bi bi-at absolute left-[13px] top-1/2 -translate-y-1/2 text-[14px] text-[#D0D0D0] pointer-events-none" />
                    <input
                      className={`${inputBase} pl-[37px] ${errors.un ? inputErr : ''}`}
                      value={fields.un}
                      onChange={e => update('un', e.target.value)}
                      placeholder="your_handle"
                      autoComplete="username"
                    />
                  </div>
                  {errors.un && <span className="text-[11.5px] text-[#E53E3E] flex items-center gap-1">⚠ {errors.un}</span>}
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-[#555] tracking-[-0.01em]">
                    Country <span className="text-green text-[11px]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={`${inputBase} appearance-none pr-9 cursor-pointer ${errors.co ? inputErr : ''}`}
                      value={fields.co}
                      onChange={e => update('co', e.target.value)}
                    >
                      <option value="" disabled>Select your country</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="7" viewBox="0 0 11 7">
                      <path d="M1 1l4.5 4.5L10 1" stroke="#AAAAAA" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {errors.co && <span className="text-[11.5px] text-[#E53E3E] flex items-center gap-1">⚠ {errors.co}</span>}
                </div>
              </div>

              {/* Consent */}
              <div
                onClick={() => { setConsented(v => !v); setErrors(e => ({ ...e, consent: false })) }}
                className={`flex items-start gap-3 px-[15px] py-[15px] bg-white border-[1.5px] rounded-[10px] cursor-pointer transition-all mt-[6px]
                  ${consented ? 'border-green' : errors.consent ? 'border-[#E53E3E]' : 'border-black/[0.07]'}`}
                style={{ opacity: 0, animation: 'up 0.8s 0.54s both' }}
              >
                <div className={`w-[19px] h-[19px] rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-[1px] transition-all
                  ${consented ? 'bg-green border-green' : 'border-[#DDD] bg-white'}`}>
                  {consented && <i className="bi bi-check text-[9px] text-ink" />}
                </div>
                <span className="text-[12.5px] font-light text-[#999] leading-[1.56] tracking-[-0.01em]">
                  I understand that spots are limited and acceptance is not guaranteed. If approved, I'll receive a dashboard link by email to complete my profile.
                </span>
              </div>

              {/* Submit */}
              <div className="mt-3.5" style={{ opacity: 0, animation: 'up 0.8s 0.6s both' }}>
                <button
                  onClick={submit}
                  disabled={loading}
                  className={`w-full py-[15px] px-6 bg-ink text-paper rounded-[10px] font-sans text-[15px] font-medium tracking-[-0.01em] flex items-center justify-center gap-2.5 transition-colors hover:bg-[#222] active:scale-[0.99] border-none cursor-pointer relative overflow-hidden ${loading ? 'pointer-events-none' : ''}`}
                >
                  {loading ? (
                    <span className="w-[18px] h-[18px] border-2 border-white/25 border-t-white rounded-full spin-anim" />
                  ) : (
                    <>
                      <span>Request Early Access</span>
                      <i className="bi bi-arrow-right text-[15px]" />
                    </>
                  )}
                </button>
                <p className="font-mono text-[9.5px] tracking-[0.04em] text-[#CCC] text-center mt-3 flex items-center justify-center gap-1.5">
                  <i className="bi bi-lock text-[10px]" /> No spam · Reviewed manually · Dashboard link sent on approval
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
