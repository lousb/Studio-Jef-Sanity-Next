import { CustomPortableText } from '@/components/shared/CustomPortableText'
import Reveal from '../global/Reveal'

interface HeaderProps {
  description?: any
}
export function Header(props: HeaderProps) {
  const { description } = props
  if (!description) {
    return null
  }
  return (
    <div className="w-full md:w-4/6">
      {description && (
        <div className="mt-4 text-3xl md:text-4.5xl">
          {description.displayText == true && (
            <Reveal element="div" elementClass="mt-4 text-xl md:text-2xl">
              <CustomPortableText value={description.text} />
            </Reveal>          
          )}
        </div>
      )}
    </div>
  )
}
