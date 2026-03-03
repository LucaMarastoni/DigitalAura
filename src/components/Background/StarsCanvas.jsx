import { useEffect } from "react";

const STARS_SCRIPT_ID = "stars-bg-runtime";

export function StarsCanvas() {
  useEffect(() => {
    if (document.getElementById(STARS_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = STARS_SCRIPT_ID;
    script.async = true;
    script.src = `${import.meta.env.BASE_URL}assets/stars-bg.js`;
    document.body.appendChild(script);
  }, []);

  return <canvas id="stars-bg" aria-hidden="true"></canvas>;
}
