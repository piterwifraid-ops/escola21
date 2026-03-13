import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

export default function TopProgressBar() {
  const location = useLocation();
  const controls = useAnimation();

  useEffect(() => {
    let cancelled = false;

    async function runAnimation() {
      await controls.set({ scaleX: 0, opacity: 1 });
      if (cancelled) return;
      await controls.start({
        scaleX: 1,
        transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
      });
      if (cancelled) return;
      await controls.start({
        opacity: 0,
        transition: { duration: 0.22, ease: 'easeOut' },
      });
    }

    runAnimation();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return (
    <motion.div
      animate={controls}
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-[#1351B4]"
      style={{
        transformOrigin: 'left center',
        scaleX: 0,
        opacity: 0,
        boxShadow: '0 0 10px rgba(19, 81, 180, 0.55)',
      }}
    />
  );
}
