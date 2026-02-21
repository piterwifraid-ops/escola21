import { useEffect } from 'react';

interface PixelTrackingOptions {
  pixelId?: string;
  autoInit?: boolean;
}

export const usePixelTracking = (options: PixelTrackingOptions = {}) => {
  const { pixelId = "6998b49e4e91ab58a0b82a86", autoInit = true } = options;

  useEffect(() => {
    if (!autoInit) return;

    // Set the pixel ID on window
    window.pixelId = pixelId;

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://cdn.utmify.com.br/scripts/pixel/pixel.js"]');
    if (existingScript) return;

    // Create and append the pixel script
    const script = document.createElement("script");
    script.setAttribute("async", "");
    script.setAttribute("defer", "");
    script.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Note: We don't remove the script on cleanup as it should persist across components
    };
  }, [pixelId, autoInit]);

  return { pixelId };
};
