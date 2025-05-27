import { useEffect, useRef } from 'react';
import { useCommand } from './vimagesCtx';

function scrollToElementCenteredSmoothly(el: HTMLElement, duration = 300) {
  const rect = el.getBoundingClientRect();
  const targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
  const startY = window.scrollY;
  const diff = targetY - startY;

  let startTime: number | null = null;

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function step(timestamp: number) {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutQuad(progress);

    window.scrollTo(0, startY + diff * ease);

    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export const NavigableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { navActiveId , navUnregister , navRegister } = useCommand();

  useEffect(() => {
	navRegister({ id, ref });
    return () => navUnregister(id);
  }, [id]);

  useEffect(() => {
    if(navActiveId === id && ref.current){
      scrollToElementCenteredSmoothly(ref.current);
      // TODO: allow opt in to no animations:
      //ref.current.scrollIntoView({
      //  behavior: 'smooth',
      //  block: 'center',
      //  inline: 'nearest',
      //});
    }
  }, [navActiveId]);

  return (
    <div
      ref={ref}
      style={{ 
        background: navActiveId === id ? 'lightblue' : 'black',
        margin: 'auto',
      }}
    >
      {children}
    </div>
  );
};
