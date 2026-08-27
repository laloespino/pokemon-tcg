import { copyFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const distPath = new URL("../dist/", import.meta.url)

await copyFile(
  join(distPath.pathname, "index.html"),
  join(distPath.pathname, "404.html")
)
await writeFile(join(distPath.pathname, ".nojekyll"), "")
