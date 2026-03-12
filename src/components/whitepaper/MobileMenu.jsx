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

export default function MobileMenu({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-x-0 top-[58px] bottom-0 bg-paper z-[450] overflow-y-auto pt-6 pb-16 border-t border-black/[0.07]">
      <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#C0C0C0] px-6 mb-4 block">Contents</span>
      <ul className="list-none">
        {TOC.map((item, i) =>
          item === 'div' ? (
            <div key={i} className="h-px bg-black/[0.06] mx-6 my-3" />
          ) : (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={onClose}
                className="flex items-baseline gap-2.5 px-6 py-2.5 text-[13px] text-[#555] hover:text-ink"
              >
                <span className="font-mono text-[9px] tracking-[0.06em] text-[#C8C8C8] flex-shrink-0 min-w-[20px]">
                  {item.n}
                </span>
                {item.label}
              </a>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
