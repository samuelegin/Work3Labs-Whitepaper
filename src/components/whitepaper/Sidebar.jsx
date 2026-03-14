'use client'
import Link from 'next/link'

const TOC = [
  { id: 'cover',      n: '—',    label: 'Abstract' },
  { id: 'intro',      n: '01',   label: 'Introduction' },
  { id: 'problem',    n: '02',   label: 'The Problem' },
  { id: 'solution',   n: '03',   label: 'The Solution' },
  'div',
  { id: 'pop',        n: '04',   label: 'Proof-of-Performance' },
  { id: 'pods',       n: '05',   label: 'Talent Pods' },
  { id: 'how',        n: '06–07',label: 'How It Works' },
  { id: 'features',   n: '08',   label: 'Key Features' },
  'div',
  { id: 'arch',       n: '09',   label: 'Architecture' },
  { id: 'bizmodel',   n: '10',   label: 'Business Model' },
  { id: 'phases',     n: '11',   label: 'Roadmap' },
  { id: 'onboarding', n: '12',   label: 'Onboarding Framework' },
  'div',
  { id: 'governance', n: '13',   label: 'Governance' },
  { id: 'risks',      n: '14',   label: 'Risks' },
  { id: 'erp',        n: '15',   label: 'Rep. Protocol' },
  { id: 'conclusion', n: '16',   label: 'Conclusion' },
]

export default function Sidebar({ active }) {
  return (
    <aside className="hidden lg:flex fixed top-[58px] left-0 w-[216px] h-[calc(100vh-58px)] overflow-y-auto border-r border-black/[0.07] bg-paper flex-col pb-16 z-[400]" style={{ scrollbarWidth: 'none' }}>
      <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#C0C0C0] px-[22px] mb-4 mt-8 block">Contents</span>

      <ul className="list-none flex flex-col gap-px">
        {TOC.map((item, i) =>
          item === 'div' ? (
            <div key={i} className="h-px bg-black/[0.06] mx-[22px] my-3" />
          ) : (
            <li key={item.id} className="relative">
              {active === item.id && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-dark rounded-r" />
              )}
              <a
                href={`#${item.id}`}
                className={`flex items-baseline gap-2.5 px-[22px] py-2 text-[12.5px] leading-snug transition-colors ${
                  active === item.id
                    ? 'text-ink font-medium'
                    : 'text-[#AAA] font-normal hover:text-ink hover:bg-black/[0.03]'
                }`}
              >
                <span className={`font-mono text-[9px] tracking-[0.06em] flex-shrink-0 min-w-[20px] transition-colors ${active === item.id ? 'text-green-dark' : 'text-[#D4D4D4]'}`}>
                  {item.n}
                </span>
                {item.label}
              </a>
            </li>
          )
        )}
      </ul>

      <div className="h-px bg-black/[0.06] mx-[22px] my-3" />
      <div className="px-[22px] mt-auto">
        <strong className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink block leading-none mb-1">v1.0</strong>
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#C0C0C0]">Whitepaper</span>
      </div>
    </aside>
  )
}
