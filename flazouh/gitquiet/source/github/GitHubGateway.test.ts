import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { layer } from "./GitHubGateway"
import { GitHubGateway } from "../ports/GitHubGateway"
import { setMorph } from "../sdk/morph"
import { installMorphBrowser } from "../ports/morphBrowser"

const listing = {
  payload: {
    workingSetRoute: {
      results: [
        {
          id: "PR_1",
          number: 42,
          title: "Keep the sandbox pure",
          repoNameWithOwner: "flazouh/gitquiet",
          permalink: "/flazouh/gitquiet/pull/42",
          author: { displayLogin: "flazouh" },
          state: "OPEN",
          isDraft: false,
          category: "WAITING_FOR_REVIEW",
          isReadByCurrentUser: true,
          commentCount: 0,
          labels: [],
          assignees: [],
          createdAt: "2026-09-01T00:00:00Z",
          updatedAt: "2026-09-01T00:00:00Z",
          headSha: "abc",
          authoredByAgent: false
        }
      ]
    }
  }
}

describe("Morph GitQuiet inbox gateway", () => {
  test("reads a working-set shelf through morph.request", async () => {
    const calls: Array<{ capability: string; fields: Readonly<Record<string, unknown>> }> = []
    setMorph({
      request: (capability, fields = {}) => {
        calls.push({ capability, fields })
        return Effect.succeed({ status: 200, body: listing })
      }
    })
    installMorphBrowser()

    const rows = await Effect.runPromise(
      Effect.gen(function* () {
        const gateway = yield* GitHubGateway
        return yield* gateway.workingSet("needs-action")
      }).pipe(Effect.provide(layer))
    )

    expect(calls[0]).toEqual({
      capability: "network.fetch",
      fields: {
        url: "https://github.com/pulls/inbox/queries?filter=needs-action&max_pr_age=1m",
        method: "GET",
        accept: "application/json",
        requestedWith: "XMLHttpRequest"
      }
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.title).toBe("Keep the sandbox pure")
    expect(rows[0]?.reference).toEqual({ owner: "flazouh", repo: "gitquiet", number: 42 })
  })

  test("refuses a pull-request snapshot that is not in this slice", async () => {
    setMorph({
      request: () => Effect.succeed({ status: 200, body: {} })
    })
    const error = await Effect.runPromise(
      Effect.gen(function* () {
        const gateway = yield* GitHubGateway
        return yield* gateway.snapshot({ owner: "flazouh", repo: "gitquiet", number: 1 }).pipe(Effect.flip)
      }).pipe(Effect.provide(layer))
    )
    expect(error.reason).toBe("not-recorded")
  })
})
