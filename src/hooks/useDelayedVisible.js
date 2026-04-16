import { useState, useEffect } from "react";

// Returns `true` after `delay` ms. Resets to false when `active` flips off.
// Used by slide components to stagger entry animations after mount.
export function useDelayedVisible(delay = 200, active = true) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [active, delay]);
  return visible;
}
