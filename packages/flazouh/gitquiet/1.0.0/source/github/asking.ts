import { Effect } from "effect"
import type { PullRequestRef } from "../domain/PullRequestRef"
import { GatewayError } from "../ports/GitHubGateway"
import { asPageFetch, morphRequest } from "../sdk/morph"
import { askingOnce } from "./flight"

/**
 * Asking GitHub for a pull request, with no page underneath.
 *
 * Everything here is a GET or POST of one of their JSON routes through Morph.
 * The sandbox has no fetch of its own.
 */

/**
 * What one of GitHub's JSON routes said, as a value rather than as a failure.
 *
 * Every read of theirs goes wrong in one of these ways, and the reason has to
 * survive being carried between bundles by the promise several readers are sharing —
 * which is why it is here in the answer rather than beside it as a failure. Each
 * caller turns it back into its own kind of failure, which is where the difference
 * between them belongs.
 */
export type Said =
  | { readonly ok: true; readonly payload: unknown }
  | {
      readonly ok: false
      readonly why: "unreachable" | "rejected" | "down" | "undecodable" | "sign-on"
      readonly detail: string
    }

/**
 * Which of the three ways an answer that is not 200 can be not 200.
 *
 * GitHub answers 401 to their own JSON routes for a repository in an organisation
 * the reader has not signed on to, whether or not anybody is signed in — measured
 * on `/octo-org/octo-repo/pulls`, which answered 401 with an empty body to a
 * signed-in reader while the same route on a repository beside it answered 200.
 * The reader can walk through that one, so it is not filed with the rest.
 *
 * A 5xx is filed apart for a different reason: it is the only one of the three that
 * may be untrue a second later. Their crash page arrives as HTML under a 503 or a
 * 504 — `Unicorn! · GitHub` — and during the incident of 2026-08-17 it arrived on
 * about a fifth of every request made. That is the status {@link worthAnotherAsk}
 * asks again on, and the only one it does.
 */
/**
 * Whether asking the same question again could get a different answer.
 *
 * The whole of the retry policy, and it is deliberately two cases. A 403, a 404 and a
 * payload in a shape nothing here can read are all facts that hold still: asking three
 * times costs the reader three round trips and tells them what the first one did. A
 * 5xx and a connection that never opened are the two that do not hold still.
 */
const worthAnotherAsk = (said: Said): boolean =>
  !said.ok && (said.why === "down" || said.why === "unreachable")

/**
 * How long to wait before asking again, in milliseconds, one entry per retry.
 *
 * Short, because a reader is watching. Two waits and three asks in total puts a
 * route's own odds of never answering during a one-in-five incident at about one in a
 * hundred and twenty-five, and the five required routes together at about 96%, for a
 * worst case of 900ms added to a read that was going to fail anyway.
 *
 * Rising rather than flat because the second ask is worth more the further it is from
 * the first: an incident that is going to clear in the next second clears during the
 * longer wait, and one that is not is not worth a third ask a fifth of a second later.
 *
 * No spreading, deliberately. A retry policy usually scatters its waits so a service
 * is not hit by every client at once; this is one reader's browser making a few dozen
 * requests, and it is not the crowd anybody would be protecting GitHub from.
 */
const WAITS = [200, 700] as const

/**
 * One GET of one of their JSON routes, asked again where that could help, folded
 * together with any identical GET already in the air.
 *
 * A read ahead and the press that follows it want the same six routes, and this is
 * where they become one set of requests rather than two. The retries are inside that
 * folding on purpose: everybody waiting on the address waits through them and gets
 * the answer, rather than each caller starting a run of asks of its own.
 */
export const saidAt = (url: string): Effect.Effect<Said> =>
  askingOnce(
    url,
    Effect.gen(function* () {
      let said = yield* asking(url)

      for (const wait of WAITS) {
        if (!worthAnotherAsk(said)) return said
        yield* Effect.sleep(wait)
        said = yield* asking(url)
      }

      return said
    })
  )

const whyOfStatus = (status: number): Extract<Said, { ok: false }>["why"] => {
  if (status === 401) return "sign-on"
  return status >= 500 ? "down" : "rejected"
}

/** The ask itself, once, through Morph. The sandbox has no fetch of its own. */
const asking = (url: string): Effect.Effect<Said> =>
  morphRequest("network.fetch", {
    url,
    method: "GET",
    accept: "application/json",
    requestedWith: "XMLHttpRequest"
  }).pipe(
    Effect.map((raw): Said => {
      const { status, body } = asPageFetch(raw)
      if (status !== 200) return { ok: false, why: whyOfStatus(status), detail: `HTTP ${status}` }
      return { ok: true, payload: body }
    }),
    Effect.catch((cause) => Effect.succeed<Said>({ ok: false, why: "unreachable", detail: cause.message }))
  )

/**
 * The merge box, asked without naming a way of merging.
 *
 * The method is not ours to choose here, and naming one was read as a question
 * about that method: GitHub weighs every rule against whatever is in this
 * parameter, so `merge_method=MERGE` on a squash-only repository came back with
 * two separate conditions refusing a merge commit — the repository setting and
 * the base branch ruleset — over a button that squashes. Ahmed reported the pair
 * of them on `OpenRouterInternal/ori`.
 *
 * Left out, GitHub weighs the repository's own default, which is what their page
 * opens on. Measured on `flazouh/ghpro-scratch#12` with merge commits turned
 * off: `MERGE` answers `UNMERGEABLE` with one failed condition, `SQUASH` and no
 * method at all both answer `MERGEABLE` with none. A method GitHub cannot read
 * is not ignored the way the auto-merge route ignores one — `merge_method=NOT_A_METHOD`
 * answers 500 — so this parameter is either right or absent.
 *
 * Which method a press then sends is read out of the answer, off the direct
 * merge's own list of allowed methods. See `landingMethod` in `snapshot.ts`.
 */
export const MERGE_BOX = "/page_data/merge_box?bypass_requirements=false"

const routeFor = (reference: PullRequestRef, route: string): string =>
  `https://github.com/${reference.owner}/${reference.repo}/pull/${reference.number}${route}`

export const fetchRoute = Effect.fn("fetchRoute")(function* (
  reference: PullRequestRef,
  route: string
) {
  const said = yield* saidAt(routeFor(reference, route))
  if (!said.ok) {
    return yield* new GatewayError({ reference, route, reason: said.why, detail: said.detail })
  }

  return said.payload
})

/** One POST of a pull-request write, through Morph. */
export const writeAt = (
  url: string,
  body?: Readonly<Record<string, string | boolean>>
): Effect.Effect<{ readonly status: number; readonly body: unknown }, { readonly message: string }> =>
  morphRequest("network.fetch", {
    url,
    method: "POST",
    accept: "application/json",
    requestedWith: "XMLHttpRequest",
    contentType: "application/json",
    verifiedFetch: true,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  }).pipe(Effect.map(asPageFetch))
