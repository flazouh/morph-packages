window.__beui.skin(function (require, exports, module) {
var __inlined = {

};
var __files = {
"components/Row.tsx": function (require, exports, module) {
"use strict";var _jsxruntime = require("react/jsx-runtime");Object.defineProperty(exports, "__esModule", {value: true});var _react = require('@hugeicons/react');
var _corefreeicons = require('@hugeicons/core-free-icons');
var _beui = require('beui');


















const upvote = (id) => {
  const original = document.getElementById("up_" + id)
  if (original) original.click()
}

 function Row({ story }) {
  return (
    _jsxruntime.jsxs.call(void 0, 'li', { className: "flex items-baseline gap-3 px-4 py-4 leading-7 transition-colors hover:bg-foreground/[0.04] sm:gap-4 sm:px-6"         , children: [
      _jsxruntime.jsx.call(void 0, 'span', { className: "w-6 shrink-0 text-right font-mono text-[13px] tabular-nums text-[var(--accent)]"      , children: 
        story.rank
      })

      , story.id ? (
        _jsxruntime.jsx.call(void 0, _beui.Tooltip, { content: "Upvote", side: "top", children: 
          _jsxruntime.jsx.call(void 0, 'button', {
            type: "button",
            'aria-label': "Upvote " + story.title,
            onClick: () => upvote(story.id),
            className: "-my-1 shrink-0 rounded-md p-1 transition-colors hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"        ,
 children: 
            _jsxruntime.jsx.call(void 0, _react.HugeiconsIcon, {
              icon: _corefreeicons.ArrowUp01Icon,
              size: 16,
              strokeWidth: 1.5,
              className: "text-[var(--accent)]",}
            )
          })
        })
      ) : (
        _jsxruntime.jsx.call(void 0, 'span', { className: "w-6 shrink-0" ,} )
      )

      , _jsxruntime.jsxs.call(void 0, 'div', { className: "min-w-0 flex-1" , children: [
        _jsxruntime.jsxs.call(void 0, 'div', { className: "flex flex-wrap items-baseline gap-x-2"   , children: [
          _jsxruntime.jsx.call(void 0, 'a', {
            href: story.href,
            className: "text-sm font-bold text-card-foreground hover:underline"   ,
            style: { color: "#ff6ec7" },
 children: 
            story.title
          })
          , story.site ? (
            _jsxruntime.jsx.call(void 0, 'a', {
              href: story.siteHref,
              className: _beui.cn.call(void 0, "text-[13px] text-muted-foreground hover:text-foreground hover:underline"),
 children: 
              story.site
            })
          ) : null
        ]})

        , _jsxruntime.jsxs.call(void 0, 'div', { className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-6 text-muted-foreground"        , children: [
          story.points !== null ? (
            _jsxruntime.jsxs.call(void 0, 'span', { className: "font-mono tabular-nums" , children: [story.points, " points" ]})
          ) : null
          , story.author ? (
            _jsxruntime.jsxs.call(void 0, 'span', { children: ["by"
              , " "
              , _jsxruntime.jsx.call(void 0, 'a', { href: story.authorHref, className: "hover:text-foreground hover:underline" , children: 
                story.author
              })
            ]})
          ) : null
          , story.age ? (
            _jsxruntime.jsx.call(void 0, 'a', { href: story.ageHref, className: "hover:text-foreground hover:underline" , children: 
              story.age
            })
          ) : null
          , story.commentsHref ? (
            _jsxruntime.jsxs.call(void 0, 'a', {
              href: story.commentsHref,
              className: "inline-flex items-center gap-1.5 hover:text-foreground hover:underline"    ,
 children: [
              _jsxruntime.jsx.call(void 0, _react.HugeiconsIcon, { icon: _corefreeicons.Comment01Icon, size: 16, strokeWidth: 1.5,} )
              , _jsxruntime.jsx.call(void 0, 'span', { className: _beui.cn.call(void 0, story.commentCount !== null && "font-mono tabular-nums"), children: 
                story.commentCount !== null ? story.commentCount + " comments" : story.commentLabel
              })
            ]})
          ) : null
        ]})
      ]})
    ]})
  )
} exports.Row = Row;

},
"page.tsx": function (require, exports, module) {
"use strict";var _jsxruntime = require("react/jsx-runtime");Object.defineProperty(exports, "__esModule", {value: true});var _react = require('react');
var _beui = require('beui');
var _Row = require('./components/Row');

 const target = "#hnmain"; exports.target = target






const text = (el) =>
  (el?.textContent ?? "").replace(/\s+/g, " ").trim()

const count = (value) => {
  const match = value.match(/\d[\d,]*/)
  return match ? Number(match[0].replace(/,/g, "")) : null
}

const readStories = () =>
  Array.from(document.querySelectorAll("#hnmain tr.athing")).map((row, index) => {
    const sub = row.nextElementSibling
    const titleLink = row.querySelector(".titleline a")
    const siteLink = row.querySelector(".sitebit a")
    const author = sub?.querySelector("a.hnuser") ?? null
    const age = sub?.querySelector(".age a") ?? null
    const subLinks = Array.from(sub?.querySelectorAll("a") ?? [])
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

const readNav = () =>
  Array.from(document.querySelectorAll("#hnmain .pagetop a"))
    .filter((link) => !link.closest(".hnname"))
    .map((link) => ({ label: text(link), href: link.href }))
    .filter((link) => link.label.length > 0)

const readMore = () => {
  const link = document.querySelector("#hnmain a.morelink")
  return link ? { label: text(link) || "More", href: link.href } : null
}

 function Page() {
  const stories = _react.useMemo.call(void 0, readStories, [])
  const nav = _react.useMemo.call(void 0, readNav, [])
  const more = _react.useMemo.call(void 0, readMore, [])

  return (
    _jsxruntime.jsx.call(void 0, 'main', { className: "min-h-screen bg-background font-sans text-foreground antialiased"    , children: 
      _jsxruntime.jsxs.call(void 0, 'div', { className: "mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10"        , children: [
        _jsxruntime.jsxs.call(void 0, 'header', { className: "flex flex-col gap-4"  , children: [
          _jsxruntime.jsxs.call(void 0, 'div', { className: "flex items-center gap-3"  , children: [
            _jsxruntime.jsx.call(void 0, 'p', { className: "text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"    , children: "Front page" })
            , _jsxruntime.jsxs.call(void 0, _beui.Badge, { status: "neutral", size: "sm", children: [
              stories.length, " stories"
            ]})
          ]})
          , _jsxruntime.jsx.call(void 0, _beui.TextReveal, { as: "h1", text: "Hacker News" , className: "text-2xl font-medium tracking-tight"  ,} )
          , _jsxruntime.jsx.call(void 0, 'nav', { className: "-ml-2 flex flex-wrap items-center gap-1"    , children: 
            nav.map((link) => (
              _jsxruntime.jsx.call(void 0, _beui.ButtonLink, { href: link.href, variant: "ghost", size: "sm", children: 
                link.label
              }, link.label + link.href)
            ))
          })
        ]})

        , _jsxruntime.jsx.call(void 0, 'ul', { className: "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"      , children: 
          stories.map((story) => (
            _jsxruntime.jsx.call(void 0, _Row.Row, { story: story,}, story.id || story.href )
          ))
        })

        , more ? (
          _jsxruntime.jsx.call(void 0, 'div', { className: "flex justify-center" , children: 
            _jsxruntime.jsx.call(void 0, _beui.ButtonLink, { href: more.href, variant: "outline", size: "sm", children: 
              more.label
            })
          })
        ) : null
      ]})
    })
  )
} exports.default = Page;

}
};
var __links = {"components/Row.tsx":{},"page.tsx":{"./components/Row":"components/Row.tsx"}};
var __cache = {};
function __load(path) {
  if (__cache[path]) return __cache[path].exports;
  var m = { exports: {} };
  __cache[path] = m;
  var links = __links[path] || {};
  __files[path](function (id) {
    if (Object.hasOwn(links, id)) return __load(links[id]);
    if (Object.hasOwn(__inlined, id)) return __inlined[id];
    return require(id);
  }, m.exports, m);
  return m.exports;
}
module.exports = __load("page.tsx");
}, "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties;\n@layer theme, base, components, utilities;\n@layer theme {\n  :root, :host {\n    --spacing: 0.25rem;\n    --container-3xl: 48rem;\n    --text-sm: 0.875rem;\n    --text-sm--line-height: calc(1.25 / 0.875);\n    --text-2xl: 1.5rem;\n    --text-2xl--line-height: calc(2 / 1.5);\n    --font-weight-medium: 500;\n    --font-weight-bold: 700;\n    --tracking-tight: -0.025em;\n    --radius-2xl: 1rem;\n    --default-transition-duration: 150ms;\n    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    --default-font-family: \"Geist Variable\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial,\n    \"Noto Sans\", sans-serif;\n    --default-mono-font-family: \"Geist Mono Variable\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\",\n    monospace;\n  }\n}\n@layer utilities {\n  .mx-auto {\n    margin-inline: auto;\n  }\n  .-my-1 {\n    margin-block: calc(var(--spacing) * -1);\n  }\n  .mt-1 {\n    margin-top: var(--spacing);\n  }\n  .-ml-2 {\n    margin-left: calc(var(--spacing) * -2);\n  }\n  .flex {\n    display: flex;\n  }\n  .inline-flex {\n    display: inline-flex;\n  }\n  .min-h-screen {\n    min-height: 100vh;\n  }\n  .w-6 {\n    width: calc(var(--spacing) * 6);\n  }\n  .max-w-3xl {\n    max-width: var(--container-3xl);\n  }\n  .min-w-0 {\n    min-width: 0px;\n  }\n  .flex-1 {\n    flex: 1;\n  }\n  .shrink-0 {\n    flex-shrink: 0;\n  }\n  .flex-col {\n    flex-direction: column;\n  }\n  .flex-wrap {\n    flex-wrap: wrap;\n  }\n  .items-baseline {\n    align-items: baseline;\n  }\n  .items-center {\n    align-items: center;\n  }\n  .justify-center {\n    justify-content: center;\n  }\n  .gap-1 {\n    gap: var(--spacing);\n  }\n  .gap-1\\.5 {\n    gap: calc(var(--spacing) * 1.5);\n  }\n  .gap-3 {\n    gap: calc(var(--spacing) * 3);\n  }\n  .gap-4 {\n    gap: calc(var(--spacing) * 4);\n  }\n  .gap-8 {\n    gap: calc(var(--spacing) * 8);\n  }\n  .gap-x-2 {\n    column-gap: calc(var(--spacing) * 2);\n  }\n  .gap-x-3 {\n    column-gap: calc(var(--spacing) * 3);\n  }\n  .gap-y-1 {\n    row-gap: var(--spacing);\n  }\n  :where(.divide-y > :not(:last-child)) {\n    --tw-divide-y-reverse: 0;\n    border-bottom-style: var(--tw-border-style);\n    border-top-style: var(--tw-border-style);\n    border-top-width: calc(1px * var(--tw-divide-y-reverse));\n    border-bottom-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));\n  }\n  :where(.divide-border > :not(:last-child)) {\n    border-color: var(--border);\n  }\n  .overflow-hidden {\n    overflow: hidden;\n  }\n  .rounded-2xl {\n    border-radius: var(--radius-2xl);\n  }\n  .rounded-md {\n    border-radius: calc(var(--radius) - 2px);\n  }\n  .border {\n    border-style: var(--tw-border-style);\n    border-width: 1px;\n  }\n  .border-border {\n    border-color: var(--border);\n  }\n  .bg-background {\n    background-color: var(--background);\n  }\n  .bg-card {\n    background-color: var(--card);\n  }\n  .p-1 {\n    padding: var(--spacing);\n  }\n  .px-4 {\n    padding-inline: calc(var(--spacing) * 4);\n  }\n  .py-4 {\n    padding-block: calc(var(--spacing) * 4);\n  }\n  .py-6 {\n    padding-block: calc(var(--spacing) * 6);\n  }\n  .text-right {\n    text-align: right;\n  }\n  .font-mono {\n    font-family: \"Geist Mono Variable\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\",\n    monospace;\n  }\n  .font-sans {\n    font-family: \"Geist Variable\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial,\n    \"Noto Sans\", sans-serif;\n  }\n  .text-2xl {\n    font-size: var(--text-2xl);\n    line-height: var(--tw-leading, var(--text-2xl--line-height));\n  }\n  .text-sm {\n    font-size: var(--text-sm);\n    line-height: var(--tw-leading, var(--text-sm--line-height));\n  }\n  .text-\\[10px\\] {\n    font-size: 10px;\n  }\n  .text-\\[13px\\] {\n    font-size: 13px;\n  }\n  .leading-6 {\n    --tw-leading: calc(var(--spacing) * 6);\n    line-height: calc(var(--spacing) * 6);\n  }\n  .leading-7 {\n    --tw-leading: calc(var(--spacing) * 7);\n    line-height: calc(var(--spacing) * 7);\n  }\n  .font-bold {\n    --tw-font-weight: var(--font-weight-bold);\n    font-weight: var(--font-weight-bold);\n  }\n  .font-medium {\n    --tw-font-weight: var(--font-weight-medium);\n    font-weight: var(--font-weight-medium);\n  }\n  .tracking-\\[0\\.14em\\] {\n    --tw-tracking: 0.14em;\n    letter-spacing: 0.14em;\n  }\n  .tracking-tight {\n    --tw-tracking: var(--tracking-tight);\n    letter-spacing: var(--tracking-tight);\n  }\n  .text-\\[var\\(--accent\\)\\] {\n    color: var(--accent);\n  }\n  .text-card-foreground {\n    color: var(--card-foreground);\n  }\n  .text-foreground {\n    color: var(--foreground);\n  }\n  .text-muted-foreground {\n    color: var(--muted-foreground);\n  }\n  .uppercase {\n    text-transform: uppercase;\n  }\n  .tabular-nums {\n    --tw-numeric-spacing: tabular-nums;\n    font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);\n  }\n  .antialiased {\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n  }\n  .outline {\n    outline-style: var(--tw-outline-style);\n    outline-width: 1px;\n  }\n  .transition-colors {\n    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;\n    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));\n    transition-duration: var(--tw-duration, var(--default-transition-duration));\n  }\n  @media (hover: hover) {\n    .hover\\:bg-foreground\\/\\[0\\.04\\]:hover {\n      background-color: var(--foreground);\n    }\n    @supports (color: color-mix(in lab, red, red)) {\n      .hover\\:bg-foreground\\/\\[0\\.04\\]:hover {\n        background-color: color-mix(in oklab, var(--foreground) 4%, transparent);\n      }\n    }\n    .hover\\:bg-foreground\\/\\[0\\.06\\]:hover {\n      background-color: var(--foreground);\n    }\n    @supports (color: color-mix(in lab, red, red)) {\n      .hover\\:bg-foreground\\/\\[0\\.06\\]:hover {\n        background-color: color-mix(in oklab, var(--foreground) 6%, transparent);\n      }\n    }\n    .hover\\:text-foreground:hover {\n      color: var(--foreground);\n    }\n    .hover\\:underline:hover {\n      text-decoration-line: underline;\n    }\n  }\n  .focus-visible\\:ring-2:focus-visible {\n    --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);\n    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n  }\n  .focus-visible\\:ring-ring:focus-visible {\n    --tw-ring-color: var(--ring);\n  }\n  .focus-visible\\:outline-none:focus-visible {\n    --tw-outline-style: none;\n    outline-style: none;\n  }\n  @media (width >= 40rem) {\n    .sm\\:gap-4 {\n      gap: calc(var(--spacing) * 4);\n    }\n    .sm\\:px-6 {\n      padding-inline: calc(var(--spacing) * 6);\n    }\n    .sm\\:py-10 {\n      padding-block: calc(var(--spacing) * 10);\n    }\n  }\n}\n@layer base {\n  *, ::after, ::before, ::backdrop, ::file-selector-button {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n    border: 0 solid;\n  }\n  html, :host {\n    line-height: 1.5;\n    -webkit-text-size-adjust: 100%;\n    tab-size: 4;\n    font-family: var(--default-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji');\n    font-feature-settings: var(--default-font-feature-settings, normal);\n    font-variation-settings: var(--default-font-variation-settings, normal);\n    -webkit-tap-highlight-color: transparent;\n  }\n  hr {\n    height: 0;\n    color: inherit;\n    border-top-width: 1px;\n  }\n  abbr:where([title]) {\n    -webkit-text-decoration: underline dotted;\n    text-decoration: underline dotted;\n  }\n  h1, h2, h3, h4, h5, h6 {\n    font-size: inherit;\n    font-weight: inherit;\n  }\n  a {\n    color: inherit;\n    -webkit-text-decoration: inherit;\n    text-decoration: inherit;\n  }\n  b, strong {\n    font-weight: bolder;\n  }\n  code, kbd, samp, pre {\n    font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);\n    font-feature-settings: var(--default-mono-font-feature-settings, normal);\n    font-variation-settings: var(--default-mono-font-variation-settings, normal);\n    font-size: 1em;\n  }\n  small {\n    font-size: 80%;\n  }\n  sub, sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n  sub {\n    bottom: -0.25em;\n  }\n  sup {\n    top: -0.5em;\n  }\n  table {\n    text-indent: 0;\n    border-color: inherit;\n    border-collapse: collapse;\n  }\n  :-moz-focusring:where(:not(iframe)) {\n    outline: auto;\n  }\n  progress {\n    vertical-align: baseline;\n  }\n  summary {\n    display: list-item;\n  }\n  ol, ul, menu {\n    list-style: none;\n  }\n  img, svg, video, canvas, audio, iframe, embed, object {\n    display: block;\n    vertical-align: middle;\n  }\n  img, video {\n    max-width: 100%;\n    height: auto;\n  }\n  button, input, select, optgroup, textarea, ::file-selector-button {\n    font: inherit;\n    font-feature-settings: inherit;\n    font-variation-settings: inherit;\n    letter-spacing: inherit;\n    color: inherit;\n    border-radius: 0;\n    background-color: transparent;\n    opacity: 1;\n  }\n  :where(select:is([multiple], [size])) optgroup {\n    font-weight: bolder;\n  }\n  :where(select:is([multiple], [size])) optgroup option {\n    padding-inline-start: 20px;\n  }\n  ::file-selector-button {\n    margin-inline-end: 4px;\n  }\n  ::placeholder {\n    opacity: 1;\n  }\n  @supports (not (-webkit-appearance: -apple-pay-button))  or (contain-intrinsic-size: 1px) {\n    ::placeholder {\n      color: currentcolor;\n      @supports (color: color-mix(in lab, red, red)) {\n        color: color-mix(in oklab, currentcolor 50%, transparent);\n      }\n    }\n  }\n  textarea {\n    resize: vertical;\n  }\n  ::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n  ::-webkit-date-and-time-value {\n    min-height: 1lh;\n    text-align: inherit;\n  }\n  ::-webkit-datetime-edit {\n    display: inline-flex;\n  }\n  ::-webkit-datetime-edit-fields-wrapper {\n    padding: 0;\n  }\n  ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {\n    padding-block: 0;\n  }\n  ::-webkit-calendar-picker-indicator {\n    line-height: 1;\n  }\n  :-moz-ui-invalid {\n    box-shadow: none;\n  }\n  button, input:where([type='button'], [type='reset'], [type='submit']), ::file-selector-button {\n    appearance: button;\n  }\n  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {\n    height: auto;\n  }\n  [hidden]:where(:not([hidden='until-found'])) {\n    display: none !important;\n  }\n}\n@property --tw-divide-y-reverse {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-border-style {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: solid;\n}\n@property --tw-leading {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-font-weight {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-tracking {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-ordinal {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-slashed-zero {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-numeric-figure {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-numeric-spacing {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-numeric-fraction {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-outline-style {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: solid;\n}\n@property --tw-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-shadow-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-shadow-alpha {\n  syntax: \"<percentage>\";\n  inherits: false;\n  initial-value: 100%;\n}\n@property --tw-inset-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-shadow-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-inset-shadow-alpha {\n  syntax: \"<percentage>\";\n  inherits: false;\n  initial-value: 100%;\n}\n@property --tw-ring-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-ring-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-ring-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-inset-ring-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-ring-inset {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-ring-offset-width {\n  syntax: \"<length>\";\n  inherits: false;\n  initial-value: 0px;\n}\n@property --tw-ring-offset-color {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: #fff;\n}\n@property --tw-ring-offset-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@layer properties {\n  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {\n    *, ::before, ::after, ::backdrop {\n      --tw-divide-y-reverse: 0;\n      --tw-border-style: solid;\n      --tw-leading: initial;\n      --tw-font-weight: initial;\n      --tw-tracking: initial;\n      --tw-ordinal: initial;\n      --tw-slashed-zero: initial;\n      --tw-numeric-figure: initial;\n      --tw-numeric-spacing: initial;\n      --tw-numeric-fraction: initial;\n      --tw-outline-style: solid;\n      --tw-shadow: 0 0 #0000;\n      --tw-shadow-color: initial;\n      --tw-shadow-alpha: 100%;\n      --tw-inset-shadow: 0 0 #0000;\n      --tw-inset-shadow-color: initial;\n      --tw-inset-shadow-alpha: 100%;\n      --tw-ring-color: initial;\n      --tw-ring-shadow: 0 0 #0000;\n      --tw-inset-ring-color: initial;\n      --tw-inset-ring-shadow: 0 0 #0000;\n      --tw-ring-inset: initial;\n      --tw-ring-offset-width: 0px;\n      --tw-ring-offset-color: #fff;\n      --tw-ring-offset-shadow: 0 0 #0000;\n    }\n  }\n}\n", {"@hugeicons/core-free-icons":{"ArrowUp01Icon":[["path",{"d":"M17.9998 15C17.9998 15 13.5809 9.00001 11.9998 9C10.4187 8.99999 5.99985 15 5.99985 15","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"0"}]],"Comment01Icon":[["path",{"d":"M8 13.5H16M8 8.5H12","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"0"}],["path",{"d":"M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5","stroke":"currentColor","strokeLinecap":"round","strokeWidth":"1.5","key":"1"}]]}})