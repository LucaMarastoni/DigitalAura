const ASSET_ATTR_PATTERN =
  /(src|href|poster)=["']\.\/((?:image|video|logos|favicon|assets)\/[^"']+)["']/g;

export const withBaseAssetPaths = (html) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
  return html.replace(ASSET_ATTR_PATTERN, (_, attr, path) => `${attr}="${base}${path}"`);
};
