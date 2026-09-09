import type { SandboxCapabilities } from "../../manifest"

export const GITQUIET_SLUG = "flazouh/gitquiet"

export const GITQUIET_PATHS = ["/pulls", "/pulls/inbox"] as const

export const GITQUIET_CAPABILITIES: SandboxCapabilities = {
  takeover: {
    slot: '[data-testid="pulls-dashboard-surface-layout"]',
    fallback: 'react-app[app-name="dashboard-surface"]'
  },
  page: {
    read: [],
    navigate: ["https://github.com"],
    // The bar's Back and Forward, which walk the tab rather than name an address.
    traverse: true
  },
  network: [
    {
      origin: "https://github.com",
      paths: [
        "/pulls/inbox/queries",
        "/pulls/inbox/deferred",
        "/search",
        "/_filter/repositories",
        "/*/*/pull/*/page_data/merge_box",
        "/*/*/pull/*/page_data/diffstat",
        "/*/*/pull/*/page_data/close_pull_request",
        "/*/*/pull/*/page_data/reopen_pull_request",
        "/*/*/pull/*/page_data/mark_ready_for_review",
        "/*/*/pull/*/page_data/convert_to_draft",
        "/*/*/pull/*/page_data/merge",
        "/*/*/pull/*/page_data/enqueue_stack"
      ],
      methods: ["GET", "POST"],
      credentials: "include",
      headers: ["Accept", "X-Requested-With", "Content-Type", "GitHub-Verified-Fetch"]
    }
  ],
  storage: true,
  context: {
    viewer: true,
    theme: true,
    route: true
  },
  // Faces. GitHub redirects `github.com/<login>.png` to the avatar host, and the payloads
  // name that host outright, so the inbox needs to read from both.
  assets: ["https://github.com", "https://avatars.githubusercontent.com"],
  secureForms: []
}
