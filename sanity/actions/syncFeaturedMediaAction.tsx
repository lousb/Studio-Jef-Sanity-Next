import { useState } from 'react'
import { useClient } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

import { syncFeaturedMedia } from '@/sanity/lib/syncFeaturedMedia'

export const syncFeaturedMediaAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [isSyncing, setIsSyncing] = useState(false)

  if (props.type !== 'home') return null

  return {
    label: isSyncing ? 'Syncing…' : 'Sync featured media',
    disabled: isSyncing,
    onHandle: async () => {
      setIsSyncing(true)
      try {
        await syncFeaturedMedia(client)
      } catch (err) {
        console.error('Sync failed:', err)
      } finally {
        setIsSyncing(false)
        props.onComplete()
      }
    },
  }
}
