// stub: Morph writes its own tab adapter
import type { Tab } from "../domain/tabs"

export type RepoRef = { readonly owner: string; readonly repo: string }

export const tabsInRow = (_row: Element): ReadonlyArray<Tab> => []
export const tabsOnPage = (_html: string): ReadonlyArray<Tab> => []
export const keptTabs = (_repo: RepoRef): ReadonlyArray<Tab> => []
export const keepTabs = (_repo: RepoRef, _tabs: ReadonlyArray<Tab>): void => {}
export const isKeptTabs = (_value: unknown): _value is ReadonlyArray<Tab> => false
