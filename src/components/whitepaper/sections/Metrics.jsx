const items = [
  { val: '3',    lbl: 'Launch phases' },
  { val: 'Pod',  lbl: 'Team-first execution' },
  { val: 'PoP',  lbl: 'Proof-of-Performance' },
  { val: '0→1',  lbl: 'Resume to on-chain rep' },
]

export default function Metrics() {
  return (
    <div className="reveal grid grid-cols-4 border-t border-b border-black/[0.07] max-md:grid-cols-2">
      {items.map((m, i) => (
        <div
          key={i}
          className={`px-11 py-9 max-md:px-5 max-md:py-6 ${i < items.length - 1 ? 'border-r border-black/[0.07]' : ''} ${i === 1 ? 'max-md:border-r-0' : ''} ${i >= 2 ? 'max-md:border-t border-black/[0.07]' : ''}`}
        >
          <span className="font-serif text-[36px] font-light text-ink tracking-[-0.05em] leading-none block mb-1.5 max-md:text-[28px]">
            {m.val}
          </span>
          <span className="text-[12.5px] font-light text-[#AAA] tracking-[-0.01em]">{m.lbl}</span>
        </div>
      ))}
    </div>
  )
}
