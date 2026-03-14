'use client'
const revenue = [
  { n:'01', title:'Project Execution Fees', body:'A fee applied to each project engagement facilitated through Work3 Labs. Scales directly with execution volume across pods and projects on the platform.' },
  { n:'02', title:'Subscription Access', body:'Advanced analytics, performance reporting, and priority matching tools offered to contributors, pods, and projects under tiered subscription plans from Phase 2 onward.' },
  { n:'03', title:'Enterprise and DAO Partnerships', body:'Custom integrations, white-label execution infrastructure, and long-term partnership agreements with Web3 protocols, DAOs, and ecosystem funds at scale.' },
]

export default function BusinessModel() {
  return (
    <section id="bizmodel" className="px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 10 — Business Model
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink"
        style={{ fontSize:'clamp(30px,3.6vw,50px)' }}>
        Revenue that scales with <em className="italic text-green-dark">execution.</em>
      </h2>

      <div className="grid grid-cols-2 gap-[72px] items-start mt-12 max-lg:grid-cols-1 max-lg:gap-8">
        <div className="reveal space-y-4">
          <p className="text-[15px] font-light text-[#444] leading-[1.82] tracking-[-0.01em]">
            Work3 Labs generates revenue through a model that aligns platform incentives directly with execution volume and ecosystem growth. The more real work gets done, the more the platform earns — creating a feedback loop between quality execution and sustainable growth.
          </p>
          <p className="text-[15px] font-light text-[#444] leading-[1.82] tracking-[-0.01em]">
            As the platform matures across phases, revenue streams diversify from managed engagements in Phase 1 toward subscription products and protocol-level partnerships in Phases 2 and 3.
          </p>
        </div>

        <div className="reveal delay-2 border-t border-black/[0.07]">
          {revenue.map((r) => (
            <div key={r.n} className="flex gap-4 py-[18px] border-b border-black/[0.06] items-start last:border-b-0">
              <span className="font-mono text-[9.5px] text-[#C8C8C8] tracking-[0.1em] min-w-[20px] flex-shrink-0 pt-[3px]">{r.n}</span>
              <div>
                <strong className="text-[13.5px] font-medium text-[#1A1A1A] tracking-[-0.01em] block mb-1">{r.title}</strong>
                <p className="text-[13px] font-light text-[#777] leading-[1.62] tracking-[-0.01em]">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
