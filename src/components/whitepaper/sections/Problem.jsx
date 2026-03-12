const problems = [
  {
    n: '01',
    title: 'Fragmented Talent Discovery',
    body: 'Most Web3 hiring relies on Twitter presence, static resumes, and informal referrals — signals that do not reliably predict execution quality or team effectiveness.',
  },
  {
    n: '02',
    title: 'No Verifiable Performance Data',
    body: 'Even when work is completed, outcomes are rarely standardized, comparable, or persistently recorded. This leads to repeated hiring mistakes and poor capital efficiency.',
  },
  {
    n: '03',
    title: 'Individual-Centric Work Models',
    body: 'Modern Web3 work requires cross-functional teams with shared accountability. Most platforms still optimize for individuals, not coordinated execution units.',
  },
]

export default function Problem() {
  return (
    <div id="problem" className="bg-ink px-[68px] py-24 relative overflow-hidden max-md:px-6 max-md:py-14">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(45,252,68,0.10) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-10%] left-[-15%] w-[55vw] h-[55vw] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(60,180,255,0.07) 0%, transparent 65%)' }} />
      </div>
      <div className="relative z-10">
        <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-white/30 block mb-[18px]">
          Section 02 — The Problem
        </span>
        <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-paper mb-[18px]"
          style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
          Web3 has capital.<br />It lacks <em className="italic text-green">execution.</em>
        </h2>
        <p className="reveal text-[14.5px] font-light text-white/40 leading-[1.74] max-w-[480px] tracking-[-0.01em]">
          Projects struggle to find reliable contributors, form effective teams, and measure real performance beyond resumes and informal social signals.
        </p>
        <div className="mt-[52px] grid grid-cols-3 border border-white/[0.07] rounded-[14px] overflow-hidden max-md:grid-cols-1">
          {problems.map((p, i) => (
            <div key={p.n} className={`px-9 py-10 ${i < problems.length - 1 ? 'border-r border-white/[0.07] max-md:border-r-0 max-md:border-b' : ''} hover:bg-white/[0.03] transition-colors`}>
              <span className="reveal font-mono text-[9.5px] tracking-[0.12em] uppercase text-white/20 block mb-7">{p.n}</span>
              <h3 className="reveal font-serif text-[20px] font-light text-white/90 tracking-[-0.03em] leading-[1.22] mb-3 delay-1">{p.title}</h3>
              <p className="reveal text-[13.5px] font-light text-white/40 leading-[1.72] tracking-[-0.01em] delay-2">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
