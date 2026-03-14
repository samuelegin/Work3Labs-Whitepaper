'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function WhitepaperNav({ onToggleMob }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-[500] h-[58px] flex items-center justify-between px-9 bg-[rgba(250,250,248,0.82)] backdrop-blur-xl border-b border-black/[0.07]">
      {/* Logo */}
      <a href="#cover" className="flex items-center gap-2 font-sans font-semibold text-[14.5px] tracking-tight text-ink">
        <img src="/logo.png" alt="Work3 Labs" className="h-7" />
      </a>

      {/* Center links */}
      <ul className="hidden md:flex items-center gap-0.5 list-none">
        {[
          { href: '#cover',   label: 'Whitepaper' },
          { href: '#problem', label: 'Problem' },
          { href: '#solution',label: 'Solution' },
          { href: '#pods',    label: 'Pods' },
          { href: '#phases',  label: 'Roadmap' },
        ].map(({ href, label }) => (
          <li key={href}>
            <a href={href} className="text-[13.5px] font-normal text-[#777] px-3 py-1.5 rounded-full transition-colors hover:text-ink hover:bg-black/5">
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right */}
      <div className="hidden md:flex items-center gap-2">
        <a href="#" className="text-[13px] font-normal text-[#666] border border-black/[0.13] px-4 py-1.5 rounded-full transition-all hover:border-ink hover:text-ink">
          Download PDF
        </a>
        <Link href="/apply" className="text-[13px] font-medium text-ink bg-green px-4 py-1.5 rounded-full transition-colors hover:bg-green-dark">
          Join Waitlist
        </Link>
      </div>

      {/* Mobile burger */}
      <button className="md:hidden flex flex-col gap-[5px] p-1.5 bg-transparent border-none cursor-pointer" onClick={onToggleMob} aria-label="Menu">
        <span className="block w-[22px] h-[1.5px] bg-ink" />
        <span className="block w-[22px] h-[1.5px] bg-ink" />
        <span className="block w-[22px] h-[1.5px] bg-ink" />
      </button>
    </nav>
  )
}
