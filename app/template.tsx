'use client'

import { motion } from 'framer-motion'

// On load fade in animation setup


// Console Credits
console.log(
  '%cDesign & Web Development by Louis Wyeth \n– https://wyeeeth.com',
  'display:block;font-family:courier;font-size:12px;font-weight:bold;line-height:1;color:black;',
)

// Wrapping with framer motion
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div>  {children}

    </div>
  
  )
}
