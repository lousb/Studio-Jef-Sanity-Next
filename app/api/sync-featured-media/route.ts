import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

import { syncFeaturedMedia } from '@/sanity/lib/syncFeaturedMedia'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const secret = process.env.SANITY_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get(SIGNATURE_HEADER_NAME)

  if (!signature || !(await isValidSignature(body, signature, secret))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const result = await syncFeaturedMedia(client)
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Sync failed' }, { status: 500 })
  }
}
