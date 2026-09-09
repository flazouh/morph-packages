// stub: Morph does not use the GitHub signOn module
import { Option } from "effect"

export const AUTH_CLASS = "html-auth"
export const signOnWanted = (_html: string): Option.Option<string> => Option.none()
export const signOnPage = (_organisation: string, _backTo: string): string => ""
export type Wall = { readonly url: string }
export const THE_WALL_BOX = "div.org-sso"
export const mayBeTheWall = (_page: Document): boolean => false
export const wallIn = (_page: Document): Option.Option<Wall> => Option.none()
