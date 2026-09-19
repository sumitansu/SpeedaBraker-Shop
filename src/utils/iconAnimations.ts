/**
 * Premium SVG Path & Vector Micro-Interaction Engine
 * Animates internal SVG paths, lines, and geometry strokes of Lucide SVG icons.
 * 
 * Distinct Animations:
 * 1. Hover: Smooth, human-paced SVG stroke tracing and line drawing with path stagger (680ms, non-repeating).
 * 2. Click / Confirm: Energetic vector burst, luminous pulse, and tactile elastic redraw (620ms, non-repeating).
 * 
 * Features:
 * - Exact vector geometry measurement (SVGPathElement, line, polyline, circle, rect) prevents 10ms rushing/skipping.
 * - Robust event delegation ignores internal child DOM bubbling so animations never get aborted prematurely.
 * - Cleans up inline SVG attributes when finished so natural colors and hover styles remain intact.
 * - Respects prefers-reduced-motion.
 */

let isInitialized = false;

// Track active animations so we can cleanly manage lifecycle
const activeAnimations = new WeakMap<Element, Animation[]>();

/**
 * Calculates exact stroke length in SVG user coordinates (viewBox 0 0 24 24).
 * Prevents overshooting/dead-time where stroke completes in the first 5% of animation.
 */
function getShapeLength(shape: SVGElement): number {
  // 1. Native SVGPathElement or SVGGeometryElement getTotalLength if available
  if (typeof (shape as SVGGeometryElement).getTotalLength === 'function') {
    try {
      const len = (shape as SVGGeometryElement).getTotalLength();
      if (len > 0 && !isNaN(len)) return len;
    } catch {
      // Fall through to geometric calculation
    }
  }

  const tagName = shape.tagName.toLowerCase();

  // 2. SVGLineElement: hypotenuse between (x1, y1) and (x2, y2)
  if (tagName === 'line') {
    const x1 = parseFloat(shape.getAttribute('x1') || '0');
    const y1 = parseFloat(shape.getAttribute('y1') || '0');
    const x2 = parseFloat(shape.getAttribute('x2') || '0');
    const y2 = parseFloat(shape.getAttribute('y2') || '0');
    const d = Math.hypot(x2 - x1, y2 - y1);
    return d > 0 ? d : 14;
  }

  // 3. SVGCircleElement: 2 * π * r
  if (tagName === 'circle') {
    const r = parseFloat(shape.getAttribute('r') || '0');
    return r > 0 ? 2 * Math.PI * r : 24;
  }

  // 4. SVGRectElement: 2 * (w + h)
  if (tagName === 'rect') {
    const w = parseFloat(shape.getAttribute('width') || '0');
    const h = parseFloat(shape.getAttribute('height') || '0');
    return w > 0 && h > 0 ? 2 * (w + h) : 36;
  }

  // 5. SVGPolylineElement or SVGPolygonElement: sum distance between adjacent coordinate pairs
  if (tagName === 'polyline' || tagName === 'polygon') {
    const pointsStr = shape.getAttribute('points') || '';
    const coords = pointsStr.trim().split(/[\s,]+/).map(Number);
    let sum = 0;
    for (let i = 0; i < coords.length - 2; i += 2) {
      if (!isNaN(coords[i]) && !isNaN(coords[i + 2])) {
        sum += Math.hypot(coords[i + 2] - coords[i], coords[i + 3] - coords[i + 1]);
      }
    }
    if (tagName === 'polygon' && coords.length >= 4) {
      sum += Math.hypot(coords[0] - coords[coords.length - 2], coords[1] - coords[coords.length - 1]);
    }
    return sum > 0 ? sum : 22;
  }

  // Default fallback for Lucide icon 24x24 box average path segment
  return 24;
}

function getIconShapes(icon: SVGElement): SVGGeometryElement[] {
  return Array.from(
    icon.querySelectorAll<SVGGeometryElement>('path, line, polyline, circle, rect, polygon')
  );
}

function cancelRunningAnimations(icon: SVGElement) {
  const current = activeAnimations.get(icon);
  if (current) {
    current.forEach((anim) => {
      try {
        anim.cancel();
      } catch {
        // ignore
      }
    });
    activeAnimations.delete(icon);
  }
}

/**
 * 1. HOVER SVG ANIMATION:
 * Smooth, visible SVG path tracing & redraw with natural human pacing and path stagger.
 * Duration: 680ms (staggered up to ~780ms for multi-stroke icons).
 * Occurs ONCE per hover session.
 */
export function playHoverSvgAnimation(icon: SVGElement) {
  // If hover is already active or click animation is running, do not interrupt
  if (icon.dataset.svgHoverActive === 'true' || icon.dataset.svgClickActive === 'true') {
    return;
  }
  icon.dataset.svgHoverActive = 'true';

  cancelRunningAnimations(icon);

  const shapes = getIconShapes(icon);
  if (shapes.length === 0) return;

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animations: Animation[] = [];

  shapes.forEach((shape, index) => {
    if (typeof shape.animate !== 'function') return;

    if (prefersReduced) {
      const anim = shape.animate(
        [
          { opacity: 0.5 },
          { opacity: 1 },
        ],
        {
          duration: 300,
          easing: 'ease-out',
          fill: 'forwards',
        }
      );
      anim.onfinish = () => {
        shape.style.opacity = '';
      };
      animations.push(anim);
      return;
    }

    const len = getShapeLength(shape);

    // Tiny dots/points (e.g., exclamation mark dot, alert center, small circles)
    if (len <= 2.5) {
      const anim = shape.animate(
        [
          { opacity: 0.25, strokeWidth: '1.5px', transform: 'scale(0.8)' },
          { opacity: 1, strokeWidth: '3px', transform: 'scale(1.25)' },
          { opacity: 1, strokeWidth: '2px', transform: 'scale(1)' },
        ],
        {
          duration: 550,
          delay: index * 70,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );
      anim.onfinish = () => {
        shape.style.opacity = '';
        shape.style.strokeWidth = '';
        shape.style.transform = '';
      };
      animations.push(anim);
      return;
    }

    // Full vector stroke tracing:
    // Starts at offset = len (0% drawn), sweeps smoothly to offset = 0 (100% drawn)
    // with a gentle stroke width expansion (2px -> 2.6px -> 2px) so the motion is clearly visible.
    const anim = shape.animate(
      [
        {
          strokeDasharray: `${len} ${len}`,
          strokeDashoffset: `${len}`,
          strokeWidth: '1.8px',
          opacity: 0.3,
        },
        {
          strokeDasharray: `${len} ${len}`,
          strokeDashoffset: `${len * 0.25}`,
          strokeWidth: '2.6px',
          opacity: 1,
        },
        {
          strokeDasharray: `${len} ${len}`,
          strokeDashoffset: '0',
          strokeWidth: '2px',
          opacity: 1,
        },
      ],
      {
        duration: 680,
        delay: index * 80, // Sequential path stagger (first stem, then arrow head, etc.)
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      }
    );

    anim.onfinish = () => {
      // Clean up inline styles so standard CSS/Lucide rendering resumes seamlessly
      shape.style.strokeDasharray = '';
      shape.style.strokeDashoffset = '';
      shape.style.strokeWidth = '';
      shape.style.opacity = '';
    };

    animations.push(anim);
  });

  if (animations.length > 0) {
    activeAnimations.set(icon, animations);
  }
}

/**
 * 2. CLICK / CONFIRM SVG ANIMATION:
 * Distinct, high-energy tactile vector burst and elastic line redraw.
 * The SVG strokes swell to 3.6px with luminous glow, redraw rapidly, and settle elastically.
 * Duration: 620ms, non-repeating.
 */
export function playClickSvgAnimation(icon: SVGElement) {
  icon.dataset.svgClickActive = 'true';
  cancelRunningAnimations(icon);

  const shapes = getIconShapes(icon);
  if (shapes.length === 0) return;

  const animations: Animation[] = [];

  shapes.forEach((shape, index) => {
    if (typeof shape.animate !== 'function') return;

    const len = getShapeLength(shape);

    if (len <= 2.5) {
      const anim = shape.animate(
        [
          { opacity: 0.3, strokeWidth: '1.5px', filter: 'brightness(1.5)' },
          { opacity: 1, strokeWidth: '4.2px', filter: 'drop-shadow(0 0 3px currentColor) brightness(2)' },
          { opacity: 1, strokeWidth: '2px', filter: 'none' },
        ],
        {
          duration: 520,
          delay: index * 40,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'forwards',
        }
      );
      anim.onfinish = () => {
        shape.style.opacity = '';
        shape.style.strokeWidth = '';
        shape.style.filter = '';
      };
      animations.push(anim);
      return;
    }

    // Bold vector burst & snappy elastic line sweep
    const anim = shape.animate(
      [
        {
          strokeDasharray: `${len} ${len}`,
          strokeDashoffset: `${len * 0.7}`,
          strokeWidth: '2px',
          opacity: 0.6,
          filter: 'drop-shadow(0 0 0 transparent)',
        },
        {
          strokeDasharray: `${len} ${len}`,
          strokeDashoffset: '0',
          strokeWidth: '3.6px',
          opacity: 1,
          filter: 'drop-shadow(0 0 3px currentColor) brightness(1.35)',
        },
        {
          strokeDasharray: `${len} ${len}`,
          strokeDashoffset: '0',
          strokeWidth: '2px',
          opacity: 1,
          filter: 'drop-shadow(0 0 0 transparent) brightness(1)',
        },
      ],
      {
        duration: 620,
        delay: index * 50,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'forwards',
      }
    );

    anim.onfinish = () => {
      shape.style.strokeDasharray = '';
      shape.style.strokeDashoffset = '';
      shape.style.strokeWidth = '';
      shape.style.opacity = '';
      shape.style.filter = '';
    };

    animations.push(anim);
  });

  if (animations.length > 0) {
    activeAnimations.set(icon, animations);
    // Release click active lock after animation concludes
    setTimeout(() => {
      delete icon.dataset.svgClickActive;
    }, 650);
  } else {
    delete icon.dataset.svgClickActive;
  }
}

/**
 * Resolves all Lucide SVG icons within or matching an interactive container.
 */
function findContainerIcons(container: Element): SVGElement[] {
  if (container.matches('svg.lucide, svg[class*="lucide"]')) {
    return [container as SVGElement];
  }
  const icons = Array.from(
    container.querySelectorAll<SVGElement>('svg.lucide, svg[class*="lucide"]')
  );
  return icons;
}

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], label, summary, .cursor-pointer, [data-clickable], svg.lucide, svg[class*="lucide"]';

/**
 * Initializes global event listeners for non-repeating hover and click SVG animations.
 * Uses mouseover/mouseout boundary checking to prevent child-bubbling from restarting or aborting animations.
 */
export function initIconAnimations(): () => void {
  if (isInitialized || typeof document === 'undefined') {
    return () => {};
  }
  isInitialized = true;

  // 1. Mouse Over: Trigger hover animation once when entering an interactive element or SVG
  const handleMouseOver = (e: MouseEvent) => {
    const target = e.target as Element | null;
    if (!target) return;

    const container = target.closest(INTERACTIVE_SELECTOR);
    if (!container) return;

    // Critical: If the pointer moved from another child within the SAME container, do not restart
    const from = e.relatedTarget as Node | null;
    if (from && container.contains(from)) {
      return;
    }

    const icons = findContainerIcons(container);
    icons.forEach((icon) => {
      playHoverSvgAnimation(icon);
    });
  };

  // 2. Mouse Out: Reset hover status only when the cursor truly leaves the container
  const handleMouseOut = (e: MouseEvent) => {
    const target = e.target as Element | null;
    if (!target) return;

    const container = target.closest(INTERACTIVE_SELECTOR);
    if (!container) return;

    // If the pointer is still inside this container, keep the hover session active
    const to = e.relatedTarget as Node | null;
    if (to && container.contains(to)) {
      return;
    }

    const icons = findContainerIcons(container);
    icons.forEach((icon) => {
      delete icon.dataset.svgHoverActive;
    });
  };

  // 3. Pointer Down / Click: Trigger tactile vector burst and elastic confirm animation
  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.button !== undefined) return;
    const target = e.target as Element | null;
    if (!target) return;

    const container = target.closest(INTERACTIVE_SELECTOR);
    if (!container) return;

    const icons = findContainerIcons(container);
    icons.forEach((icon) => {
      playClickSvgAnimation(icon);
    });
  };

  // 4. Keyboard Accessibility: Trigger on Enter or Space on focused interactive elements
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const activeEl = document.activeElement;
      if (!activeEl) return;

      const container = activeEl.closest(INTERACTIVE_SELECTOR);
      if (!container) return;

      const icons = findContainerIcons(container);
      icons.forEach((icon) => {
        playClickSvgAnimation(icon);
      });
    }
  };

  document.addEventListener('mouseover', handleMouseOver, { passive: true });
  document.addEventListener('mouseout', handleMouseOut, { passive: true });
  document.addEventListener('pointerdown', handlePointerDown, { passive: true });
  document.addEventListener('keydown', handleKeyDown, { passive: true });

  return () => {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('pointerdown', handlePointerDown);
    document.removeEventListener('keydown', handleKeyDown);
    isInitialized = false;
  };
}
