const risks = [
  {
    tag: 'Talent Quality',
    title: 'Inconsistent Contributor Performance',
    body: 'Early-phase contributors may deliver inconsistent outcomes before PoP data matures. Mitigated by human-validated matching in Phase 1 and progressive performance gating.',
  },
  {
    tag: 'Market Adoption',
    title: 'Web3 Project Engagement',
    body: 'Projects may default to familiar hiring methods. Addressed by Apex Agency relationships and demonstrable ROI from Phase 1 managed engagements.',
  },
  {
    tag: 'Regulatory',
    title: 'Evolving Legal Landscape',
    body: 'Web3 labor and token regulation remains uncertain across jurisdictions. Work3 Labs monitors regulatory developments and structures operations to maintain flexibility.',
  },
  {
    tag: 'Technical',
    title: 'On-chain Data Integrity',
    body: 'Anchoring performance data on-chain introduces complexity and cost. Off-chain-first architecture in Phases 1–2 limits exposure while maintaining optionality for Phase 3.',
  },
  {
    tag: 'Competition',
    title: 'Existing Freelance Platforms',
    body: 'Established platforms may introduce Web3 features. Work3 Labs differentiates through pod-native architecture, PoP primitives, and reputation compounding over time.',
  },
  {
    tag: 'Ecosystem',
    title: 'Web3 Market Cycles',
    body: 'Crypto bear markets reduce project budgets and Web3 hiring. The platform\'s value proposition extends to Web2 talent operating in Web3 contexts, reducing cycle dependence.',
  },
]

export default function Risks() {
  return (
    <div id="risks" className="bg-alt border-t border-b border-black/[0.06] px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 14 — Risk Considerations
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink mb-[18px]"
        style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
        Acknowledged and <em className="italic text-green-dark">addressed.</em>
      </h2>

      <div className="mt-[52px] grid grid-cols-3 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1">
        {risks.map((r) => (
          <div key={r.tag} className="reveal bg-white border border-black/[0.07] rounded-[14px] px-[30px] py-[34px] hover:border-black/[0.14] transition-colors">
            <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-[#C0C0C0] block mb-3">{r.tag}</span>
            <h3 className="font-serif text-[19px] font-light text-ink tracking-[-0.03em] leading-[1.2] mb-2.5">{r.title}</h3>
            <p className="text-[13px] font-light text-[#777] leading-[1.7] tracking-[-0.01em]">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
