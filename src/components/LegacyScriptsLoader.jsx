import { useEffect } from "react";

const LEGACY_SCRIPT_ID = "legacy-interactions-runtime";

export function LegacyScriptsLoader() {
  useEffect(() => {
    if (document.getElementById(LEGACY_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = LEGACY_SCRIPT_ID;
    script.src = `${import.meta.env.BASE_URL}scripts.js`;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
