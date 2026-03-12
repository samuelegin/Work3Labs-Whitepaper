import { useState } from 'react'

const talentRows = [
  ['Phase 1\n0–6 Mo', 'Application or invitation. Skill domain selection (marketing, devops, community). Placement into supervised execution tasks or pods.', 'Contributor profile. Eligibility for pod participation. Initial reputation score.', 'Early PoP establishes trust without relying on resumes or prior credentials.'],
  ['Phase 2\n6–18 Mo', 'Open registration. Optional Apex Aqademia learning paths. Entry into starter pods or scoped tasks.', 'Reputation-based access to higher-value projects. Pod persistence and leadership roles.', 'Talents earn access through outcomes, not gatekeepers.'],
  ['Phase 3\n18+ Mo', 'Continuous participation. Cross-ecosystem work history. Optional on-chain reputation proofs for portability.', 'Portable execution identity. Governance participation. Long-term reputation compounding.', 'Execution identity becomes durable infrastructure, not a platform-specific score.'],
]

const projectRows = [
  ['Phase 1\nManaged', 'Direct engagement through Apex Agency or Work3 Labs. Manual scoping. Human-curated pod assignment.', 'Guaranteed execution oversight. Transparent delivery metrics. Low-risk experimentation.', 'Control scope and quality during the data-building phase.'],
  ['Phase 2\nSelf-serve', 'Self-serve project creation. Clear scope definition. Automated pod recommendations.', 'Faster team formation. Predictable execution quality. Ability to repeat-engage with proven pods.', 'Reduce friction and scale usage across the ecosystem.'],
  ['Phase 3\nProtocol', 'API or protocol-level integration. Access to ecosystem-wide reputation signals.', 'Reduced coordination overhead. Trust-minimized execution. Cross-platform talent discovery.', 'Make execution trust composable infrastructure.'],
]

const apexItems = [
  'Skill validation before pod participation',
  'Faster onboarding pipeline for new talents',
  'Continuous upskilling tied to pod requirements',
  'Entry path: Aqademia first, then Work3 Labs',
  'Or: Work3 Labs first, then Aqademia for progression',
  'Operated by Apex Agency as a supporting layer',
]

function PhaseTable({ rows, headers }) {
  return (
    <div className="overflow-x-auto rounded-[14px]">
      <table className="w-full border-collapse border border-black/[0.08] rounded-[14px] overflow-hidden" style={{ borderRadius:14 }}>
        <thead>
          <tr className="bg-ink">
            {headers.map(h => (
              <th key={h} className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-white/50 px-5 py-3.5 text-left font-normal border-r border-white/[0.07] last:border-r-0 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-black/[0.07] last:border-b-0 hover:bg-[#F3F2EF] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-5 py-4 text-[13px] font-light text-[#555] tracking-[-0.01em] leading-[1.55] align-top border-r border-black/[0.06] last:border-r-0 ${j===0 ? 'font-mono text-[10px] text-green-dark tracking-[0.06em] font-normal whitespace-pre-line' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Onboarding() {
  const [tab, setTab] = useState('talents')

  return (
    <div id="onboarding" className="bg-alt border-t border-b border-black/[0.06] px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 12 — Onboarding Framework
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink mb-14"
        style={{ fontSize:'clamp(30px,3.6vw,50px)' }}>
        Earn access through <em className="italic text-green-dark">execution.</em>
      </h2>

      <div className="grid grid-cols-2 gap-[72px] items-end mb-14 max-lg:grid-cols-1 max-lg:gap-5">
        <div className="reveal">
          <p className="text-[14.5px] font-light text-[#666] leading-[1.74] tracking-[-0.01em]">
            Work3 Labs onboarding is designed to replace resumes, unverifiable claims, and credential signaling with progressive access based on demonstrated execution.
          </p>
        </div>
        <div className="reveal delay-1">
          <p className="text-[14.5px] font-light text-[#666] leading-[1.74] tracking-[-0.01em]">
            Talents earn access through outcomes, not gatekeepers. Projects reduce risk by hiring performance, not promises. Onboarding is not a gate — it is the first execution loop.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="reveal flex gap-2 mb-8 flex-wrap max-md:flex-col">
        {[['talents','12.1 — Talent Onboarding'],['projects','12.2 — Project Onboarding'],['apex','12.3 — Apex Aqademia']].map(([key,label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`font-mono text-[10px] tracking-[0.1em] uppercase border rounded-full px-4 py-1.5 cursor-pointer transition-all max-md:text-left max-md:rounded-[10px] max-md:py-2.5
              ${tab===key ? 'bg-ink text-paper border-transparent' : 'text-[#AAA] border-black/[0.12] hover:border-black/25 bg-transparent'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="reveal">
        {tab === 'talents' && (
          <PhaseTable rows={talentRows} headers={['Phase','How Talents Onboard','What Talents Unlock','Key Shift']} />
        )}
        {tab === 'projects' && (
          <PhaseTable rows={projectRows} headers={['Phase','How Projects Onboard','What Projects Get','Goal']} />
        )}
        {tab === 'apex' && (
          <div className="bg-white border border-black/[0.07] rounded-[14px] p-9 max-md:p-6">
            <div className="flex items-baseline gap-4 mb-6 pb-4 border-b border-black/[0.07]">
              <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-[#C0C0C0]">12.3</span>
              <span className="font-serif text-[22px] font-light text-ink tracking-[-0.03em]">Apex Aqademia</span>
            </div>
            <div className="grid grid-cols-2 gap-10 max-md:grid-cols-1 max-md:gap-6">
              <div className="space-y-3">
                <p className="text-[13.5px] font-light text-[#555] leading-[1.72] tracking-[-0.01em]">
                  Apex Aqademia functions as a pre-execution and re-skilling entry point — not a standalone education platform. It is directly integrated into the Work3 Labs onboarding pipeline and tied to pod role requirements.
                </p>
                <p className="text-[13.5px] font-light text-[#555] leading-[1.72] tracking-[-0.01em]">
                  It enables skill validation before execution, faster onboarding for new talents, and continuous upskilling that maps to live pod needs rather than generic curricula.
                </p>
              </div>
              <div className="border-t border-black/[0.07]">
                {apexItems.map((item, i) => (
                  <div key={i} className="flex gap-3.5 py-[13px] border-b border-black/[0.06] last:border-b-0 items-baseline">
                    <span className="font-mono text-[9px] text-[#C8C8C8] min-w-[16px] flex-shrink-0 tracking-[0.08em]">—</span>
                    <span className="text-[13px] font-light text-[#555] leading-[1.5] tracking-[-0.01em]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
