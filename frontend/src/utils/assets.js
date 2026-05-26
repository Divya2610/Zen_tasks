import api from "./api";

export const getAssetUrl = (asset) =>
  typeof asset === "string" ? asset : asset?.url ?? "";

export const getAssetName = (asset) =>
  typeof asset === "string"
    ? asset.split("/").pop()
    : asset?.name || asset?.url?.split("/").pop() || "file";

export const getAssetRole = (asset) =>
  typeof asset === "string" ? "admin" : asset?.uploadedByRole ?? "admin";

export const getAssetHref = (asset) => {
  const url = getAssetUrl(asset);
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = (api.defaults.baseURL || "").replace(/\/$/, "");
  if (url.startsWith("/api/")) return `${base}${url}`;
  const apiPrefix = base.endsWith("/api") ? "" : "/api";
  return `${base}${apiPrefix}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const getAssetKeepUrl = (asset) => getAssetUrl(asset);

export const isImageAsset = (asset) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(getAssetUrl(asset));
