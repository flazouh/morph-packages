import { useMemo } from "react"
import { Badge, ButtonLink, TextReveal } from "beui"
import { Row, type Story } from "./components/Row"

export const target = "#hnmain"

interface NavLink {
  label: string
  href: string
}

const text = (el: Element | null | undefined): string =>
  (el?.textContent ?? "").replace(/\s+/g, " ").trim()

const count = (value: string): number | null => {
  const match = value.match(/\d[\d,]*/)
  return match ? Number(match[0].replace(/,/g, "")) : null
}

const readStories = (): Story[] =>
  Array.from(document.querySelectorAll<HTMLTableRowElement>("#hnmain tr.athing")).map((row, index) => {
    const sub = row.nextElementSibling
    const titleLink = row.querySelector<HTMLAnchorElement>(".titleline a")
    const siteLink = row.querySelector<HTMLAnchorElement>(".sitebit a")
    const author = sub?.querySelector<HTMLAnchorElement>("a.hnuser") ?? null
    const age = sub?.querySelector<HTMLAnchorElement>(".age a") ?? null
    const subLinks = Array.from(sub?.querySelectorAll<HTMLAnchorElement>("a") ?? [])
    const comments = subLinks.filter((link) => /comment|discuss/i.test(text(link))).pop() ?? null

    return {
      id: row.id,
      rank: text(row.querySelector(".rank")).replace(".", "") || String(index + 1),
      title: text(titleLink) || "(untitled)",
      href: titleLink?.href ?? "",
      site: text(siteLink),
      siteHref: siteLink?.href ?? "",
      points: count(text(sub?.querySelector(".score"))),
      author: text(author),
      authorHref: author?.href ?? "",
      age: text(age) || text(sub?.querySelector(".age")),
      ageHref: age?.href ?? "",
      commentLabel: text(comments) || "discuss",
      commentCount: comments ? count(text(comments)) : null,
      commentsHref: comments?.href ?? age?.href ?? "",
    }
  })

const readNav = (): NavLink[] =>
  Array.from(document.querySelectorAll<HTMLAnchorElement>("#hnmain .pagetop a"))
    .filter((link) => !link.closest(".hnname"))
    .map((link) => ({ label: text(link), href: link.href }))
    .filter((link) => link.label.length > 0)

const readMore = (): NavLink | null => {
  const link = document.querySelector<HTMLAnchorElement>("#hnmain a.morelink")
  return link ? { label: text(link) || "More", href: link.href } : null
}

export default function Page() {
  const stories = useMemo(readStories, [])
  const nav = useMemo(readNav, [])
  const more = useMemo(readMore, [])

  return (
    <main className="min-h-screen bg-background font-sans text-foreground antialiased">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Front page</p>
            <Badge status="neutral" size="sm">
              {stories.length} stories
            </Badge>
          </div>
          <TextReveal as="h1" text="Hacker News" className="text-2xl font-medium tracking-tight" />
          <nav className="-ml-2 flex flex-wrap items-center gap-1">
            {nav.map((link) => (
              <ButtonLink key={link.label + link.href} href={link.href} variant="ghost" size="sm">
                {link.label}
              </ButtonLink>
            ))}
          </nav>
        </header>

        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {stories.map((story) => (
            <Row key={story.id || story.href} story={story} />
          ))}
        </ul>

        {more ? (
          <div className="flex justify-center">
            <ButtonLink href={more.href} variant="outline" size="sm">
              {more.label}
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </main>
  )
}
