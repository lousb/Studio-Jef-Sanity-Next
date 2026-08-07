import { useState } from 'react'
import { useClient } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

export const syncFeaturedMediaAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const { id, type } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [isSyncing, setIsSyncing] = useState(false)

  // Only show this action on the Home document
  if (type !== 'home') return null

  return {
    label: isSyncing ? 'Syncing…' : 'Sync featured media',
    onHandle: async () => {
      setIsSyncing(true)

      try {
        const projects: { _id: string; featuredItems: { _key: string }[] }[] =
          await client.fetch(`
            *[_type == "project"]{
              _id,
              "featuredItems": content[_type == "hybridMedia" && featured == true]{ _key }
            }
          `)

        const desired = new Set<string>()
        projects.forEach((p) => {
          p.featuredItems?.forEach((item) => desired.add(`${p._id}::${item._key}`))
        })

        const home = await client.fetch(
          `*[_type == "home" && _id == $id][0]{ _id, featuredMedia }`,
          { id }
        )

        const existing = home?.featuredMedia || []
        const existingKeys = new Set(
          existing.map((item: any) => `${item.project._ref}::${item.mediaKey}`)
        )

        // Keep already-listed items that are still featured, preserving user order
        const kept = existing.filter((item: any) =>
          desired.has(`${item.project._ref}::${item.mediaKey}`)
        )

        // Append anything newly featured that isn't already in the list
        const additions = [...desired]
          .filter((key) => !existingKeys.has(key))
          .map((key) => {
            const [projectId, mediaKey] = key.split('::')
            return {
              _key: `${projectId}-${mediaKey}`,
              _type: 'featuredMediaItem',
              project: { _type: 'reference', _ref: projectId },
              mediaKey,
            }
          })

        await client
          .patch(id)
          .set({ featuredMedia: [...kept, ...additions] })
          .commit()

        setIsSyncing(false)
        props.onComplete()
      } catch (err) {
        console.error('Sync failed:', err)
        setIsSyncing(false)
      }
    },
  }
}