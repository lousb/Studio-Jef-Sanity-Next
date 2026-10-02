import type { SanityClient } from '@sanity/client'

type FeaturedItem = {
  _key: string
  _type: 'featuredMediaItem'
  project: { _type: 'reference'; _ref: string; _weak: true }
  mediaKey: string
}

// Authenticated clients return drafts too. References must always point at
// the published id, otherwise publishing a project (which deletes its draft)
// is blocked by Home still referencing "drafts.<id>".
const publishedId = (id: string) => id.replace(/^drafts\./, '')

/**
 * Rebuilds Home's featuredMedia from every project block marked `featured`,
 * keeping the existing editor order, and patches both the draft and
 * published Home docs so Studio shows the same list either way.
 */
export async function syncFeaturedMedia(client: SanityClient) {
  const projects: { _id: string; featuredItems: { _key: string }[] | null }[] =
    await client.fetch(`
      *[_type == "project"]{
        _id,
        "featuredItems": content[_type == "hybridMedia" && featured == true]{ _key }
      }
    `)

  // If a project has a draft, the draft decides what's featured.
  const byProject = new Map<string, { _key: string }[]>()
  projects
    .slice()
    .sort((a, b) => Number(a._id.startsWith('drafts.')) - Number(b._id.startsWith('drafts.')))
    .forEach((p) => byProject.set(publishedId(p._id), p.featuredItems || []))

  const desired = new Set<string>()
  byProject.forEach((items, id) =>
    items.forEach((item) => desired.add(`${id}::${item._key}`)),
  )

  const homeDocs: { _id: string; featuredMedia?: any[] }[] = await client.fetch(
    `*[_type == "home"]{ _id, featuredMedia }`,
  )
  if (!homeDocs?.length) throw new Error('No home document found')

  const source =
    homeDocs.find((d) => d._id.startsWith('drafts.')) ||
    homeDocs.find((d) => !d._id.startsWith('drafts.'))

  const toItem = (projectId: string, mediaKey: string): FeaturedItem => ({
    _key: `${projectId}-${mediaKey}`,
    _type: 'featuredMediaItem',
    project: { _type: 'reference', _ref: projectId, _weak: true },
    mediaKey,
  })

  // Keep existing order (normalising any old "drafts." refs), drop un-featured + dupes
  const seen = new Set<string>()
  const kept: FeaturedItem[] = []
  for (const item of source?.featuredMedia || []) {
    if (!item?.project?._ref || !item.mediaKey) continue
    const key = `${publishedId(item.project._ref)}::${item.mediaKey}`
    if (!desired.has(key) || seen.has(key)) continue
    seen.add(key)
    kept.push(toItem(publishedId(item.project._ref), item.mediaKey))
  }

  const additions = [...desired]
    .filter((key) => !seen.has(key))
    .map((key) => {
      const [projectId, mediaKey] = key.split('::')
      return toItem(projectId, mediaKey)
    })

  const finalList = [...kept, ...additions]

  const tx = client.transaction()
  homeDocs.forEach((doc) => tx.patch(doc._id, (p) => p.set({ featuredMedia: finalList })))
  await tx.commit()

  return { count: finalList.length, patchedDocs: homeDocs.map((d) => d._id) }
}
