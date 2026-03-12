const layers = [
  {
    n: 'Layer 01', title: 'Data Layer',
    body: 'Execution data stored off-chain for scalability. Select performance signals anchored on-chain for integrity where required by the protocol.',
    chips: ['Off-chain Storage', 'On-chain Anchoring', 'Integrity Proofs'],
  },
  {
    n: 'Layer 02', title: 'AI and Matching',
    body: 'Rule-based filters for eligibility. Performance-weighted algorithms. Continuous learning from real execution outcomes across the network.',
    chips: ['Collaborative Filtering', 'Role Weighting', 'ML Feedback Loop'],
  },
  {
    n: 'Layer 03', title: 'Integrations',
    body: 'Native wallet connectivity, DAO tooling integration, and project management hooks for seamless execution tracking and reporting.',
    chips: ['Wallets', 'DAO Tooling', 'PM Tools'],
  },
]

export default function Architecture() {
  return (
    <div id="arch" className="bg-ink px-[68px] py-24 relative overflow-hidden max-md:px-6 max-md:py-14">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full" style={{ background:'radial-gradient(ellipse,rgba(45,252,68,0.10) 0%,transparent 65%)' }} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full" style={{ background:'radial-gradient(ellipse,rgba(60,180,255,0.07) 0%,transparent 65%)' }} />
      </div>
      <div className="relative">
        <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-white/25 block mb-[18px]">
          Section 09 — Technology Architecture
        </span>
        <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-paper mb-[18px]"
          style={{ fontSize:'clamp(30px,3.6vw,50px)' }}>
          Infrastructure built to scale.
        </h2>
        <p className="reveal text-[14.5px] font-light text-white/40 leading-[1.74] max-w-[480px] tracking-[-0.01em]">
          Off-chain execution data for scalability. On-chain signals for integrity. AI systems that compound intelligence from every completed engagement.
        </p>

        <div className="mt-[52px] grid grid-cols-3 border border-white/[0.06] rounded-[14px] overflow-hidden max-md:grid-cols-1">
          {layers.map((l, i) => (
            <div key={l.n} className={`px-9 py-10 max-md:px-6 max-md:py-8 hover:bg-white/[0.02] transition-colors ${i < layers.length-1 ? 'border-r border-white/[0.06] max-md:border-r-0 max-md:border-b' : ''}`}>
              <span className="reveal font-mono text-[9.5px] tracking-[0.12em] uppercase text-white/20 block mb-[26px]">{l.n}</span>
              <h3 className="reveal font-serif text-[20px] font-light text-white/90 tracking-[-0.03em] leading-[1.2] mb-[11px] delay-1">{l.title}</h3>
              <p className="reveal text-[13px] font-light text-white/35 leading-[1.72] tracking-[-0.01em] mb-5 delay-2">{l.body}</p>
              <div className="flex flex-wrap gap-[5px]">
                {l.chips.map(c => (
                  <span key={c} className="font-mono text-[10px] text-white/25 border border-white/[0.09] rounded-full px-[11px] py-[3px] tracking-[0.03em]">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
