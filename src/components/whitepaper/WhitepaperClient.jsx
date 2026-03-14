'use client'

import { useState } from 'react'
import { useReveal }    from '@/hooks/useReveal'
import { useActiveToc } from '@/hooks/useActiveToc'

import WhitepaperNav from '@/components/whitepaper/WhitepaperNav'
import Sidebar       from '@/components/whitepaper/Sidebar'
import MobileMenu    from '@/components/whitepaper/MobileMenu'

import Hero          from '@/components/whitepaper/sections/Hero'
import Metrics       from '@/components/whitepaper/sections/Metrics'
import Abstract      from '@/components/whitepaper/sections/Abstract'
import Problem       from '@/components/whitepaper/sections/Problem'
import PoP           from '@/components/whitepaper/sections/PoP'
import Pods          from '@/components/whitepaper/sections/Pods'
import HowItWorks    from '@/components/whitepaper/sections/HowItWorks'
import Features      from '@/components/whitepaper/sections/Features'
import Architecture  from '@/components/whitepaper/sections/Architecture'
import BusinessModel from '@/components/whitepaper/sections/BusinessModel'
import Roadmap       from '@/components/whitepaper/sections/Roadmap'
import Onboarding    from '@/components/whitepaper/sections/Onboarding'
import Governance    from '@/components/whitepaper/sections/Governance'
import Risks         from '@/components/whitepaper/sections/Risks'
import ERP           from '@/components/whitepaper/sections/ERP'
import Conclusion    from '@/components/whitepaper/sections/Conclusion'

const SECTION_IDS = [
  'cover','intro','problem','solution','pop','pods','how',
  'features','arch','bizmodel','phases','onboarding',
  'governance','risks','erp','conclusion',
]

export default function WhitepaperClient() {
  useReveal()
  const active = useActiveToc(SECTION_IDS)
  const [mobOpen, setMobOpen] = useState(false)

  return (
    <div className="bg-paper min-h-screen">
      <WhitepaperNav onToggleMob={() => setMobOpen(v => !v)} />
      <MobileMenu open={mobOpen} onClose={() => setMobOpen(false)} />
      <div className="flex pt-[58px]">
        <Sidebar active={active} />
        <main className="lg:ml-[216px] flex-1 min-w-0">
          <Hero />
          <Metrics />
          <Abstract />
          <Problem />
          <PoP />
          <Pods />
          <HowItWorks />
          <Features />
          <Architecture />
          <BusinessModel />
          <Roadmap />
          <Onboarding />
          <Governance />
          <Risks />
          <ERP />
          <Conclusion />
        </main>
      </div>
    </div>
  )
}
