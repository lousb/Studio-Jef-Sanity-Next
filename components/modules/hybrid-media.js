import React, { useEffect, useState, lazy, Suspense } from 'react';
import ImageBox from '../shared/ImageBox';

const MuxPlayer = lazy(() => import('@mux/mux-player-react'));

const HybridMedia = ({ data }) => {
  const { media, video, caption } = data || {};
  const muxAsset = video?.asset;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const aspectRatio = muxAsset?.aspect_ratio || '16:9';
  const [width, height] = aspectRatio.split(':').map(Number);
  const paddingBottom = (height / width) * 100;

  return (
    <div className="divider mt-3 hybrid-media">
      {muxAsset?.playbackId ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: `${paddingBottom}%`,
          }}
        >
          {isClient ? (
            <Suspense fallback={<div>Loading video player...</div>}>
              <MuxPlayer
                playbackId={muxAsset.playbackId}
                metadata={{ video_title: 'Hybrid Video' }}
                streamType="on-demand"
                accentColor="#ea580c"
                autoPlay="muted"
                loop="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Suspense>
          ) : null}
        </div>
      ) : media?.asset ? (
        <ImageBox
          image={{
            asset: media.asset,
            lqip: media.asset.metadata?.lqip,
          }}
          alt={caption || 'Hybrid Image'}
          caption={caption}
        />
      ) : null}
    </div>
  );
};

export default HybridMedia;
