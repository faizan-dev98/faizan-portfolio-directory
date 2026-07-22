import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    let file = path.resolve(root, relativePath);

    if (!file.startsWith(`${root}${path.sep}`) && file !== root) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    let fileStat = await stat(file);
    if (fileStat.isDirectory()) {
      file = path.join(file, "index.html");
      fileStat = await stat(file);
    }

    const range = request.headers.range;
    const contentType = mimeTypes[path.extname(file).toLowerCase()] || "application/octet-stream";

    if (range && contentType === "video/mp4") {
      const [startText, endText] = range.replace("bytes=", "").split("-");
      const start = Number(startText);
      const end = endText ? Number(endText) : fileStat.size - 1;
      response.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
        "Content-Length": end - start + 1,
        "Content-Type": contentType,
      });
      createReadStream(file, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, {
      "Content-Length": fileStat.size,
      "Content-Type": contentType,
      "Cache-Control": contentType.startsWith("video/") ? "public, max-age=3600" : "no-cache",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, () => {
  console.log(`UI Directory is running at http://localhost:${port}`);
});
