import { useState, useEffect, useRef } from 'react';

export function useAnimatedPrice(targetValue: number, duration: number = 400) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const [diff, setDiff] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const currentValueRef = useRef(targetValue);
  const diffTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = currentValueRef.current;
    const endValue = targetValue;
    const delta = endValue - startValue;

    if (delta !== 0) {
      setDiff(delta);
      setDirection(delta > 0 ? 'up' : 'down');

      if (diffTimeoutRef.current) {
        clearTimeout(diffTimeoutRef.current);
      }
      diffTimeoutRef.current = window.setTimeout(() => {
        setDiff(null);
        setDirection('idle');
      }, 1200);
    }

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const nextVal = Math.round(startValue + (endValue - startValue) * eased);
      currentValueRef.current = nextVal;
      setDisplayValue(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        currentValueRef.current = endValue;
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  useEffect(() => {
    return () => {
      if (diffTimeoutRef.current) {
        clearTimeout(diffTimeoutRef.current);
      }
    };
  }, []);

  return { displayValue, diff, direction };
}
