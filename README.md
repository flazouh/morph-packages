# Morph packages

Redesigns for [Morph](https://github.com/flazouh), one folder per package.

Morph's marketplace keeps no code. Its database holds a manifest, a version and a set of
sha256 digests, and it builds every file address from an owner, a repository, a commit and
a path on `raw.githubusercontent.com`. This repository is where those addresses point.

## Layout

A package lives at `<author>/<name>`, which is also its slug:

```
flazouh/gitquiet/
  manifest.json        what the package is, and every capability it asks for
  script.js            the built artifact the sandbox runs
  style.css            the package's stylesheet
  preview-before.png   the page without the package
  preview-after.png    the same page with it
  source/              the code the artifact was built from
```

The source travels with the build on purpose. A reader is asked to check the code before
installing it, and a digest they cannot read anything against proves nothing.

## Packages

| Package | Site | Pages | Runtime |
| --- | --- | --- | --- |
| `flazouh/gitquiet` | github.com | `/pulls`, `/pulls/inbox` | `sandbox-v1` |

## Capabilities

Every package declares what it needs, and Morph's firewall refuses the rest at the moment
a request is made rather than at install time. A `sandbox-v1` package runs in a frame with
an opaque origin, no network of its own, and no extension API, so each of these is a thing
Morph does on the package's behalf:

- `network` names an origin, the paths under it, the methods, and whether the reader's
  session travels with the request.
- `page.navigate` names the origins a reader may be sent to. `page.traverse` allows Back
  and Forward, which name no address at all.
- `assets` names the origins an image or a font may be read from. The frame's own policy
  allows no remote resource, so this is the only way one reaches a package.
- `storage` gives the package a store of its own, keyed under its slug.
- `context` says which of the reader, the colour mode and the route the package may see.

## Building a package

The artifacts here are built from the Morph repository:

```
bun run build
bun scripts/pack-gitquiet.ts ../morph-packages/flazouh/gitquiet
```
