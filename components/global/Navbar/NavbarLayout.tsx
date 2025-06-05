import Image from 'next/image'
import {Link} from 'next-view-transitions'

import { HeaderLinks } from '@/components/shared/HeaderLinks'
import { resolveHref, urlForLogo } from '@/sanity/lib/utils'
import type { LinkItem, PageItem, SettingsPayload } from '@/types'

interface NavbarProps {
  data: SettingsPayload
  title: string | null
  logo: any | null
}
export default function Navbar(props: NavbarProps) {
  const { data } = props
  const title = props.title ?? ''

  const menuItems = data?.menuItems ?? {}
  const menuPages = menuItems?.page || ([] as PageItem[])
  const menuLinks = menuItems?.link || ([] as LinkItem[])

  const customLogo = props?.logo
  const logoImageUrl = customLogo && urlForLogo(customLogo)?.url()

  return (
    <div className="header flex flex-wrap justify-between items-center gap-x-5 px-4 py-4 md:px-5 md:py-4 lg:px-5 top-layer grid grid-cols-3 md:grid-cols-3 gap-3 w-full " >
      {customLogo && customLogo ? (
       
          <div className="flex h-6">
            <Link
              href={`/`}
              className={`h-full text-xl hover:text-secondary md:text-1xl`}
            >
            <Image
              alt={title}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: 'auto', height: '24px' }}
              src={logoImageUrl}
            />
            </Link>
          </div>
      ) : (
        <Link
          href={`/`}
          className={`h-full text-1xl hover:text-secondary md:text-1xl`}
        >
          {title}
        </Link>
      )}
      <div className="flex flex-wrap mt-4 md:mt-0 md:text-1xl">
      <Link
          href={`/`}
          className={`h-full text-1xl hover:text-secondary md:text-1xl pl-2`}
        >Works<sup className='translate-y-[0.3em]'>4</sup></Link>
        <Link
          href={`/about`}
          className={`h-full text-1xl hover:text-secondary md:text-1xl pl-2`}
        >
          About
        </Link>
        {/* {menuPages &&
          menuPages.map((menuItem, key) => {
            const href = resolveHref(menuItem?._type, menuItem?.slug)
            if (!href) {
              return null
            }
            return <HeaderLinks key={key} href={href} title={menuItem.title} />
          })}

        {menuLinks &&
          menuLinks.map((menuItem, key) => {
            return (
              <Link
                key={key}
                target="_blank"
                className={`text-lg px-3 py-1 text-secondary border-secondary border rounded hover:text-primary hover:bg-secondary md:text-2xl`}
                href={menuItem.url!}
              >
                ↗ {menuItem.title}
              </Link>
            )
          })} */}
      </div>
      <a href='mailto:contact@aw-studio.world' className="gap-3 mt-4 md:mt-0 text-right w-full md:text-1xl">
        Let’s Work →
      </a>
    </div>
  )
}
