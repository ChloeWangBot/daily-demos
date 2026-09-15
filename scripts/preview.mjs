import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "dist");
const port = Number(process.env.PORT || 4173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function locate(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const safe = normalize(clean).replace(/^(\.\.[/\\])+/, "");
  const absolute = join(root, safe);

  if (!absolute.startsWith(root)) return null;
  if (existsSync(absolute) && statSync(absolute).isFile()) return absolute;

  const asIndex = join(absolute, "index.html");
  if (existsSync(asIndex)) return asIndex;

  if (!extname(absolute)) {
    const withHtml = `${absolute}.html`;
    if (existsSync(withHtml)) return withHtml;
  }

  return null;
}

const server = createServer((req, res) => {
  const file = locate(req.url || "/");
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview http://127.0.0.1:${port}`);
});
