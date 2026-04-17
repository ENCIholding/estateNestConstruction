import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToHashTarget } from "@/lib/scroll";

const ScrollToTop = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    const runScroll = () => {
      if (hash) {
        const foundTarget = scrollToHashTarget(hash, "smooth");

        if (foundTarget) {
          return;
        }
      }

      window.scrollTo({ top: 0, behavior: "auto" });
    };

    window.requestAnimationFrame(() => {
      window.setTimeout(runScroll, 0);
    });
  }, [hash, pathname]);

  return null;
};

export default ScrollToTop;
