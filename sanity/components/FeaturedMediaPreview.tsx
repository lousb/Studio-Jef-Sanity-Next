import { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'

export function FeaturedMediaPreview(props: any) {
  const { value } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = imageUrlBuilder(client)
  const [resolved, setResolved] = useState<{ image?: any; caption?: string } | null>(null)

  useEffect(() => {
    if (!value?.project?._ref || !value?.mediaKey) return

    client
      .fetch(
        `*[_id == $id || _id == "drafts." + $id][0].content[_key == $key][0]{ media, caption }`,
        { id: value.project._ref, key: value.mediaKey }
      )
      .then((block) => {
        console.log('Featured media resolved:', block)
        if (block) setResolved({ image: block.media, caption: block.caption })
      })
      .catch((err) => {
        console.error('Featured media fetch failed:', err)
      })
  }, [value?.project?._ref, value?.mediaKey, client])

  const thumbUrl = resolved?.image
    ? builder.image(resolved.image).width(80).height(80).fit('crop').url()
    : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt=""
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }}
        />
      ) : (
        <div style={{ width: 40, height: 40, background: '#eee', borderRadius: 3 }} />
      )}
      <span>{resolved?.caption || 'Untitled'}</span>
    </div>
  )
}