import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const secret = process.env.SANITY_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get(SIGNATURE_HEADER_NAME)

  if (!signature || !(await isValidSignature(body, signature, secret))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const projects: { _id: string; featuredItems: { _key: string }[] }[] = await client.fetch(`
    *[_type == "project"]{
      _id,
      "featuredItems": content[_type == "hybridMedia" && featured == true]{ _key }
    }
  `)

  const desired = new Set<string>()
  projects.forEach((p) => {
    p.featuredItems?.forEach((item) => desired.add(`${p._id}::${item._key}`))
  })

  const home = await client.fetch(`*[_type == "home" && !(_id in path("drafts.**"))][0]{ _id, featuredMedia }`)
  if (!home?._id) {
    return NextResponse.json({ error: 'No home document found' }, { status: 404 })
  }

  const existing = home.featuredMedia || []
  const existingKeys = new Set(
    existing.map((item: any) => `${item.project._ref}::${item.mediaKey}`)
  )

  const kept = existing.filter((item: any) =>
    desired.has(`${item.project._ref}::${item.mediaKey}`)
  )

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

  await client.patch(home._id).set({ featuredMedia: [...kept, ...additions] }).commit()

  return NextResponse.json({ ok: true, count: kept.length + additions.length })
}