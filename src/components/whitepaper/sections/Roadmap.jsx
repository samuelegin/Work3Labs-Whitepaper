'use client'
const phases = [
  {
    n:'Phase 01', time:'0 – 6 Months', active:true,
    title:'Foundation and Controlled Execution',
    items:['Curated talents and partner projects','Manual pod assignment','Initial PoP generation','Basic reputation scoring','Human-validated matching','Off-chain performance storage'],
  },
  {
    n:'Phase 02', time:'6 – 18 Months', active:false,
    title:'Open Platform and Intelligence Layer',
    items:['Open talent onboarding','Persistent pod identities','AI-assisted matching','Performance-based progression','Advanced analytics dashboards','API access for partners'],
  },
  {
    n:'Phase 03', time:'18+ Months', active:false,
    title:'Ecosystem and Decentralization Layer',
    items:['Portable reputation identity','On-chain reputation proofs','Cross-platform PoP recognition','Governance participation','Dispute resolution frameworks','Optional staking mechanisms'],
  },
]

export default function Roadmap() {
  return (
    <section id="phases" className="px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 11 — Launch Roadmap
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink mb-[18px]"
        style={{ fontSize:'clamp(30px,3.6vw,50px)' }}>
        Built for trust, scaled for the <em className="italic text-green-dark">ecosystem.</em>
      </h2>
      <p className="reveal text-[14.5px] font-light text-[#777] leading-[1.74] max-w-[480px] tracking-[-0.01em]">
        Each phase ensures data quality before automation, accountability before decentralization, and product value before tokenization.
      </p>

      <div className="mt-[52px] grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
        {phases.map((p, i) => (
          <div
            key={p.n}
            className={`reveal border rounded-[14px] px-8 py-9 transition-colors max-md:px-6 max-md:py-7 ${i===0?'delay-1':i===1?'delay-2':''}
              ${p.active ? 'bg-ink border-transparent' : 'bg-white border-black/[0.08] hover:border-black/[0.16]'}`}
          >
            <span className={`font-mono text-[9.5px] tracking-[0.12em] uppercase block mb-3 ${p.active ? 'text-white/20' : 'text-[#C0C0C0]'}`}>{p.n}</span>
            <span className={`font-mono text-[10.5px] tracking-[0.04em] block mb-3 ${p.active ? 'text-green' : 'text-green-dark'}`}>{p.time}</span>
            <h3 className={`font-serif text-[18px] font-light tracking-[-0.03em] leading-[1.25] mb-[22px] ${p.active ? 'text-paper' : 'text-ink'}`}>{p.title}</h3>
            <div className="flex flex-col gap-2">
              {p.items.map((item) => (
                <div key={item} className={`text-[12.5px] font-light tracking-[-0.01em] pl-[13px] relative leading-[1.5]
                  before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full
                  ${p.active ? 'text-white/35 before:bg-white/20' : 'text-[#777] before:bg-black/[0.14]'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
