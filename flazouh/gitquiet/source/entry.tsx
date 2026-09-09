import { Effect, Option } from "effect"
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry"
import { createRoot } from "react-dom/client"
import { loadWorkingSet, rememberedWorkingSet } from "./app/workingSet"
import { ROW_WRITES } from "./app/rowWrites"
import { reportError } from "./observability/report"
import type { PullRequestRef } from "./domain/PullRequestRef"
import type { Repository } from "./domain/repositories"
import type { Sitting } from "./domain/sittings"
import { layer } from "./github/GitHubGateway"
import { GitHubGateway } from "./ports/GitHubGateway"
import { THE_WORKING_SET } from "./ui/lastDrawn"
import { ROOT_ID } from "./ui/mount"
import { ArtProvider } from "./ui/art"
import { RegistryProvider } from "./ui/atoms"
import { OCTICONS } from "./ui/octicons"
import { SettingsProvider } from "./ui/settings"
import { Theme } from "./ui/Theme"
import { Toasts } from "./ui/Toasts"
import { setViewer, participantOnPage } from "./ui/viewer"
import { WorkingSetScreen } from "./ui/WorkingSetScreen"
import { browserSettings } from "./settings/browserStore"
import { installMorphBrowser } from "./ports/morphBrowser"
import { asContext, setMorph, morphRequest } from "./sdk/morph"
import type { SandboxRequester } from "../../sandbox/request"
import "./ui/styles.css"

const throughGitHub = <A, E>(work: Effect.Effect<A, E, GitHubGateway>): Effect.Effect<A, E> =>
  Effect.provide(work, layer)

export const start = (morph: SandboxRequester) =>
  Effect.gen(function* () {
    setMorph(morph)
    installMorphBrowser()

    const context = asContext(yield* morphRequest("page.context"))
    /*
     * GitHub's colour choice, written onto the frame's own `<html>`.
     *
     * The frame cannot see their document, so every reader of `data-color-mode` in this
     * package — the theme, the first paint, the remembered scheme — would fall back to
     * the machine and paint white inside a black page. Mirroring the attribute leaves
     * all of them reading what they were written to read, and `auto` still defers to the
     * machine here exactly as it does on their page.
     */
    yield* Effect.sync(() =>
      document.documentElement.setAttribute("data-color-mode", context.colorMode)
    )
    setViewer({
      signedIn: context.signedIn,
      login: context.login,
      faceUrl: context.faceUrl
    })

    const host = document.getElementById("package-root")
    if (host === null) return
    const root = document.createElement("div")
    root.id = ROOT_ID
    host.replaceChildren(root)

    let asLastSeen = Option.none<ReadonlyArray<Sitting>>()

    const reading = () =>
      loadWorkingSet().pipe(
        throughGitHub,
        Effect.tap((sittings) =>
          Effect.sync(() => {
            asLastSeen = Option.some(sittings)
          })
        ),
        Effect.tapError((error) => Effect.sync(() => reportError(error)))
      )

    const remembered = () =>
      (Option.isSome(asLastSeen)
        ? Effect.succeed(asLastSeen)
        : rememberedWorkingSet().pipe(
            throughGitHub,
            Effect.catch(() => Effect.succeed(Option.none<ReadonlyArray<Sitting>>()))
          )
      )

    const askFor = (doing: keyof typeof ROW_WRITES, reference: PullRequestRef) =>
      ROW_WRITES[doing](reference).pipe(
        throughGitHub,
        Effect.tapError((error) => Effect.sync(() => reportError(error)))
      )

    const open = (reference: PullRequestRef) => {
      void Effect.runPromise(
        morphRequest("page.navigate", {
          url: `https://github.com/${reference.owner}/${reference.repo}/pull/${reference.number}`,
          target: "_self"
        })
      )
    }

    const stepAside = () => {
      void Effect.runPromise(morphRequest("page.restore"))
    }

    const settings = browserSettings()
    const registry = AtomRegistry.make()

    createRoot(root).render(
      <RegistryProvider registry={registry}>
        <SettingsProvider store={settings}>
          {/* The frame's document is the package's own, so the tokens go on `<html>`:
              it carries the colour scheme the frame paints its canvas from, and the
              menus this screen portals to `body` hang outside the root. */}
          <Theme scope="document" here="github">
            <ArtProvider here={OCTICONS}>
              <Toasts>
                <WorkingSetScreen
                  load={reading}
                  preload={remembered}
                  at={context.path}
                  where={THE_WORKING_SET}
                  onOpen={open}
                  onStepAside={stepAside}
                  ask={askFor}
                  home={false}
                  participant={participantOnPage()}
                  recallRepositories={() =>
                    Effect.gen(function* () {
                      const gateway = yield* GitHubGateway
                      return yield* gateway.rememberedRepositories()
                    }).pipe(
                      throughGitHub,
                      Effect.catch(() => Effect.succeed(Option.none<ReadonlyArray<Repository>>()))
                    )
                  }
                />
              </Toasts>
            </ArtProvider>
          </Theme>
        </SettingsProvider>
      </RegistryProvider>
    )

    return yield* Effect.never
  })
