const pods = [
  {
    tag: 'Growth / Community',
    title: 'Growth Alpha Pod',
    desc: 'Executes community growth, social strategy, and ecosystem expansion for Web3 protocols. Persistent pod with 14 completed engagements and verified PoP records.',
    roles: ['Community Lead', 'Content Strategist', 'Growth Analyst', 'Social Manager'],
  },
  {
    tag: 'Technical / Infrastructure',
    title: 'DevOps Execution Pod',
    desc: 'Handles infrastructure, smart contract deployment, and technical delivery. Specializes in rapid scoped engagements with on-chain deliverable verification.',
    roles: ['Lead Engineer', 'Smart Contract Dev', 'DevOps', 'QA'],
  },
  {
    tag: 'Creative / Design',
    title: 'Brand and Design Pod',
    desc: 'Delivers visual identity, UX design, and brand strategy for protocols and DAOs. Project-specific formation with portfolio-backed Proof-of-Performance records.',
    roles: ['Art Director', 'UI Designer', 'Motion Designer'],
  },
  {
    tag: 'Strategy / GTM',
    title: 'Go-To-Market Pod',
    desc: 'Executes GTM strategy, tokenomics advisory, and ecosystem partnerships. Matched via performance-weighted scoring from prior execution records.',
    roles: ['Strategist', 'BD Lead', 'Research Analyst', 'Writer'],
  },
]

export default function Pods() {
  return (
    <section id="pods" className="px-[68px] pb-24 max-md:px-6 max-md:pb-14" style={{ paddingTop: 0 }}>
      <div className="grid grid-cols-2 gap-14 items-end mb-12 max-md:grid-cols-1 max-md:gap-4">
        <div className="reveal">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
            Section 05 — Talent Pods
          </span>
          <h2 className="font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink"
            style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
            Teams,<br />not individuals.
          </h2>
        </div>
        <div className="reveal delay-1">
          <p className="text-[14.5px] font-light text-[#777] leading-[1.72] tracking-[-0.01em]">
            Talent Pods are small, structured execution units formed to deliver specific categories of work — evaluated on collective output, not individual skill alone.
          </p>
        </div>
      </div>

      <div className="reveal grid grid-cols-2 border border-black/[0.07] rounded-[16px] overflow-hidden max-md:grid-cols-1">
        {pods.map((pod, i) => (
          <div
            key={pod.title}
            className={`p-10 max-md:p-8 hover:bg-[#F3F2EF] transition-colors
              ${i % 2 === 0 ? 'border-r border-black/[0.07] max-md:border-r-0' : ''}
              ${i < 2 ? 'border-b border-black/[0.07]' : ''}
            `}
          >
            <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-[#C0C0C0] block mb-3.5">{pod.tag}</span>
            <h3 className="font-serif text-[20px] font-light text-ink tracking-[-0.03em] leading-[1.2] mb-2.5">{pod.title}</h3>
            <p className="text-[13px] font-light text-[#777] leading-[1.7] tracking-[-0.01em] mb-5">{pod.desc}</p>
            <div className="flex flex-wrap gap-[5px]">
              {pod.roles.map((r) => (
                <span key={r} className="font-mono text-[10px] text-[#999] border border-black/[0.1] rounded-full px-[11px] py-[3px] tracking-[0.02em] bg-black/[0.02]">
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
