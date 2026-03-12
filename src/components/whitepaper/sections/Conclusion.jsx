import { Link } from 'react-router-dom'

export default function Conclusion() {
  return (
    <>
      <div id="conclusion" className="px-[68px] py-[120px] text-center relative overflow-hidden max-md:px-6 max-md:py-20">
        {/* mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-30%] left-[10%] w-[80vw] h-[80vw] rounded-full" style={{ background: 'radial-gradient(ellipse,rgba(45,252,68,0.12) 0%,rgba(45,252,68,0.04) 40%,transparent 65%)' }} />
          <div className="absolute bottom-[-20%] right-[5%] w-[50vw] h-[50vw] rounded-full" style={{ background: 'radial-gradient(ellipse,rgba(80,200,255,0.08) 0%,transparent 60%)' }} />
        </div>

        <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-5 relative">
          Section 16 — Conclusion
        </span>
        <h2 className="reveal font-serif font-light tracking-[-0.05em] leading-[0.97] text-ink mb-5 relative"
          style={{ fontSize: 'clamp(42px,6.2vw,80px)' }}>
          Ready to<br /><em className="italic text-green-dark">execute?</em>
        </h2>
        <p className="reveal text-[14.5px] font-light text-[#777] max-w-[400px] mx-auto mb-11 leading-[1.72] tracking-[-0.01em] relative">
          Work3 Labs provides the execution infrastructure Web3 has lacked. Join Phase 1 and build your on-chain reputation from day one.
        </p>
        <div className="reveal delay-1 flex gap-3 justify-center flex-wrap relative">
          <Link to="/apply?type=talent" className="text-[13.5px] font-medium text-paper bg-ink px-[26px] py-3 rounded-full transition-colors hover:bg-[#1f1f1f]">
            Apply as Talent
          </Link>
          <Link to="/apply?type=project" className="text-[13.5px] font-normal text-ink border border-black/[0.16] px-[26px] py-3 rounded-full transition-colors hover:border-ink">
            Submit a Project
          </Link>
        </div>
      </div>

      <footer className="border-t border-black/[0.07] px-[68px] py-[30px] grid grid-cols-[1fr_auto_1fr] items-center gap-5 max-md:px-6 max-md:grid-cols-1 max-md:text-center max-md:gap-5">
        <a href="#cover" className="max-md:flex max-md:justify-center">
          <img src="/logo.png" alt="Work3 Labs" className="h-6" />
        </a>
        <ul className="flex gap-[22px] list-none max-md:justify-center max-md:flex-wrap">
          {['Whitepaper', 'Documentation', 'Twitter', 'Discord', 'Telegram'].map((l) => (
            <li key={l}>
              <a href="#" className="text-[12.5px] font-light text-[#AAA] tracking-[-0.01em] hover:text-ink transition-colors">{l}</a>
            </li>
          ))}
        </ul>
        <span className="font-mono text-[9.5px] text-[#C8C8C8] tracking-[0.06em] text-right max-md:text-center">
          Work3 Labs v1.0 — 2025
        </span>
      </footer>
    </>
  )
}
