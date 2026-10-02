import { useState } from 'react'
import { type DocumentActionComponent, useClient } from 'sanity'

import { syncFeaturedMedia } from '@/sanity/lib/syncFeaturedMedia'

/**
 * Wraps the built-in Publish action for projects so editors never touch
 * "Sync featured media":
 *
 * 1. Sync Home's featured media first. This rewrites any old links to
 *    "drafts.<id>" as weak links to the published id, which is what used to
 *    block publishing ("cannot be deleted as there are references…"), and
 *    picks up media just marked/unmarked Featured in this draft.
 * 2. Then publish exactly as normal.
 *
 * If the sync fails for any reason, publishing still goes ahead.
 */
export function withFeaturedSync(
  originalPublish: DocumentActionComponent,
): DocumentActionComponent {
  const PublishWithFeaturedSync: DocumentActionComponent = (props) => {
    const client = useClient({ apiVersion: '2024-01-01' })
    const [isSyncing, setIsSyncing] = useState(false)
    const original = originalPublish(props)
    if (!original) return original

    return {
      ...original,
      label: isSyncing ? 'Publishing…' : original.label,
      disabled: isSyncing || original.disabled,
      onHandle: async () => {
        setIsSyncing(true)
        try {
          await syncFeaturedMedia(client)
        } catch (err) {
          console.error('Featured media sync failed, publishing anyway:', err)
        } finally {
          setIsSyncing(false)
        }
        original.onHandle?.()
      },
    }
  }

  PublishWithFeaturedSync.action = originalPublish.action
  return PublishWithFeaturedSync
}
