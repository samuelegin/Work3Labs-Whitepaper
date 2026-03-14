'use client'
const features = [
  { n:'8.1', title:'Pod Formation Engine', body:'Structured team creation based on skill domains, availability, and performance history. Supports both manual curation in Phase 1 and AI-assisted matching from Phase 2 onward. Ensures role coverage and cross-functional balance before any pod is deployed to a project.' },
  { n:'8.2', title:'Execution Tracking', body:'Real-time milestone and deliverable tracking across all active pod engagements. Projects get full visibility into completion rates, delivery timelines, and output quality. Every tracked event feeds directly into PoP record generation at completion.' },
  { n:'8.3', title:'Reputation System', body:'Aggregates PoP data across all completed work into interpretable reputation signals for both individual contributors and pods. Scores are role-weighted, time-adjusted, and used to gate access to higher-impact opportunities as the platform scales.' },
  { n:'8.4', title:'Analytics Dashboard', body:'Provides layered insights for all participants. Contributors see their performance trajectory and improvement areas. Pods access internal analytics on collective output. Projects gain transparency into pod track records and historical delivery quality before engaging.' },
]

export default function Features() {
  return (
    <section id="features" className="px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 08 — Key Features
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink"
        style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
        Built-in tools for <em className="italic text-green-dark">every layer.</em>
      </h2>

      <div className="reveal mt-[52px] grid grid-cols-2 gap-px bg-black/[0.07] border border-black/[0.07] rounded-[14px] overflow-hidden max-md:grid-cols-1">
        {features.map((f) => (
          <div key={f.n} className="px-[34px] py-9 bg-paper hover:bg-[#F3F2EF] transition-colors max-md:px-6 max-md:py-7">
            <span className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#C8C8C8] block mb-3.5">{f.n}</span>
            <h3 className="font-serif text-[19px] font-light text-ink tracking-[-0.03em] leading-[1.2] mb-2.5">{f.title}</h3>
            <p className="text-[13px] font-light text-[#777] leading-[1.7] tracking-[-0.01em]">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
