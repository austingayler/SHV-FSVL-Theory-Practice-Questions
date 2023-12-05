import { useEffect } from "react";

export const useHotkeys = (allowedKeys, callback) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (allowedKeys.includes(key) && callback) {
        callback(key);
      }
    };

    if (document) {
      // handle web and mobile
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (document) {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [allowedKeys, callback]);
};
