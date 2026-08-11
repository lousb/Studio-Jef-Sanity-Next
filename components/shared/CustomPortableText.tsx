import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'
import React from 'react'

export function CustomPortableText({
  paragraphClasses = '',
  value,
}: {
  paragraphClasses?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => {
        return <p className={paragraphClasses}>{children}</p>
      },
    },
    marks: {
      link: ({ children, value }) => (
        <a
          className="underline transition hover:opacity-50"
          href={value?.href}
          rel="noreferrer noopener"
        >
          {children}
        </a>
      ),
    },
    types: {
      image: ({ value }) => (
        <div className="my-6 space-y-2">
          {/* You can render your ImageBox here if needed */}
        </div>
      ),
    },
  }

  return <PortableText components={components} value={value} />
}