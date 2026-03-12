const talentSteps = [
  { n:'01', title:'Create a Contributor Profile', body:'Select your skill domain. No resume required at Phase 2 and beyond.' },
  { n:'02', title:'Join or Get Matched to a Pod', body:'AI-assisted matching based on skills, availability, and prior PoP records.' },
  { n:'03', title:'Execute Real Scoped Work', body:'Complete tasks within defined pod mandates. Receive structured evaluation on every delivery.' },
  { n:'04', title:'Build Compounding Reputation', body:'PoP records generated on completion. Scores update. Higher-impact work unlocks automatically.' },
]

const projectSteps = [
  { n:'01', title:'Define Scope and Success Criteria', body:'Set work scope, required roles, timeline, and measurable outcomes.' },
  { n:'02', title:'Get Matched to the Right Pod', body:'Work3 Labs matches your project to the highest-performing pod for your needs.' },
  { n:'03', title:'Track Execution Progress', body:'Full visibility into milestone completion and pod performance throughout.' },
  { n:'04', title:'Evaluate and Re-Engage', body:'Outcomes reviewed on delivery. PoP records generated. Re-engage proven pods.' },
]

function StepList({ label, steps }) {
  return (
    <div>
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block pb-3.5 border-b border-black/[0.09]">
        {label}
      </span>
      {steps.map((s) => (
        <div key={s.n} className="grid grid-cols-[30px_1fr] gap-3.5 py-[22px] border-b border-black/[0.06] last:border-b-0">
          <span className="font-mono text-[9.5px] text-[#CBCBCB] tracking-[0.08em] pt-[3px]">{s.n}</span>
          <div>
            <h4 className="text-[14.5px] font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1.5 leading-[1.3]">{s.title}</h4>
            <p className="text-[13px] font-light text-[#888] leading-[1.65] tracking-[-0.01em]">{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HowItWorks() {
  return (
    <div id="how" className="bg-alt border-t border-b border-black/[0.06] px-[68px] py-24 max-md:px-6 max-md:py-14">
      <span className="reveal font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-[18px]">
        Section 06–07 — How It Works
      </span>
      <h2 className="reveal font-serif font-light tracking-[-0.04em] leading-[1.06] text-ink mb-[18px]"
        style={{ fontSize: 'clamp(30px,3.6vw,50px)' }}>
        From onboarding to <em className="italic text-green-dark">execution.</em>
      </h2>

      <div className="grid grid-cols-2 gap-[68px] mt-[52px] max-lg:grid-cols-1 max-lg:gap-10">
        <div className="reveal"><StepList label="For Talents — Contribute" steps={talentSteps} /></div>
        <div className="reveal delay-2"><StepList label="For Projects — Deploy" steps={projectSteps} /></div>
      </div>
    </div>
  )
}
