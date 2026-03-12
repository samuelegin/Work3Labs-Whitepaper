import { useEffect, useRef, useState, useCallback } from 'react'

const RISKS = [
  { n: '01', tag: 'Talent Quality',   title: 'Inconsistent Contributor Performance', body: 'Early-phase contributors may deliver inconsistent outcomes before PoP data matures. Mitigated by human-validated matching in Phase 1 and progressive performance gating.' },
  { n: '02', tag: 'Market Adoption',  title: 'Web3 Project Engagement',              body: 'Projects may default to familiar hiring methods. Addressed by Apex Agency relationships and demonstrable ROI from Phase 1 managed engagements.' },
  { n: '03', tag: 'Regulatory',       title: 'Evolving Legal Landscape',             body: 'Web3 labor and token regulation remains uncertain across jurisdictions. Work3 Labs monitors regulatory developments and structures operations to maintain flexibility.' },
  { n: '04', tag: 'Technical',        title: 'On-chain Data Integrity',              body: 'Anchoring performance data on-chain introduces complexity and cost. Off-chain-first architecture in Phases 1-2 limits exposure while maintaining optionality for Phase 3.' },
  { n: '05', tag: 'Competition',      title: 'Existing Freelance Platforms',         body: 'Established platforms may introduce Web3 features. Work3 Labs differentiates through pod-native architecture, PoP primitives, and reputation compounding over time.' },
  { n: '06', tag: 'Ecosystem',        title: 'Web3 Market Cycles',                   body: "Crypto bear markets reduce project budgets and Web3 hiring. The platform's value proposition extends to Web2 talent operating in Web3 contexts, reducing cycle dependence." },
]

// ANIMATION PHASES
// idle    -> card at rest, fully visible
// exit    -> card PUNCHES hard left THROUGH the wall: translateX(-130%)
//            easing: cubic-bezier(0.9,0,1,0.5) — near-instant acceleration, zero deceleration
//            no scale, no fade — pure lateral violence, like it got yanked
// waiting -> next card pre-painted off-screen RIGHT with transition:none (no flash)
// enter   -> next card springs in from right, decelerating spring ease

const EXIT_MS    = 280
const ENTER_MS   = 540
const EXIT_EASE  = 'cubic-bezier(0.9, 0, 1, 0.5)'
const ENTER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

export default function Risks() {
  const sectionRef               = useRef(null)
  const [index,     setIndex]    = useState(0)
  const [anim,      setAnim]     = useState('idle')
  const [isDesktop, setIsDesktop]= useState(false)

  const idxRef  = useRef(0)
  const animRef = useRef('idle')
  const locked  = useRef(false)
  const busy    = useRef(false)

  const sa = (v) => { setAnim(v);  animRef.current = v }
  const si = (v) => { setIndex(v); idxRef.current  = v }

  // Desktop detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Lock helpers
  const lock   = () => { document.body.style.overflow = 'hidden'; locked.current = true  }
  const unlock = () => { document.body.style.overflow = '';       locked.current = false }
  useEffect(() => () => unlock(), [])

  // Centering check — lock ONLY when section is fully centered in viewport.
  // Uses 'scrollend' (Chrome 114+) with a 200ms setTimeout fallback.
  // When centered: snaps section into exact center, then locks scroll.
  useEffect(() => {
    if (!isDesktop) return
    const el = sectionRef.current
    if (!el) return

    const isCentered = () => {
      const r     = el.getBoundingClientRect()
      const elMid = r.top + r.height / 2
      const vpMid = window.innerHeight / 2
      // Within 10% of viewport height = "centered"
      return Math.abs(elMid - vpMid) < window.innerHeight * 0.10
    }

    const tryLock = () => {
      if (animRef.current === 'done' || locked.current) return
      if (isCentered()) {
        // Snap precisely to center, then lock
        el.scrollIntoView({ behavior: 'instant', block: 'center' })
        lock()
      }
    }

    let fallbackTimer = null
    const onScroll = () => {
      clearTimeout(fallbackTimer)
      fallbackTimer = setTimeout(tryLock, 200)
    }

    // 'scrollend' fires when scroll animation fully stops (Chrome 114+)
    const onScrollEnd = () => tryLock()

    window.addEventListener('scroll',    onScroll,    { passive: true })
    window.addEventListener('scrollend', onScrollEnd, { passive: true })
    tryLock()

    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('scrollend', onScrollEnd)
      clearTimeout(fallbackTimer)
    }
  }, [isDesktop])

  // Wall-punch advance
  const advance = useCallback(() => {
    if (busy.current)                        return
    if (animRef.current === 'done')          return
    if (idxRef.current >= RISKS.length - 1)  return

    busy.current = true
    sa('exit')

    setTimeout(() => {
      const next = idxRef.current + 1
      si(next)
      sa('waiting') // instant, no transition

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sa('enter')
          setTimeout(() => {
            sa('idle')
            busy.current = false
            if (next >= RISKS.length - 1) {
              setTimeout(() => { sa('done'); animRef.current = 'done'; unlock() }, 300)
            }
          }, ENTER_MS)
        })
      })
    }, EXIT_MS)
  }, [])

  // Wheel
  useEffect(() => {
    if (!isDesktop) return
    const fn = (e) => {
      if (!locked.current || e.deltaY <= 0) return
      e.preventDefault(); e.stopPropagation()
      advance()
    }
    window.addEventListener('wheel', fn, { passive: false })
    return () => window.removeEventListener('wheel', fn)
  }, [isDesktop, advance])

  // Keyboard
  useEffect(() => {
    if (!isDesktop) return
    const fn = (e) => {
      if (!locked.current) return
      if (['ArrowDown','ArrowRight',' '].includes(e.key)) { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [isDesktop, advance])

  // Touch
  useEffect(() => {
    if (!isDesktop) return
    let sy = 0
    const s = (e) => { sy = e.touches[0].clientY }
    const e = (e) => { if (locked.current && sy - e.changedTouches[0].clientY > 40) advance() }
    window.addEventListener('touchstart', s, { passive: true })
    window.addEventListener('touchend',   e, { passive: true })
    return () => { window.removeEventListener('touchstart', s); window.removeEventListener('touchend', e) }
  }, [isDesktop, advance])

  const cardStyle = () => {
    switch (anim) {
      case 'exit': return {
        // No scale, no opacity fade — pure hard lateral punch through the left wall
        transform:  'translateX(-130%)',
        opacity:    1,
        transition: `transform ${EXIT_MS}ms ${EXIT_EASE}`,
        willChange: 'transform',
      }
      case 'waiting': return {
        transform:  'translateX(110%)',
        opacity:    1,
        transition: 'none',
      }
      case 'enter': return {
        transform:  'translateX(0)',
        opacity:    1,
        transition: `transform ${ENTER_MS}ms ${ENTER_EASE}`,
        willChange: 'transform',
      }
      default: return {
        transform:  'translateX(0)',
        opacity:    1,
        transition: `transform ${ENTER_MS}ms ${ENTER_EASE}`,
      }
    }
  }

  const card   = RISKS[index]
  const isDone = anim === 'done'

  // Mobile grid
  const mobileGrid = (
    <div className="mt-[52px] grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
      {RISKS.map(r => (
        <div key={r.tag} className="bg-white border border-black/[0.07] rounded-[14px] px-[30px] py-[34px]">
          <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-[#C0C0C0] block mb-3">{r.tag}</span>
          <h3 className="font-serif text-[19px] font-light text-ink tracking-[-0.03em] leading-[1.2] mb-2.5">{r.title}</h3>
          <p className="text-[13px] font-light text-[#777] leading-[1.7] tracking-[-0.01em]">{r.body}</p>
        </div>
      ))}
    </div>
  )

  // Desktop sequence
  const desktopSequence = (
    <div className="mt-[52px]">

      {/* Progress bar */}
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:40 }}>
        <div style={{ flex:1, height:1, background:'rgba(0,0,0,0.07)', position:'relative', overflow:'hidden', borderRadius:999 }}>
          <div style={{
            position:'absolute', inset:'0 auto 0 0',
            width:`${((index+1)/RISKS.length)*100}%`,
            background:'#1DC433', opacity:0.5, borderRadius:999,
            transition:`width ${ENTER_MS}ms ${ENTER_EASE}`,
          }}/>
        </div>
        <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.12em', color:'#CCC', flexShrink:0 }}>
          {String(index+1).padStart(2,'0')} / {String(RISKS.length).padStart(2,'0')}
        </span>
      </div>

      {/* Stage: overflow hidden = the "wall" cards disappear into */}
      <div style={{ overflow:'hidden', borderRadius:18 }}>
        <div style={cardStyle()}>
          <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 40px rgba(0,0,0,0.04)' }}>

            {/* Card header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 40px', borderBottom:'1px solid rgba(0,0,0,0.06)', background:'#FAFAF8' }}>
              <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#C8C8C8' }}>
                Risk {card.n}
              </span>
              <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1DC433', border:'1px solid rgba(29,196,51,0.3)', background:'rgba(29,196,51,0.06)', borderRadius:999, padding:'5px 13px' }}>
                {card.tag}
              </span>
            </div>

            {/* Card body */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:40, alignItems:'center', padding:'52px 40px', minHeight:260 }}>
              <div>
                <h3 style={{ fontFamily:'Fraunces,Georgia,serif', fontWeight:300, fontSize:'clamp(24px,2.6vw,38px)', color:'#0D0D0D', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:20 }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:300, color:'#666', lineHeight:1.8, letterSpacing:'-0.01em', maxWidth:560 }}>
                  {card.body}
                </p>
              </div>
              {/* Ghost number */}
              <div style={{ fontFamily:'Fraunces,Georgia,serif', fontWeight:200, fontSize:'clamp(80px,8vw,128px)', lineHeight:1, letterSpacing:'-0.06em', color:'rgba(0,0,0,0.035)', userSelect:'none', flexShrink:0 }}>
                {card.n}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 40px 28px' }}>
              {RISKS.map((_,i) => (
                <div key={i} style={{ height:5, borderRadius:999, width:i===index?22:5, background:i===index?'#1DC433':i<index?'rgba(29,196,51,0.22)':'rgba(0,0,0,0.09)', transition:`all ${ENTER_MS}ms ${ENTER_EASE}` }}/>
              ))}
              <div style={{ marginLeft:'auto' }}>
                {!isDone ? (
                  <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.1em', color:'#C8C8C8', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ display:'inline-block', animation:'riskBounce 1.6s ease-in-out infinite' }}>↓</span>
                    scroll to continue
                  </span>
                ) : (
                  <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.1em', color:'#1DC433', opacity:0.7 }}>
                    ✓ all risks acknowledged
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`@keyframes riskBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}`}</style>
    </div>
  )

  return (
    <div id="risks" ref={sectionRef} className="bg-alt border-t border-b border-black/[0.06] px-[68px] py-24 max-lg:px-6 max-lg:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 14 — Risk Considerations
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink mb-[18px]" style={{ fontSize:'clamp(30px,3.6vw,50px)' }}>
        Acknowledged and <em className="italic text-green-dark">addressed.</em>
      </h2>
      <p className="reveal text-[14.5px] font-light text-[#888] leading-[1.74] max-w-[480px] tracking-[-0.01em]">
        Every protocol has risk. These are the ones we have identified, modelled, and built explicit mitigations for.
      </p>
      {isDesktop ? desktopSequence : mobileGrid}
    </div>
  )
}
