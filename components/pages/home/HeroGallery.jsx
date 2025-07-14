'use client'

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

const HeroGallery = ({ sources, data, originalSize }) => {
  const containerRef = useRef(null);

  // State kept in refs because we don't want React re-renders for every frame
  const scroll = useRef({
    ease: 0.06,
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    delta: { x: { c: 0, t: 0 }, y: { c: 0, t: 0 } }
  });

  const isDragging = useRef(false);
  const drag = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 });

  const mouse = useRef({
    x: { t: 0.5, c: 0.5 },
    y: { t: 0.5, c: 0.5 },
    press: { t: 0, c: 0 },
  });

  const items = useRef([]);
  const tileSize = useRef({ w: 0, h: 0 });
  const winSize = useRef({ w: window.innerWidth, h: window.innerHeight });
  const observer = useRef(null);
  const animationFrame = useRef(null);

  // Helper: initialize observer
  const initObserver = () => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
      });
    });
  };

  // Setup items and DOM on resize or on mount
  const setupGrid = () => {
    const container = containerRef.current;
    if (!container) return;

    winSize.current.w = window.innerWidth;
    winSize.current.h = window.innerHeight;

    tileSize.current.w = winSize.current.w;
    tileSize.current.h = winSize.current.w * (originalSize.h / originalSize.w);

    scroll.current.current = { x: 0, y: 0 };
    scroll.current.target = { x: 0, y: 0 };
    scroll.current.last = { x: 0, y: 0 };

    container.innerHTML = ''; // clear

    // baseItems scale and position
    const baseItems = data.map((d, i) => {
      const scaleX = tileSize.current.w / originalSize.w;
      const scaleY = tileSize.current.h / originalSize.h;
      const source = sources[i % sources.length];
      return {
        src: source.src,
        caption: source.caption,
        x: d.x * scaleX,
        y: d.y * scaleY,
        w: d.w * scaleX,
        h: d.h * scaleY
      };
    });

    items.current = [];
    const repsX = [0, tileSize.current.w];
    const repsY = [0, tileSize.current.h];

    baseItems.forEach(base => {
      repsX.forEach(offsetX => {
        repsY.forEach(offsetY => {
          // Create DOM elements
          const el = document.createElement('div');
          el.classList.add('item');
          el.style.width = `${base.w}px`;

          const wrapper = document.createElement('div');
          wrapper.classList.add('item-wrapper');
          el.appendChild(wrapper);

          const itemImage = document.createElement('div');
          itemImage.classList.add('item-image');
          itemImage.style.width = `${base.w}px`;
          itemImage.style.height = `${base.h}px`;
          itemImage.style.backgroundColor = `red`;
          itemImage.style.opacity = `0.8`;
          wrapper.appendChild(itemImage);

          const img = new Image();
          img.src = `./img/${base.src}`;
          itemImage.appendChild(img);

          const caption = document.createElement('small');
          caption.innerHTML = base.caption;

          // SplitText for caption lines animation
          const split = new SplitText(caption, { type: 'lines', linesClass: 'line' });
          split.lines.forEach((line, i) => {
            line.style.transitionDelay = `${i * 0.15}s`;
            line.parentElement.style.transitionDelay = `${i * 0.15}s`;
          });
          wrapper.appendChild(caption);

          container.appendChild(el);
          observer.current.observe(caption);

          items.current.push({
            el,
            container: itemImage,
            wrapper,
            img,
            x: base.x + offsetX,
            y: base.y + offsetY,
            w: base.w,
            h: base.h,
            extraX: 0,
            extraY: 0,
            rect: el.getBoundingClientRect(),
            ease: Math.random() * 0.5 + 0.5,
          });
        });
      });
    });

    tileSize.current.w *= 2;
    tileSize.current.h *= 2;

    scroll.current.current.x = scroll.current.target.x = scroll.current.last.x = -winSize.current.w * 0.1;
    scroll.current.current.y = scroll.current.target.y = scroll.current.last.y = -winSize.current.h * 0.1;
  };



  // Event handlers
  const onWheel = e => {
    e.preventDefault();
    const factor = 0.4;
    scroll.current.target.x -= e.deltaX * factor;
    scroll.current.target.y -= e.deltaY * factor;
  };

  const onMouseDown = e => {
    e.preventDefault();
    isDragging.current = true;
    document.documentElement.classList.add('dragging');
    mouse.current.press.t = 1;
    drag.current.startX = e.clientX;
    drag.current.startY = e.clientY;
    drag.current.scrollX = scroll.current.target.x;
    drag.current.scrollY = scroll.current.target.y;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    document.documentElement.classList.remove('dragging');
    mouse.current.press.t = 0;
  };

  const onMouseMove = e => {
    mouse.current.x.t = e.clientX / winSize.current.w;
    mouse.current.y.t = e.clientY / winSize.current.h;

    if (isDragging.current) {
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      scroll.current.target.x = drag.current.scrollX + dx;
      scroll.current.target.y = drag.current.scrollY + dy;
    }
  };

  // Render loop
  const render = () => {
    scroll.current.current.x += (scroll.current.target.x - scroll.current.current.x) * scroll.current.ease;
    scroll.current.current.y += (scroll.current.target.y - scroll.current.current.y) * scroll.current.ease;

    scroll.current.delta.x.t = scroll.current.current.x - scroll.current.last.x;
    scroll.current.delta.y.t = scroll.current.current.y - scroll.current.last.y;
    scroll.current.delta.x.c += (scroll.current.delta.x.t - scroll.current.delta.x.c) * 0.04;
    scroll.current.delta.y.c += (scroll.current.delta.y.t - scroll.current.delta.y.c) * 0.04;
    mouse.current.x.c += (mouse.current.x.t - mouse.current.x.c) * 0.04;
    mouse.current.y.c += (mouse.current.y.t - mouse.current.y.c) * 0.04;
    mouse.current.press.c += (mouse.current.press.t - mouse.current.press.c) * 0.04;

    const dirX = scroll.current.current.x > scroll.current.last.x ? 'right' : 'left';
    const dirY = scroll.current.current.y > scroll.current.last.y ? 'down' : 'up';

    items.current.forEach(item => {
      const gridWidth = tileSize.current.w;
      const gridHeight = tileSize.current.h;

      items.current.forEach(item => {
        const newX = 5 * scroll.current.delta.x.c * item.ease + (mouse.current.x.c - 0.5) * item.rect.width * 0.6;
        const newY = 5 * scroll.current.delta.y.c * item.ease + (mouse.current.y.c - 0.5) * item.rect.height * 0.6;

        const scrollX = scroll.current.current.x;
        const scrollY = scroll.current.current.y;

        // Calculate raw position
        let posX = item.x + scrollX + item.extraX + newX;
        let posY = item.y + scrollY + item.extraY + newY;

        // Wrap position in grid bounds (modulo)
        posX = ((posX % gridWidth) + gridWidth) % gridWidth; // wrap to [0, gridWidth)
        posY = ((posY % gridHeight) + gridHeight) % gridHeight; // wrap to [0, gridHeight)

        // Offset to center around 0 (so items are allowed negative positions, avoiding jumps)
        posX -= item.w; // or tileSize.current.w / 2, experiment with what fits your layout
        posY -= item.h;

        // Apply transform
        item.el.style.transform = `translate(${posX}px, ${posY}px)`;
        item.img.style.transform = `scale(${1.2 + 0.2 * mouse.current.press.c * item.ease}) translate(${-mouse.current.x.c * item.ease * 10}%, ${-mouse.current.y.c * item.ease * 10}%)`;
      });
    });

    scroll.current.last.x = scroll.current.current.x;
    scroll.current.last.y = scroll.current.current.y;

    animationFrame.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    initObserver();
    setupGrid();

    // Event listeners
    window.addEventListener('resize', setupGrid);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    containerRef.current.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    render();

    return () => {
      // Cleanup on unmount
      window.removeEventListener('resize', setupGrid);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      if (containerRef.current) containerRef.current.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);

      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (observer.current) observer.current.disconnect();
    };
  }, [sources, data, originalSize]);

  return <div ref={containerRef} className="infinite-grid-container" style={{ overflow: 'hidden', position: 'absolute', width: '100vw', height: '100vh', top:0, left:0
   }} />;
};

export default HeroGallery;
