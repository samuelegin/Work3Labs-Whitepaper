'use client'
const govItems = [
  'Reputation-weighted contribution scoring',
  'Pod-level accountability and dispute resolution',
  'Protocol parameter governance via staking (Phase 3)',
  'Transparent performance data for all participants',
  'Community-driven pod standards and role definitions',
  'Escalation pathways for unresolved execution disputes',
]

export default function Governance() {
  return (
    <section id="governance" className="px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 13 — Governance
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink mb-[18px]"
        style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
        Accountability by <em className="italic text-green-dark">design.</em>
      </h2>

      <div className="grid grid-cols-2 gap-[72px] items-start mt-12 max-lg:grid-cols-1 max-lg:gap-8">
        <div className="reveal space-y-4">
          <p className="text-[15px] font-light text-[#444] leading-[1.82] tracking-[-0.01em]">
            Work3 Labs governance is designed to evolve progressively alongside the platform. In early phases, governance is primarily operational — focused on maintaining quality standards, resolving disputes, and ensuring pod accountability without over-engineering the system before it has real usage data.
          </p>
          <p className="text-[15px] font-light text-[#444] leading-[1.82] tracking-[-0.01em]">
            As the network matures into Phase 3, governance transitions toward a decentralized model where reputation-weighted participants shape protocol parameters, standards, and resource allocation — ensuring that those who have contributed most have the greatest influence.
          </p>
        </div>

        <div className="reveal delay-2 border-t border-black/[0.07]">
          {govItems.map((item, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-black/[0.06] last:border-b-0 items-baseline">
              <span className="font-mono text-[9.5px] text-[#C8C8C8] tracking-[0.1em] min-w-[20px] flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-[13.5px] font-light text-[#555] leading-[1.6] tracking-[-0.01em]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
