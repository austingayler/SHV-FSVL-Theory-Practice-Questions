import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

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

export const useResponsiveVisibility = (breakpointWidth) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = Dimensions.get("window").width;
      setIsVisible(screenWidth >= breakpointWidth);
    };

    // Initial check on mount
    handleResize();

    // Add event listener for screen resize
    const listener = Dimensions.addEventListener("change", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      listener.remove();
    };
  }, [breakpointWidth]);

  return isVisible;
};
