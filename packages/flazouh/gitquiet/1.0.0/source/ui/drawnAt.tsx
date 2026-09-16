import { useEffect, useRef } from "react"
import { markScreenRouteWhenWhole, theScreenIsAt, theScreenLeft } from "./mount"
import { useScreenActivity } from "./screenActivity"

export const useDrawnAt = (path: string | null, target: Document = document): void => {
  const mine = useRef<symbol>(undefined)
  mine.current ??= Symbol("drawn at")

  useEffect(() => {
    const owner = mine.current
    if (path === null || owner === undefined) return

    markScreenRouteWhenWhole(target, path)
    theScreenIsAt(target, path, owner)
    return () => theScreenLeft(target, owner)
  }, [path, target])
}

export const DrawnAt = ({ path }: { readonly path: string | null }) => {
  const active = useScreenActivity()
  useDrawnAt(active ? path : null)
  return null
}
