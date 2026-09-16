/**
 * The pull-request snapshot lives in a later Morph slice.
 *
 * The inbox only needs this payload shape for `asking.ts`.
 */
export type RawPayloads = {
  readonly changes: unknown
  readonly statusChecks: unknown
  readonly mergeBox: unknown
  readonly description: unknown
  readonly header: unknown
  readonly issueComments: unknown
  readonly preview?: unknown
}
