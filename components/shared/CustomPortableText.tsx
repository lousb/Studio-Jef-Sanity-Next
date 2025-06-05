import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'
import React from 'react'

function wrapWords(text: string) {
  return text.split(' ').map((word, i) => (
    <span
      key={i}
      className="inline-block overflow-hidden mr-2"
      style={{ display: 'inline-block' }}
    >
      <span className="reveal-word inline-block">{word}</span>
    </span>
  ))
}

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
        function processChildren(children: React.ReactNode): React.ReactNode {
          return React.Children.map(children, (child) => {
            if (typeof child === 'string') {
              return wrapWords(child)
            } else if (React.isValidElement(child) && child.props.children) {
              return React.cloneElement(child, {
                children: processChildren(child.props.children),
              })
            }
            return child
          })
        }

        return (
          <p className={`${paragraphClasses} flex flex-wrap`}>
            {processChildren(children)}
          </p>
        )
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
