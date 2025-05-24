import { useEffect, useRef } from 'react';
import { useCommand } from './vimagesCtx';

export const NavigableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { navActiveId , navUnregister , navRegister } = useCommand();

  useEffect(() => {
	navRegister({ id, ref });
    return () => navUnregister(id);
  }, [id]);

  return (
    <div
      ref={ref}
      style={{ background: navActiveId === id ? 'lightblue' : 'black' }}
    >
      {children}
    </div>
  );
};
