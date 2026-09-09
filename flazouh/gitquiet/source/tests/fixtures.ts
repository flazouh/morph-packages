import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export type FixtureName = string

export const loadFixture = (name: FixtureName): unknown =>
  JSON.parse(
    readFileSync(resolve(import.meta.dir, "fixtures", `${name}.json`), "utf8")
  ) as unknown
