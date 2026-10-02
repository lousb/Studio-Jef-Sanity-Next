import { type DocumentActionComponent, useClient } from 'sanity'

import { syncFeaturedMedia } from '@/sanity/lib/syncFeaturedMedia'

/**
 * Wraps the built-in Publish action for projects: publishes exactly as normal,
 * then re-syncs Home's featured media so editors never have to press
 * "Sync featured media" by hand. Home's existing order is kept; newly
 * featured items are appended, un-featured ones removed.
 */
export function withFeaturedSync(
  originalPublish: DocumentActionComponent,
): DocumentActionComponent {
  const PublishWithFeaturedSync: DocumentActionComponent = (props) => {
    const client = useClient({ apiVersion: '2024-01-01' })
    const original = originalPublish(props)
    if (!original) return original

    return {
      ...original,
      onHandle: () => {
        original.onHandle?.()
        // Give the publish mutation a moment to land, then sync.
        setTimeout(() => {
          syncFeaturedMedia(client).catch((err) =>
            console.error('Featured media auto-sync failed:', err),
          )
        }, 1500)
      },
    }
  }

  PublishWithFeaturedSync.action = originalPublish.action
  return PublishWithFeaturedSync
}
