'use client';




// interface ProjectProps {
//   project: ShowcaseProject;
// }

export function HeroGallery() {
 

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <iframe
        src="https://tympanus.net/Tutorials/InfiniteLayersGrid/"
        style={{
          width: '125%',
          height: '137vh',
          transform: 'scale(0.8) translateY(-15%)',
          transformOrigin: '0 0',
          border: 'none',
          clipPath: 'inset(12% 0 0 0)',
          pointerEvents: 'none',
        }}
        scrolling="no"
      />
    </div>
  );
}
