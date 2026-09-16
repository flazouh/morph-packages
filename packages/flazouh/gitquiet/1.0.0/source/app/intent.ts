// stub: Morph handles navigation differently
export const intendTo = (_target: Window, _path: string): void => {}
export const intendedPath = (_target: Window): string | null => null
export const prepareTo = (_target: Window, _path: string): void => {}
export const forgetIntent = (_target: Window): void => {}
export type Preparing = (_path: string) => void
export const whenPreparing = (_target: Window, _prepare: Preparing): (() => void) => () => {}
