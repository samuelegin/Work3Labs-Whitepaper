'use client'
export default function Abstract() {
  return (
    <section id="intro" className="px-[68px] py-24 relative max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 01 — Abstract
      </span>
      <h2 className="reveal font-serif text-[clamp(30px,3.6vw,50px)] font-light tracking-[-0.04em] leading-[1.06] text-ink mb-[18px]">
        What is Work3 Labs?
      </h2>

      <div className="grid grid-cols-2 gap-[72px] items-start mt-12 max-lg:grid-cols-1 max-lg:gap-8">
        <div className="reveal space-y-[18px]">
          {[
            'Web3 has unlocked new models of ownership, governance, and coordination. However, while capital and innovation continue to grow, execution remains one of the largest bottlenecks. Projects struggle to find reliable contributors, form effective teams, and measure real performance.',
            'Work3 Labs is designed to solve this execution gap. It provides infrastructure where contributors organize into structured teams, execute real work, and generate verifiable performance records that improve future coordination.',
            'Rather than functioning as a traditional job marketplace, Work3 Labs focuses on execution, accountability, and performance visibility — making on-chain reputation a first-class primitive of the Web3 ecosystem.',
          ].map((p, i) => (
            <p key={i} className="text-[15px] font-light text-[#444] leading-[1.82] tracking-[-0.01em]">{p}</p>
          ))}
        </div>

        <div className="reveal delay-2 bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
          <div className="px-6 py-[18px] border-b border-black/[0.07] font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#BBB]">
            Document Metadata
          </div>
          {[
            ['Title',         'Work3 Labs Whitepaper', false],
            ['Version',       'v1.0',                  true],
            ['Category',      'Execution Infrastructure', false],
            ['Team Model',    'Talent Pods',            false],
            ['Rep. Standard', 'Proof-of-Performance',   false],
            ['Status',        'Phase 1 — Active',       true],
          ].map(([k, v, green]) => (
            <div key={k} className="flex justify-between items-center px-6 py-3 border-b last:border-b-0 border-black/[0.05] hover:bg-[#FAFAFA] transition-colors">
              <span className="text-[12.5px] font-light text-[#AAA] tracking-[-0.01em]">{k}</span>
              <span className={`font-mono text-[11px] tracking-[-0.01em] ${green ? 'text-green-dark' : 'text-[#1A1A1A]'}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
