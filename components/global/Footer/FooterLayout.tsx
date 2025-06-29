'use client'

import { useState, useEffect } from 'react'
import type { HomePagePayload, SettingsPayload } from '@/types'
import NumberFlow from '@number-flow/react'

interface FooterProps {
  data: SettingsPayload
  title: string | null
  homepage: HomePagePayload | null
}

export default function Footer(props: FooterProps) {
  const title = props.title
  const lastUpdated = props.homepage?._updatedAt ?? ''
  const displayLastUpdate = props.data?.displayLastUpdated

  // State to store the Sydney time
  const [sydneyTime, setSydneyTime] = useState<string>('')

  useEffect(() => {
    // Function to update the Sydney time
    const updateSydneyTime = () => {
      const time = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Sydney',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, 
      }).format(new Date())
      setSydneyTime(time)
    }

    // Update the time immediately and then every second
    updateSydneyTime()
    const interval = setInterval(updateSydneyTime, 1000)

    // Cleanup the interval on component unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bottom-0 grid grid-cols-1 md:grid-cols-2 mt-12 gap-3 px-4 md:px-5 py-2 md:py-5 lg:px-5">
      <div className="text-xl md:text-left md:text-1xl">
        <h2>The studio practice of Aaron Bull & Matt Wilson.</h2>
      </div>
      <div className="text-xl md:text-1xl">
        We respectfully acknowledge the Gadigal people, the traditional custodians of the land we work on. 
      </div>
      <div className="text-xl md:text-left md:text-1xl">
        <p>{sydneyTime}</p>
      </div>
      <div className="text-xl md:text-left md:text-1xl">
        <a href='https://www.instagram.com/aw____studio/' target='_blank' className='mb-0'>→ Instagram</a>
        <p>→ Email</p>
      </div>

      <div className="text-xl md:text-left md:text-1xl">
        <h2>© AW 2025</h2>
      </div>
      <div className="text-xl md:text-left md:text-1xl cursor-pointer">
        <p onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</p>
      </div>

    </footer>
  )
}
