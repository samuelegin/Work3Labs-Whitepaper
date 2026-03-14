'use client'
export default function PoP() {
  return (
    <>
      <section id="solution" className="px-[68px] py-24 max-md:px-6 max-md:py-14">
        <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
          Section 03 — The Solution
        </span>
        <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink"
          style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
          Proof-of-Performance
        </h2>
      </section>

      <section id="pop" className="px-[68px] pb-24 max-md:px-6 max-md:pb-14" style={{ paddingTop: 0 }}>
        <div className="grid grid-cols-2 gap-[72px] items-center max-lg:grid-cols-1 max-lg:gap-10">
          {/* Left */}
          <div className="reveal">
            <p className="text-[14.5px] font-light text-[#777] leading-[1.74] max-w-[480px] tracking-[-0.01em] mb-0">
              PoP is a structured record of completed work — not a resume, not a credential, not a token by default.
              Generated through real execution and accumulates over time to form a verifiable on-chain identity.
            </p>
            <div className="mt-8 border-t border-black/[0.07]">
              {[
                'What work was performed, by whom, and under what conditions',
                'Measurable outcomes tied to scoped work mandates',
                'Feeds AI-powered matching and reputation scoring systems',
                'Portable and composable across Phase 3 ecosystem integrations',
              ].map((t, i) => (
                <div key={i} className="flex gap-4 py-4 border-b border-black/[0.06] items-baseline">
                  <span className="font-mono text-[9.5px] text-[#C8C8C8] tracking-[0.1em] min-w-[20px] flex-shrink-0 pt-px">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[13.5px] font-light text-[#555] leading-[1.6] tracking-[-0.01em]">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PoP Card */}
          <div className="reveal delay-2">
            <div className="bg-white rounded-[18px] overflow-hidden" style={{ boxShadow: '0 4px 48px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)' }}>
              <div className="px-6 py-5 border-b border-[#F2F2F0] flex justify-between items-center">
                <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-[#BBB]">Proof-of-Performance Record</span>
                <div className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.1em] uppercase text-green-dark">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-dark pdot-blink" />
                  Verified
                </div>
              </div>
              <div className="py-1">
                {[
                  ['Contributor', '0x4a2f...8b91', false],
                  ['Pod',         'Growth Alpha #12', false],
                  ['Work Type',   'Community Growth', false],
                  ['Milestones',  '5 / 5',            true],
                  ['Delivery',    'On Schedule',       true],
                  ['Chain Anchor','Confirmed',         true],
                ].map(([k, v, green]) => (
                  <div key={k} className="flex justify-between items-center px-6 py-[11px] hover:bg-[#FAFAFA] transition-colors">
                    <span className="text-[12.5px] font-light text-[#AAA] tracking-[-0.01em]">{k}</span>
                    <span className={`font-mono text-[11.5px] tracking-[-0.01em] ${green ? 'text-green-dark' : 'text-[#1A1A1A]'}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mx-6 mb-[22px] mt-1.5 px-5 py-4 bg-[#F4FAF7] rounded-[10px] flex justify-between items-center border border-green-dark/10">
                <span className="text-[12.5px] font-light text-[#999] tracking-[-0.01em]">Reputation Score</span>
                <span className="font-serif text-[34px] font-light text-green-dark tracking-[-0.06em] leading-none">94.8</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
