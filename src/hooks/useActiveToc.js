'use client'
import { useEffect, useState } from 'react'

export function useActiveToc(sectionIds) {
  const [active, setActive] = useState(sectionIds[0])

  useEffect(() => {
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { threshold: 0.15, rootMargin: '-10% 0px -70% 0px' }
    )
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) sio.observe(el)
    })
    return () => sio.disconnect()
  }, [sectionIds])

  return active
}
