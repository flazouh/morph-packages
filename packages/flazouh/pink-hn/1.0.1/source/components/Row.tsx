import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, Comment01Icon } from "@hugeicons/core-free-icons"
import { Tooltip, cn } from "beui"

export interface Story {
  id: string
  rank: string
  title: string
  href: string
  site: string
  siteHref: string
  points: number | null
  author: string
  authorHref: string
  age: string
  ageHref: string
  commentLabel: string
  commentCount: number | null
  commentsHref: string
}

const upvote = (id: string) => {
  const original = document.getElementById("up_" + id)
  if (original) original.click()
}

export function Row({ story }: { story: Story }) {
  return (
    <li className="flex items-baseline gap-3 px-4 py-4 leading-7 transition-colors hover:bg-foreground/[0.04] sm:gap-4 sm:px-6">
      <span className="w-6 shrink-0 text-right font-mono text-[13px] tabular-nums text-[var(--accent)]">
        {story.rank}
      </span>

      {story.id ? (
        <Tooltip content="Upvote" side="top">
          <button
            type="button"
            aria-label={"Upvote " + story.title}
            onClick={() => upvote(story.id)}
            className="-my-1 shrink-0 rounded-md p-1 transition-colors hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HugeiconsIcon
              icon={ArrowUp01Icon}
              size={16}
              strokeWidth={1.5}
              className="text-[var(--accent)]"
            />
          </button>
        </Tooltip>
      ) : (
        <span className="w-6 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <a
            href={story.href}
            className="text-sm font-bold text-card-foreground hover:underline"
            style={{ color: "#ff6ec7" }}
          >
            {story.title}
          </a>
          {story.site ? (
            <a
              href={story.siteHref}
              className={cn("text-[13px] text-muted-foreground hover:text-foreground hover:underline")}
            >
              {story.site}
            </a>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-6 text-muted-foreground">
          {story.points !== null ? (
            <span className="font-mono tabular-nums">{story.points} points</span>
          ) : null}
          {story.author ? (
            <span>
              by{" "}
              <a href={story.authorHref} className="hover:text-foreground hover:underline">
                {story.author}
              </a>
            </span>
          ) : null}
          {story.age ? (
            <a href={story.ageHref} className="hover:text-foreground hover:underline">
              {story.age}
            </a>
          ) : null}
          {story.commentsHref ? (
            <a
              href={story.commentsHref}
              className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
            >
              <HugeiconsIcon icon={Comment01Icon} size={16} strokeWidth={1.5} />
              <span className={cn(story.commentCount !== null && "font-mono tabular-nums")}>
                {story.commentCount !== null ? story.commentCount + " comments" : story.commentLabel}
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </li>
  )
}
