# Contributing

## Changing the specification

The site is generated from this repository, so a merged change to `spec/`,
`bindings/` or `registry/` is the whole publishing step. There is no separate
content system and no copy of the text anywhere else.

The specification is a draft. Changes that alter what an implementation must do are
welcome while it is one. Open an issue first for those; open a pull request directly
for a correction, an ambiguity, a missing example, or anything that is simply wrong.

Two rules the text has to keep:

- **Normative language is RFC 2119**, in capitals, and only where a requirement is
  genuinely meant. Prose that explains *why* a requirement exists is the point of
  this document and should survive every edit.
- **Examples use neutral hosts** (`platform.example`, `example.com`) and no real
  person's name. Ports, paths and identifiers that belong to one implementation are
  not normative and must not be written as though they were.

## Adding a binding

A binding says how a profile becomes configuration for one named tool: which files,
which keys, which of them the client owns, and how the active profile is shown. It
is non-normative with respect to the protocol and versioned separately, because
tools change on their own schedule.

A binding MUST NOT require the platform to publish anything the specification says a
platform may not publish. If a tool can only be configured by running something, say
so plainly in the binding rather than working around the rule.

## Getting a platform listed

Copy `registry/_template.json` to `registry/<your-id>.json`, fill in the four
required fields, and open a pull request. `tools/validate-registry.mjs` runs on every
pull request and installs nothing.

An author asserts only what cannot be checked: the id, the origin, the roles claimed,
how reachable the deployment is, and a contact. Everything that can be checked is
read from the platform's own documents, so an entry cannot assert its own conformance.

`reachability` is declared, not judged. A platform on a private network, or one a
customer buys and runs themselves, is listed on the same terms as a public one;
reachability is a property of a deployment and never of conformance. It only
determines how much the continuous check can establish, and the site says which is
which rather than presenting them as equal.

A well-formed, honestly labelled entry is merged whether or not the maintainers have
heard of the platform. There is no ranking, no tier, and being listed is not an
endorsement.

## Licence

By contributing you agree that your contribution is licensed under CC-BY-4.0 for
specification prose and Apache-2.0 for code, matching `LICENSE-DOCS` and `LICENSE`.
