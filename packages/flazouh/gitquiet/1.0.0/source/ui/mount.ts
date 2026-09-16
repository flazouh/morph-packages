// stub: mount.ts is the extension entry point — not used in this Morph slice

export const ROOT_ID = "gitquiet-root"
export const OUTSIDE = "data-gitquiet-outside"
export const SCREEN_ACTIVITY = "data-gitquiet-screen-activity"
export const WITHIN = "data-gitquiet-within"
export const GOING = "gitquiet:going"
export const SCREEN_MOVED = "gitquiet:screen-moved"

export const theScreenMoved = (_page: Document): void => {}
export const theScreenActivityChanged = (_element: Element): void => {}
export const oursToDraw = (_page: Document): boolean => true
export const whenTheScreenMoves = (_page: Document, _watcher: () => void): (() => void) => () => {}
export const markPage = (_target: Document, _place: unknown): void => {}
export const unmarkPage = (_target: Document): void => {}
export const reveal = (_target: Document): void => {}
export const handBack = (_target: Document): void => {}
export const ungate = (_target: Document): void => {}
export const gate = (_target: Document): void => {}
export const theScreenShown = (_target: Document): string | null => null
const AT = "data-gitquiet-at"
let holder: symbol | null = null

export const theScreenIsAt = (target: Document, path: string, owner: symbol): void => {
  holder = owner
  target.documentElement.setAttribute(AT, path)
}
export const theScreenLeft = (target: Document, owner: symbol): void => {
  if (holder !== owner) return
  holder = null
  target.documentElement.removeAttribute(AT)
}
export const theScreenIsNotElsewhere = (_target: Document, _place: string): boolean => true
export const theScreenArrived = (_target: Document, _place: string, _path: string): boolean => false
export const stillArriving = (_target: Document): boolean => false
export const whenThereIsAPage = (_page: Document, ready: () => void): (() => void) => { ready(); return () => {} }
export const interfaceContainer = (_target: Document): Element | null => null
export const ourSurface = (_target: Document): Element | null => null
export const theScreenOnThePage = (_target: Document): Element | null => null
export const theScreenHasRoute = (_target: Document, _route: string): boolean => false
export const theScreenStandsFor = (_target: Document): string | null => null
export const markScreenRoute = (_target: Document, _route: string): void => {}
export const markScreenRouteWhenWhole = (_target: Document, _path: string): void => {}
export const holdTheSurface = (_target: Document): void => {}
export const findConversationSlot = (_target: Document): Element | null => null
export const findSlot = (_target: Document, _place?: unknown): Element | null => null
export const rememberPreparedScreen = (_target: Document, _kind: string, _path: string): void => {}
export const rememberLiveScreen = (_target: Document, _kind: string, _path: string): void => {}
export const hasPreparedScreen = (_target: Document, _kind: string, _path: string): boolean => false
export const prepareCachedTraversal = (_target: Document): void => {}
export const activatePreparedTraversal = (_target: Document): void => {}
export const whenTakenOver = (_target: Document, _ready: () => void): (() => void) => () => {}
