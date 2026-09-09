import { Option } from "effect"
import type { MergeMethod } from "../domain/PullRequest"
import { whereverItIs } from "./wherever"
import { MergeBoxRoute } from "./wire"

export const decodeMergeBox = whereverItIs(MergeBoxRoute)

export const stacked = (
  conditions: ReadonlyArray<{
    readonly type?: string | null | undefined
    readonly stack?: { readonly number: number } | null | undefined
    readonly entries?: ReadonlyArray<unknown> | null | undefined
  }>
): boolean => {
  const condition = conditions.find((one) => one.type === "STACK")
  return (
    condition?.stack !== undefined &&
    condition.stack !== null &&
    condition.entries !== undefined &&
    condition.entries !== null
  )
}

const sendable = (name: string): name is MergeMethod =>
  name === "MERGE" || name === "SQUASH" || name === "REBASE"

type Offered = {
  readonly name: string
  readonly allowableStatus?: string | null | undefined
  readonly isDefault?: boolean | null | undefined
}

type MergeAction = Offered & {
  readonly mergeMethods?: ReadonlyArray<Offered> | null | undefined
}

const allowedChoice = <A extends Offered>(offers: ReadonlyArray<A>): A | undefined => {
  const allowed = offers.filter((offer) => offer.allowableStatus === "ALLOWED")
  return allowed.find((offer) => offer.isDefault === true) ?? allowed[0]
}

export const landingMethods = (pullRequest: {
  readonly viewerMergeActions?: ReadonlyArray<MergeAction> | null | undefined
}): { readonly on: Option.Option<MergeMethod>; readonly among: ReadonlyArray<MergeMethod> } => {
  const direct = pullRequest.viewerMergeActions?.find(({ name }) => name === "DIRECT_MERGE")
  const ours = (direct?.mergeMethods ?? []).flatMap((method) =>
    sendable(method.name) ? [{ ...method, name: method.name }] : []
  )
  const on = Option.fromNullishOr(allowedChoice(ours)?.name)
  return {
    on,
    among: Option.isNone(on)
      ? []
      : ours.filter((method) => method.allowableStatus === "ALLOWED").map(({ name }) => name)
  }
}
