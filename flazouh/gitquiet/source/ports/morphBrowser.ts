import { Effect } from "effect"
import { morphRequest } from "../sdk/morph"
import type { Changes, ForgetfulKeyValue, WatchedKeyValue } from "./KeyValue"

/**
 * A Morph-backed store that looks like `browser.storage`.
 *
 * GitQuiet's cache and settings already speak this shape. The sandbox has no
 * extension API, so this stands in and sends each key through `storage.get` and
 * `storage.set`.
 */
const memory = new Map<string, unknown>()
const listeners = new Set<(changes: Changes) => void>()

const run = <A>(effect: Effect.Effect<A, { readonly message: string }>, fallback: A): Promise<A> =>
  Effect.runPromise(effect.pipe(Effect.catch(() => Effect.succeed(fallback))))

const area = (): ForgetfulKeyValue & WatchedKeyValue => ({
  get: async (keys) => {
    const list = typeof keys === "string" ? [keys] : keys
    const out: Record<string, unknown> = {}
    await Promise.all(
      list.map(async (key) => {
        if (memory.has(key)) {
          out[key] = memory.get(key)
          return
        }
        const value = await run(morphRequest("storage.get", { key }), undefined)
        if (value !== undefined) {
          memory.set(key, value)
          out[key] = value
        }
      })
    )
    return out
  },
  set: async (items) => {
    const changes: Changes = {}
    await Promise.all(
      Object.entries(items).map(async ([key, value]) => {
        const written = await run(
          morphRequest("storage.set", { key, value }).pipe(Effect.map(() => true)),
          false
        )
        if (!written) return
        memory.set(key, value)
        changes[key] = { newValue: value }
      })
    )
    for (const listener of listeners) listener(changes)
  },
  remove: async (keys) => {
    const changes: Changes = {}
    for (const key of keys) {
      memory.delete(key)
      changes[key] = {}
    }
    await Promise.all(keys.map((key) => run(morphRequest("storage.set", { key, value: null }), undefined)))
    for (const listener of listeners) listener(changes)
  },
  onChanged: {
    addListener: (listener) => {
      listeners.add(listener)
    },
    removeListener: (listener) => {
      listeners.delete(listener)
    }
  }
})

export const installMorphBrowser = (): void => {
  const store = area()
  ;(globalThis as { browser?: { storage: { local: typeof store; sync: typeof store } } }).browser = {
    storage: { local: store, sync: store }
  }
}
