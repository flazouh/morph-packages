import { Effect, Option } from "effect"
import type { PullRequestRef } from "../domain/PullRequestRef"
import { afterWrite } from "../github/landed"
import { GitHubGateway } from "../ports/GitHubGateway"

export const mergeAsTheRepositoryDoes = Effect.fn("mergeAsTheRepositoryDoes")(function* (
  reference: PullRequestRef
) {
  const gateway = yield* GitHubGateway
  const how = yield* gateway.howToMerge(reference)

  if (Option.isNone(how.method)) {
    return yield* Effect.fail({
      reason: "rejected" as const,
      detail: "GitHub names no way to merge this pull request."
    })
  }

  yield* how.stacked
    ? gateway.mergeStack(reference, how.method.value)
    : gateway.merge(reference, how.method.value)
  afterWrite(reference, "merge")
})

export const closePullRequest = Effect.fn("closePullRequest")(function* (reference: PullRequestRef) {
  const gateway = yield* GitHubGateway
  yield* gateway.close(reference)
  afterWrite(reference, "close")
})

export const reopenPullRequest = Effect.fn("reopenPullRequest")(function* (reference: PullRequestRef) {
  const gateway = yield* GitHubGateway
  yield* gateway.reopen(reference)
  afterWrite(reference, "reopen")
})

export const markReadyForReview = Effect.fn("markReadyForReview")(function* (
  reference: PullRequestRef
) {
  const gateway = yield* GitHubGateway
  yield* gateway.markReady(reference)
  afterWrite(reference, "markReady")
})

export const convertToDraft = Effect.fn("convertToDraft")(function* (reference: PullRequestRef) {
  const gateway = yield* GitHubGateway
  yield* gateway.toDraft(reference)
  afterWrite(reference, "toDraft")
})
