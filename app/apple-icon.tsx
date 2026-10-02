import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#ffffff' }}>
        <div style={{ margin: 'auto', width: 120, height: 120, borderRadius: '50%', background: '#F47723' }} />
      </div>
    ),
    { ...size },
  )
}
