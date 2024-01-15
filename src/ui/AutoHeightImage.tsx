import { Image } from "react-native";
import React, { useEffect, useState } from "react";

// https://stackoverflow.com/a/72740667/419194
// responsive image container that:
// -can handle max height
// -image is responsive to height of container
// -works with unknown aspect ratio, can be portrait or landscape
export function AutoHeightImage({ uri, style }) {
  const [paintedWidth, setPaintedWidth] = useState(0);
  const [resultHeight, setResultHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);

  useEffect(() => {
    let stillMounted = true;
    Image.getSize(uri, (realW, realH) => {
      if (!paintedWidth || !stillMounted) return;
      const shrinkRatio = realW / paintedWidth;
      setResultHeight(realH / shrinkRatio);
      setAspectRatio(realH / realW);
    });
    return () => {
      stillMounted = false;
    };
  }, [paintedWidth, uri]);

  return (
    <Image
      style={[
        { width: "100%" },
        style,
        { height: resultHeight, aspectRatio, resizeMode: "contain" },
      ]}
      source={{ uri }}
      onLayout={(event) => setPaintedWidth(event.nativeEvent.layout.width)}
    />
  );
}
