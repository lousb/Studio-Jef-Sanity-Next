import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import {Link} from 'next-view-transitions'

import AboutImageBox from '@/components/shared/AboutImageBox'
import { CustomPortableText } from '@/components/shared/CustomPortableText'
import type { AboutPayload } from '@/types'
import Reveal from '@/components/global/Reveal'

export interface AboutPageProps {
  data: AboutPayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function AboutPage({ data }: AboutPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { title, overview, aboutImage, aboutLinks } = data ?? {}

  return (
    <div className="about-page h-full mt-4 gap-5 pl-[19.5vw]">
      <div className="w-full">
        {/* Title */}
        {/* <div>{title && <Reveal element={'div'}>{title}</Reveal>}</div> */}

        {overview && (
          <div className="mt-2 text-12xl md:text-13xl">
            {overview && <Reveal element={'div'} elementClass={'text-white mt-4 text-7xl md:text-7xl'}>
                <CustomPortableText value={overview} />
            </Reveal>}
      
          </div>
        )}

        
        
      </div>

      <div className="mt-10 flex flex-col">
        {/* Links */}
        {aboutLinks &&
          aboutLinks.map((aboutLink, key) => {
            return (
              <div key={key} className="flex flex-wrap">
                <Link
                  target="_blank"
                  className={`flex flex-wrap text-xl text-secondary underline md:text-2xl`}
                  href={aboutLink.url!}
                >
                  {aboutLink.title}
                </Link>
              </div>
            )
          })}
      </div>

      <div className="w-full">
        {/* About image */}
        {aboutImage && (
          <AboutImageBox
            image={aboutImage}
            alt={`About image`}
            classesWrapper="relative"
          />
        )}
      </div>
    </div>
  )
}

export default AboutPage
