'use client'
const credPills = [
  '5 DeFi protocol launches',
  '3 growth campaigns delivered',
  '2 DAO treasury systems shipped',
  'Verified on-chain',
]

export default function ERP() {
  return (
    <section id="erp" className="px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 15 — Execution Reputation Protocol
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink mb-[18px]"
        style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
        Reputation from <em className="italic text-green-dark">shipped work.</em>
      </h2>
      <p className="reveal text-[14.5px] font-light text-[#777] leading-[1.74] max-w-[480px] tracking-[-0.01em]">
        The Execution Reputation Protocol (ERP) is the data layer that transforms completed work into durable, portable, verifiable contributor identity. Not reviews. Not credentials. Proof from execution.
      </p>

      {/* ERP Credential Card */}
      <div className="reveal mt-14 bg-ink rounded-[18px] p-[30px] max-w-[520px] max-md:p-6" style={{ boxShadow: '0 4px 64px rgba(0,0,0,0.18)' }}>
        <div className="flex justify-between items-start mb-6 pb-5 border-b border-white/[0.07]">
          <div>
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-white/25 block mb-1.5">Live Execution Credential</span>
            <span className="font-serif text-[18px] font-light text-white/90 tracking-[-0.03em]">Community Growth Lead</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] uppercase text-green px-3 py-1.5 rounded-full border border-green/20 bg-green/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green pdot-blink" />
            Active
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6 max-md:grid-cols-1">
          {[
            ['Project',    'DeFi Protocol Alpha'],
            ['Role',       'Community Growth Lead'],
            ['Deliverable','10k wallet activations'],
            ['Outcome',    'Delivered +12%'],
            ['Score',      '96.4'],
            ['Percentile', 'Top 4%'],
          ].map(([k, v]) => (
            <div key={k} className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] px-4 py-3">
              <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/25 block mb-1">{k}</span>
              <span className={`font-mono text-[12px] tracking-[-0.01em] ${k === 'Score' || k === 'Percentile' ? 'text-green' : 'text-white/80'}`}>{v}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-white/[0.07]">
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/20">Chain Anchor</span>
          <span className="font-mono text-[10px] text-green/60">0x4a2f...8b91</span>
          <span className="ml-auto font-mono text-[9px] text-white/20">Feb 2025</span>
        </div>
      </div>

      {/* Three-Layer Architecture */}
      <div className="reveal mt-14 grid grid-cols-3 gap-px bg-black/[0.07] border border-black/[0.07] rounded-[14px] overflow-hidden max-md:grid-cols-1">
        {[
          { n:'Layer 01', title:'Execution Registry', body:'Records every completed engagement — who executed, what was delivered, under what scope, and with which pod. The immutable log layer of the protocol.' },
          { n:'Layer 02', title:'Outcome Oracle',     body:'Validates and scores delivery against pre-defined success criteria. Applies role-weighting and complexity multipliers to raw execution data.' },
          { n:'Layer 03', title:'Reputation Engine',  body:'Aggregates validated outcomes into persistent contributor scores. Updates continuously. Feeds pod matching, project eligibility, and governance weight.' },
        ].map((l, i) => (
          <div key={l.n} className="bg-paper px-9 py-10 max-md:px-6 max-md:py-8 hover:bg-[#F3F2EF] transition-colors">
            <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-[#C8C8C8] block mb-4">{l.n}</span>
            <h3 className="font-serif text-[18px] font-light text-ink tracking-[-0.03em] leading-[1.2] mb-2">{l.title}</h3>
            <p className="text-[13px] font-light text-[#777] leading-[1.7] tracking-[-0.01em]">{l.body}</p>
          </div>
        ))}
      </div>

      {/* Formula */}
      <div className="reveal mt-10 bg-ink rounded-[14px] px-9 py-8 max-md:px-6 max-md:py-6">
        <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-white/25 block mb-5">Execution Score Formula</span>
        <div className="flex flex-wrap items-center gap-3 max-md:gap-2">
          {['Output Quality', '+', 'Impact Score', '+', 'Reliability Score', '='].map((t, i) => (
            <span key={i} className={
              t === '+' || t === '='
                ? 'font-mono text-[18px] text-white/25'
                : 'font-serif text-[16px] font-light text-white/75 tracking-[-0.02em] bg-white/[0.05] border border-white/[0.08] rounded-[8px] px-4 py-2'
            }>{t}</span>
          ))}
          <span className="font-serif text-[18px] font-light text-green tracking-[-0.03em] bg-green/5 border border-green/15 rounded-[8px] px-4 py-2">
            Execution Score
          </span>
        </div>
        <p className="mt-5 text-[12.5px] font-light text-white/30 leading-[1.65] max-w-[520px] tracking-[-0.01em]">
          Scores are role-weighted, time-adjusted, and complexity-multiplied. Higher-complexity engagements earn proportionally greater reputation weight.
        </p>
      </div>

      {/* Talent Graph */}
      <div className="reveal mt-10 border border-black/[0.07] rounded-[14px] px-9 py-8 max-md:px-6 max-md:py-6">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-3">The Execution Talent Graph</span>
        <p className="text-[14px] font-light text-[#666] leading-[1.72] tracking-[-0.01em] max-w-[520px] mb-7">
          Instead of a job board, the protocol creates a living talent graph — a continuously updated map of who executes what, how well, and with whom. Pod formation becomes increasingly intelligent. Project matching becomes predictive.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {['Better Contributors', 'Better Pods', 'Better Outcomes', 'Stronger Reputation Signals'].map((node, i, arr) => (
            <span key={node} className="inline-flex items-center gap-2">
              <span className={`text-[13px] font-light tracking-[-0.01em] px-4 py-2 rounded-full border ${i === arr.length - 1 ? 'bg-green/5 border-green/20 text-green-dark' : 'bg-white border-black/[0.1] text-[#555]'}`}>
                {node}
              </span>
              {i < arr.length - 1 && (
                <span className="text-[#D0D0D0] text-sm">→</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Phase 3 / Portable Identity */}
      <div className="reveal mt-10 grid grid-cols-2 gap-[60px] items-start max-lg:grid-cols-1 max-lg:gap-8">
        <div>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-3">Phase 3 — Portable Execution Identity</span>
          <h3 className="font-serif text-[24px] font-light text-ink tracking-[-0.04em] leading-[1.15] mb-4">Reputation that travels with the contributor.</h3>
          <p className="text-[14px] font-light text-[#666] leading-[1.72] tracking-[-0.01em] mb-5">
            As the protocol matures, each execution credential becomes an on-chain attestation — portable across platforms, verifiable without intermediaries, and composable with the broader Web3 ecosystem.
          </p>
          <div className="flex flex-col gap-2">
            {credPills.map((c) => (
              <div key={c} className="flex items-center gap-2.5 text-[13px] font-light text-[#555] tracking-[-0.01em]">
                <span className="w-4 h-4 rounded-full bg-green-dark/10 border border-green-dark/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-dark text-[9px]">✓</span>
                </span>
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ink rounded-[16px] p-8 max-md:p-6">
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-white/25 block mb-4">Platform Vision</span>
          <p className="font-serif text-[22px] font-light text-white/90 tracking-[-0.04em] leading-[1.25] italic mb-5">
            "The execution reputation layer for the internet."
          </p>
          <p className="text-[13px] font-light text-white/35 leading-[1.7] tracking-[-0.01em]">
            Not a freelancing platform. Not a marketplace. Work3 Labs is execution intelligence infrastructure — a system that knows who ships, who performs, and who collaborates well.
          </p>
        </div>
      </div>
    </section>
  )
}
