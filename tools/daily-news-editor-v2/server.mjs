import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const editorFiles = new Map([
  ["/", ["dist/index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["dist/app.js", "text/javascript; charset=utf-8"]],
  ["/core.mjs", ["dist/core.mjs", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["dist/styles.css", "text/css; charset=utf-8"]],
]);
const imageTypes = new Map([
  [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"],
  [".webp", "image/webp"], [".gif", "image/gif"], [".svg", "image/svg+xml"],
]);

export function resolveRequestPath(rawUrl) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(rawUrl, "http://localhost").pathname); }
  catch { return null; }
  if (editorFiles.has(pathname)) {
    const [relative, type] = editorFiles.get(pathname);
    return { filename: path.join(root, relative), type };
  }
  if (!pathname.startsWith("/img/") || pathname.includes("\\") || pathname.includes("\0")) return null;
  const segments = pathname.slice(1).split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return null;
  const extension = path.extname(pathname).toLowerCase();
  if (!imageTypes.has(extension)) return null;
  return { filename: path.join(root, "../../public", ...segments), type: imageTypes.get(extension) };
}

export function createEditorServer() {
  return createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const target = resolveRequestPath(request.url);
    if (!target) { response.writeHead(404).end("Not found"); return; }
    try {
      const file = await stat(target.filename);
      if (!file.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "Content-Type": target.type, "Content-Length": file.size, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      if (request.method === "HEAD") response.end();
      else createReadStream(target.filename).pipe(response);
    } catch { response.writeHead(404).end("Not found"); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.KC_EDITOR_PORT || 4179);
  createEditorServer().listen(port, "127.0.0.1", () => {
    process.stdout.write(`KC Daily News Editor: http://127.0.0.1:${port}/\n`);
  });
}
