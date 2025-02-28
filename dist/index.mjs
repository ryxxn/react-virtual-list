// src/use-virtual-list.ts
import React from "react";
import { flushSync } from "react-dom";
var SCROLLING_WAIT = 100;
var useVirtualized = ({
  data,
  height,
  rowHeight,
  buffer = 50
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [isScrollingX, setIsScrollingX] = React.useState(false);
  const [isScrollingY, setIsScrollingY] = React.useState(false);
  const containerRef = React.useRef(null);
  const scrollTimeoutXRef = React.useRef(null);
  const scrollTimeoutYRef = React.useRef(null);
  const scrollXHandler = (newScrollLeft) => {
    flushSync(() => {
      setIsScrollingX(true);
      setScrollLeft(newScrollLeft);
    });
    if (scrollTimeoutXRef.current)
      clearTimeout(scrollTimeoutXRef.current);
    scrollTimeoutXRef.current = setTimeout(
      () => setIsScrollingX(false),
      SCROLLING_WAIT
    );
  };
  const scrollYHandler = (newScrollTop) => {
    flushSync(() => {
      setIsScrollingY(true);
      setScrollTop(newScrollTop);
    });
    if (scrollTimeoutYRef.current)
      clearTimeout(scrollTimeoutYRef.current);
    scrollTimeoutYRef.current = setTimeout(
      () => setIsScrollingY(false),
      SCROLLING_WAIT
    );
  };
  const handleScroll = () => {
    if (!containerRef.current)
      return;
    requestAnimationFrame(() => {
      const newScrollTop = containerRef.current.scrollTop;
      const newScrollLeft = containerRef.current.scrollLeft;
      const scrollingX = newScrollLeft !== scrollLeft;
      const scrollingY = newScrollTop !== scrollTop;
      if (scrollingX)
        scrollXHandler(newScrollLeft);
      if (scrollingY)
        scrollYHandler(newScrollTop);
    });
  };
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container)
      return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutXRef.current)
        clearTimeout(scrollTimeoutXRef.current);
      if (scrollTimeoutYRef.current)
        clearTimeout(scrollTimeoutYRef.current);
    };
  }, [handleScroll]);
  const startIdx = Math.max(
    0,
    // Math.floor(scrollTopRef.current / rowHeight) - dynamicBuffer
    Math.floor(scrollTop / rowHeight) - buffer
  );
  const endIdx = Math.min(
    data.length,
    startIdx + Math.ceil(height / rowHeight) + buffer * 2
  );
  const visibleData = data.slice(startIdx, endIdx);
  const totalHeight = data.length * rowHeight;
  const getContainerStyle = React.useCallback(
    () => ({ maxHeight: height, height }),
    [height]
  );
  const getListStyle = React.useCallback(
    () => ({ height: totalHeight, position: "relative" }),
    [totalHeight]
  );
  const getRowStyle = React.useCallback(
    (index) => ({
      width: "100%",
      height: rowHeight,
      position: "absolute",
      transform: `translateY(${(startIdx + index) * rowHeight}px)`
    }),
    [startIdx, rowHeight]
  );
  return {
    visibleData,
    containerRef,
    endIdx,
    startIdx,
    scrollTop,
    scrollLeft,
    rowHeight,
    totalHeight,
    isScrollingX,
    isScrollingY,
    getListStyle,
    getRowStyle,
    getContainerStyle
  };
};
var use_virtual_list_default = useVirtualized;
export {
  use_virtual_list_default as useVirtualList
};
