// stub: viewer.ts reads GitHub DOM — replaced with a settable module object in Morph
import { Option } from "effect"

type ViewerState = {
  login?: string
  faceUrl?: string
  signedIn?: boolean
}

let viewer: ViewerState = { signedIn: false }

export const setViewer = (state: ViewerState): void => {
  viewer = state
}

export const loginOnPage = (): string | undefined =>
  viewer.signedIn ? viewer.login : undefined

export const viewerOnPage = (): boolean => viewer.signedIn === true

export const isViewer = (login: string): boolean => {
  const mine = loginOnPage()
  return mine !== undefined && mine.toLowerCase() === login.toLowerCase()
}

export const faceOnPage = (): string | undefined =>
  viewer.signedIn ? viewer.faceUrl : undefined

export const participantOnPage = ():
  | { readonly login: string; readonly faceUrl: Option.Option<string> }
  | undefined => {
  const login = loginOnPage()
  if (login === undefined) return undefined
  return { login, faceUrl: Option.fromNullishOr(faceOnPage()) }
}
