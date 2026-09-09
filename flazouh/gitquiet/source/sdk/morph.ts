import { Effect, Option, Schema } from "effect"
import type { SandboxRequester } from "../../../sandbox/request"
import type { PageContext } from "../../../sandbox/firewall"

/**
 * The Morph host handle the package entry receives.
 *
 * Set once at start. Every GitHub read and write goes through this, because the
 * sandbox has no network of its own.
 */
let requester: SandboxRequester | undefined

export const setMorph = (morph: SandboxRequester): void => {
  requester = morph
}

export const morphRequest = (
  capability: string,
  fields: Readonly<Record<string, unknown>> = {}
): Effect.Effect<unknown, { readonly message: string }> => {
  if (requester === undefined) {
    return Effect.fail({ message: "Morph is not connected" })
  }
  return requester.request(capability, fields)
}

const PageFetchAnswer = Schema.Struct({
  status: Schema.Number,
  body: Schema.Unknown
})

export type PageFetchAnswer = typeof PageFetchAnswer.Type

export const asPageFetch = (value: unknown): PageFetchAnswer =>
  Option.getOrElse(Schema.decodeUnknownOption(PageFetchAnswer)(value), () => ({
    status: 0,
    body: value
  }))

const PageContextAnswer = Schema.Struct({
  signedIn: Schema.optionalKey(Schema.Boolean),
  login: Schema.optionalKey(Schema.String),
  faceUrl: Schema.optionalKey(Schema.String),
  colorMode: Schema.optionalKey(Schema.Literals(["light", "dark", "auto"])),
  path: Schema.optionalKey(Schema.String)
})

export const asContext = (value: unknown): PageContext => {
  const candidate = Option.getOrUndefined(Schema.decodeUnknownOption(PageContextAnswer)(value))
  return {
    signedIn: candidate?.signedIn === true,
    login: candidate?.login,
    faceUrl: candidate?.faceUrl,
    // `auto` where the host said nothing: the same fallback its own reader takes.
    colorMode: candidate?.colorMode ?? "auto",
    path: candidate?.path ?? "/pulls"
  }
}
