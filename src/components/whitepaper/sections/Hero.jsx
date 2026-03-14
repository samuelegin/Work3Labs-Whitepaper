'use client'
import Link from 'next/link'

export default function Hero() {
  return (
    <section
      id="cover"
      className="min-h-screen flex flex-col justify-end px-[68px] pb-[76px] relative overflow-hidden max-md:px-6 max-md:pb-14 max-md:pt-20"
    >
      {/* mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mesh-green-tr mesh-blue-bl" />

      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] mb-[22px] relative z-10"
        style={{ opacity: 0, animation: 'up 1s 0.1s both' }}>
        Work3 Labs — Decentralized Execution Infrastructure for Web3 Teams
      </div>

      <h1
        className="font-serif font-light leading-[0.97] tracking-[-0.04em] text-ink max-w-[860px] mb-11 relative z-10"
        style={{ fontSize: 'clamp(46px, 7.2vw, 88px)', opacity: 0, animation: 'up 1.1s 0.2s both' }}
      >
        The execution<br />layer<br />for <em className="not-italic italic text-green-dark">Projects</em>
      </h1>

      <div className="flex items-end justify-between gap-10 relative z-10 max-md:flex-col max-md:items-start max-md:gap-7"
        style={{ opacity: 0, animation: 'up 1s 0.4s both' }}>
        <p className="text-[15px] font-light text-[#666] leading-[1.72] max-w-[380px] tracking-[-0.01em] max-md:text-[14px] max-md:max-w-full">
          Work3 Labs is a team-based execution environment where contributors form structured pods,
          deliver verified work, and build on-chain reputation that compounds over time.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0 max-md:flex-col max-md:w-full">
          <a href="#intro" className="text-[13.5px] font-medium text-paper bg-ink px-[26px] py-3 rounded-full transition-colors hover:bg-[#1f1f1f] max-md:text-center max-md:w-full">
            Read Whitepaper
          </a>
          <Link href="/apply" className="text-[13.5px] font-normal text-ink border border-black/[0.16] px-[26px] py-3 rounded-full transition-colors hover:border-ink max-md:text-center max-md:w-full">
            Apply for Early Access
          </Link>
        </div>
      </div>
    </section>
  )
}
