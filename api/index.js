import app from "../server/app.js";

export default function handler(req, res) {
  const url = new URL(req.url, "https://vercel.internal");
  const route = req.query?.__route ?? url.searchParams.get("__route");
  if (typeof route === "string") {
    url.searchParams.delete("__route");
    req.url = `/api${route}${url.search}`;
  }
  return app(req, res);
}
