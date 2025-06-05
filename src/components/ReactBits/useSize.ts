"use client"
import { useLayoutEffect, useState, RefObject, useCallback } from 'react';
import debounce from 'lodash.debounce';

// Define a type for the size object.
type Size = {
  width: number;
  height: number;
};

// The useSize hook that takes a React RefObject.
export function useSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    if (ref.current) {
      setSize({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      });
    }
  }, [ref]);

  useLayoutEffect(() => {
    if (ref.current) {
      handleResize();
    }
    const debouncedHandleResize = debounce(handleResize, 100);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      debouncedHandleResize.cancel();
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [ref, handleResize]);

  return size;
} 