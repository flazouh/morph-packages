import { Effect, Layer, Option } from "effect"
import type { MergeMethod } from "../domain/PullRequest"
import type { PullRequestRef, RepoRef } from "../domain/PullRequestRef"
import type { Involvement } from "../domain/issues"
import type { InvolvedPullRequest, Shelf, Standings } from "../domain/workingSet"
import {
  GatewayError,
  GitHubGateway,
  WorkingSetError
} from "../ports/GitHubGateway"
import { MERGE_BOX, fetchRoute, saidAt, writeAt } from "./asking"
import {
  forget,
  recallRoute,
  recallRows,
  rememberBranches,
  rememberLanded,
  rememberRoute,
  rememberSize,
  rememberStanding
} from "./cache"
import { decodeDiffstat, decodeDeferred, decodeShelf, involvedIn, sizeIn, standingsIn } from "./involved"
import { involvedIssuesFrom } from "./issues"
import { landedNow, recordLanded, seeded } from "./landed"
import { decodeMergeBox, landingMethods, stacked } from "./mergeBox"
import { repositoriesFrom } from "./repositories"

const DIFFSTAT = "/page_data/diffstat"
const MERGE = "/page_data/merge"
const MERGE_STACK = "/page_data/enqueue_stack"
const CLOSE = "/page_data/close_pull_request"
const REOPEN = "/page_data/reopen_pull_request"
const MARK_READY = "/page_data/mark_ready_for_review"
const TO_DRAFT = "/page_data/convert_to_draft"
const REPOSITORIES = "/_filter/repositories?q=&filter_value="
const PER_BATCH = 9

const QUALIFIER_OF: Record<Involvement, string> = {
  assigned: "assignee",
  authored: "author",
  mentioned: "mentions"
}

const shelfRoute = (shelf: Shelf): string => `/pulls/inbox/queries?filter=${shelf}&max_pr_age=1m`

const deferredRoute = (ids: ReadonlyArray<string>): string =>
  `/pulls/inbox/deferred?page=1&${ids.map((id) => `ids%5B%5D=${encodeURIComponent(id)}`).join("&")}`

const issuesRoute = (involvement: Involvement): string =>
  `/search?${new URLSearchParams({
    q: `${QUALIFIER_OF[involvement]}:@me is:issue is:open`,
    type: "issues"
  }).toString()}`

const inBatches = (ids: ReadonlyArray<string>): ReadonlyArray<ReadonlyArray<string>> => {
  const batches: Array<ReadonlyArray<string>> = []
  for (let index = 0; index < ids.length; index += PER_BATCH) {
    batches.push(ids.slice(index, index + PER_BATCH))
  }
  return batches
}

const LEAVES_IT: Readonly<Record<string, "merged" | "closed" | "open" | "draft">> = {
  [MERGE]: "merged",
  [MERGE_STACK]: "merged",
  [CLOSE]: "closed",
  [REOPEN]: "open",
  [MARK_READY]: "open",
  [TO_DRAFT]: "draft"
}

const reasonGiven = (body: unknown): string | undefined => {
  if (typeof body === "string") {
    try {
      return reasonGiven(JSON.parse(body) as unknown)
    } catch {
      return body.length > 0 ? body : undefined
    }
  }
  if (typeof body !== "object" || body === null) return undefined
  const sentence = (body as { message?: unknown; error?: unknown }).message ?? (body as { error?: unknown }).error
  return typeof sentence === "string" && sentence.length > 0 ? sentence : undefined
}

const fetchViewerRoute = Effect.fn("fetchViewerRoute")(function* (route: string) {
  const said = yield* saidAt(`https://github.com${route}`)
  if (!said.ok) {
    return yield* new WorkingSetError({ route, reason: said.why, detail: said.detail })
  }
  return said.payload
})

const shelfIn = (
  shelf: Shelf,
  route: string,
  raw: unknown
): Effect.Effect<ReadonlyArray<InvolvedPullRequest>, WorkingSetError> =>
  seeded.pipe(
    Effect.andThen(() => decodeShelf(raw)),
    Effect.map((decoded) => involvedIn(Option.some(shelf), decoded.results)),
    Effect.catch((cause) =>
      Effect.fail(new WorkingSetError({ route, reason: "undecodable", detail: String(cause) }))
    )
  )

const writing = Effect.fn("writing")(function* (
  reference: PullRequestRef,
  route: string,
  body?: Readonly<Record<string, string | boolean>>
) {
  const url = `https://github.com/${reference.owner}/${reference.repo}/pull/${reference.number}${route}`
  const { status, body: answer } = yield* writeAt(url, body).pipe(
    Effect.mapError(
      (cause) => new GatewayError({ reference, route, reason: "unreachable", detail: cause.message })
    )
  )
  if (status < 200 || status >= 300) {
    return yield* new GatewayError({
      reference,
      route,
      reason: "rejected",
      detail: reasonGiven(answer) ?? `HTTP ${status}`
    })
  }
  const leaves = LEAVES_IT[route]
  if (leaves !== undefined) {
    recordLanded(reference, leaves)
    yield* Effect.forkDetach(rememberLanded(landedNow()))
  }
  yield* forget(reference)
})

const notRecorded = (reference: RepoRef, route = "/inbox") =>
  new GatewayError({
    reference,
    route,
    reason: "not-recorded",
    detail: "not in this Morph slice"
  })

const laterSlice = (inbox: object) =>
  new Proxy(inbox, {
    get(target, key, receiver) {
      if (Reflect.has(target, key)) return Reflect.get(target, key, receiver)
      if (typeof key === "string" && (key.startsWith("remembered") || key === "portrait" || key === "contributions")) {
        return () => Effect.succeed(Option.none())
      }
      if (key === "tolerated") return (checks: unknown) => Effect.succeed(checks)
      return (reference: RepoRef = { owner: "unknown", repo: "unknown" }) => Effect.fail(notRecorded(reference))
    }
  })

export const layer = Layer.succeed(GitHubGateway, laterSlice({
  workingSet: Effect.fn("GitHubGateway.workingSet")(function* (shelf: Shelf) {
    const route = shelfRoute(shelf)
    const raw = yield* fetchViewerRoute(route)
    const rows = yield* shelfIn(shelf, route, raw)
    yield* Effect.forkDetach(rememberRoute(route, raw, "standing"))
    return rows
  }),

  rememberedShelf: Effect.fn("GitHubGateway.rememberedShelf")(function* (shelf: Shelf) {
    const route = shelfRoute(shelf)
    const raw = yield* recallRoute(route)
    if (Option.isNone(raw)) return Option.none<ReadonlyArray<InvolvedPullRequest>>()
    return yield* shelfIn(shelf, route, raw.value).pipe(
      Effect.map(Option.some),
      Effect.catch(() => Effect.succeed(Option.none<ReadonlyArray<InvolvedPullRequest>>()))
    )
  }),

  standingsFor: Effect.fn("GitHubGateway.standingsFor")(function* (ids: ReadonlyArray<string>) {
    if (ids.length === 0) return new Map() as Standings
    const batches = yield* Effect.all(
      inBatches(ids).map((batch) =>
        Effect.gen(function* () {
          const route = deferredRoute(batch)
          const raw = yield* fetchViewerRoute(route)
          const decoded = yield* decodeDeferred(raw).pipe(
            Effect.catch((cause) =>
              Effect.fail(new WorkingSetError({ route, reason: "undecodable", detail: String(cause) }))
            )
          )
          return standingsIn(decoded)
        })
      ),
      { concurrency: "unbounded" }
    )
    const joined = new Map<string, NonNullable<ReturnType<Standings["get"]>>>()
    for (const batch of batches) {
      for (const [id, standing] of batch) joined.set(id, standing)
    }
    yield* Effect.forkDetach(
      Effect.forEach(joined, ([id, standing]) => rememberStanding(id, standing), { discard: true })
    )
    return joined as Standings
  }),

  branches: Effect.fn("GitHubGateway.branches")(function* (reference: PullRequestRef) {
    const raw = yield* fetchRoute(reference, MERGE_BOX)
    const decoded = yield* decodeMergeBox(raw).pipe(
      Effect.catch((cause) =>
        Effect.fail(
          new GatewayError({
            reference,
            route: MERGE_BOX,
            reason: "undecodable",
            detail: String(cause)
          })
        )
      )
    )
    const { baseRefName, headRefName } = decoded.pullRequest
    if (typeof baseRefName !== "string" || typeof headRefName !== "string") return Option.none()
    const branches = { baseBranch: baseRefName, headBranch: headRefName }
    yield* Effect.forkDetach(rememberBranches(reference, branches))
    return Option.some(branches)
  }),

  howToMerge: Effect.fn("GitHubGateway.howToMerge")(function* (reference: PullRequestRef) {
    const raw = yield* fetchRoute(reference, MERGE_BOX)
    const decoded = yield* decodeMergeBox(raw).pipe(
      Effect.catch((cause) =>
        Effect.fail(
          new GatewayError({
            reference,
            route: MERGE_BOX,
            reason: "undecodable",
            detail: String(cause)
          })
        )
      )
    )
    return {
      method: landingMethods(decoded.pullRequest).on,
      stacked: stacked(decoded.mergeRequirements?.conditions ?? [])
    }
  }),

  sizeOf: Effect.fn("GitHubGateway.sizeOf")(function* (reference: PullRequestRef) {
    const raw = yield* fetchRoute(reference, DIFFSTAT)
    const size = sizeIn(
      yield* decodeDiffstat(raw).pipe(
        Effect.catch((cause) =>
          Effect.fail(
            new GatewayError({
              reference,
              route: DIFFSTAT,
              reason: "undecodable",
              detail: String(cause)
            })
          )
        )
      )
    )
    yield* Effect.forkDetach(rememberSize(reference, size))
    return size
  }),

  rememberedRows: recallRows,

  involvedIssues: Effect.fn("GitHubGateway.involvedIssues")(function* (involvement: Involvement) {
    const route = issuesRoute(involvement)
    const raw = yield* fetchViewerRoute(route)
    const issues = yield* involvedIssuesFrom(involvement, raw).pipe(
      Effect.catch((cause) =>
        Effect.fail(new WorkingSetError({ route, reason: "undecodable", detail: String(cause) }))
      )
    )
    yield* Effect.forkDetach(rememberRoute(route, raw, "standing"))
    return issues
  }),

  rememberedInvolvedIssues: Effect.fn("GitHubGateway.rememberedInvolvedIssues")(function* (
    involvement: Involvement
  ) {
    const route = issuesRoute(involvement)
    const raw = yield* recallRoute(route)
    if (Option.isNone(raw)) return Option.none()
    return yield* involvedIssuesFrom(involvement, raw.value).pipe(
      Effect.map(Option.some),
      Effect.catch(() => Effect.succeed(Option.none()))
    )
  }),

  repositories: Effect.fn("GitHubGateway.repositories")(function* () {
    const raw = yield* fetchViewerRoute(REPOSITORIES)
    const repositories = yield* repositoriesFrom(raw).pipe(
      Effect.catch((cause) =>
        Effect.fail(new WorkingSetError({ route: REPOSITORIES, reason: "undecodable", detail: String(cause) }))
      )
    )
    yield* Effect.forkDetach(rememberRoute(REPOSITORIES, raw, "standing"))
    return repositories
  }),

  rememberedRepositories: Effect.fn("GitHubGateway.rememberedRepositories")(function* () {
    const raw = yield* recallRoute(REPOSITORIES)
    if (Option.isNone(raw)) return Option.none()
    return yield* repositoriesFrom(raw.value).pipe(
      Effect.map(Option.some),
      Effect.catch(() => Effect.succeed(Option.none()))
    )
  }),

  merge: Effect.fn("GitHubGateway.merge")(function* (reference: PullRequestRef, method: MergeMethod) {
    yield* writing(reference, MERGE, { mergeMethod: method, bypassBranchProtections: false })
  }),

  mergeStack: Effect.fn("GitHubGateway.mergeStack")(function* (
    reference: PullRequestRef,
    method: MergeMethod
  ) {
    yield* writing(reference, MERGE_STACK, { mergeMethod: method })
  }),

  close: Effect.fn("GitHubGateway.close")(function* (reference: PullRequestRef) {
    yield* writing(reference, CLOSE)
  }),

  reopen: Effect.fn("GitHubGateway.reopen")(function* (reference: PullRequestRef) {
    yield* writing(reference, REOPEN)
  }),

  markReady: Effect.fn("GitHubGateway.markReady")(function* (reference: PullRequestRef) {
    yield* writing(reference, MARK_READY)
  }),

  toDraft: Effect.fn("GitHubGateway.toDraft")(function* (reference: PullRequestRef) {
    yield* writing(reference, TO_DRAFT)
  })
}) as never)
