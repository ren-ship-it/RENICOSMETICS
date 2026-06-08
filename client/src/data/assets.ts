/**
 * Centralised brand asset URLs — single swap-point for de-platforming.
 *
 * These images are Reni's own brand assets that currently happen to be hosted on
 * the original build platform's CDN. To fully remove third-party hosting, upload
 * them to your own CDN / S3 bucket and change the URLs HERE in one place. Product
 * images are already database-backed (see scripts/seedProducts.ts + admin), so
 * this file covers the remaining logo, hero and SEO imagery.
 */

const CDN = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795";

export const ASSETS = {
  logoCream: `${CDN}/lDbbnIPJPEqHzmnS.png`,
  logoDark: `${CDN}/hMvCPNXLdbYPQXii.png`,
  brandStoryProduct: `${CDN}/mGILbKUCGqEqLspJ.jpg`,
  brandStoryTexture: `${CDN}/SyHuyeCsFeEPTkhN.jpg`,
  brandStoryWhiteIcon: `${CDN}/BLChaTVelCndBUOt.png`,
  scienceBg: `${CDN}/EJPqtjCtpnJzniFD.jpg`,
  featuredProduct: `${CDN}/QZiaKdBnbNxrVjaF.jpg`,
  featuredLabelDark: `${CDN}/qCooMEEiTbFjrbIa.png`,
  featuredLabelLight: `${CDN}/jJbLuiBwvuSLIXug.png`,
  seoDefault: `${CDN}/qiRyrUiSwYwLhIls.jpg`,
} as const;
