# Changelog

This document set is a draft, so changes are listed rather than versioned. The wire
`v` stays `1` until a change would break a client that reads the fields it knows and
ignores the rest; the rel URI's version segment changes only on a breaking change to
the document set.

## Unreleased

- **Profiles**: named four fields that were already in use and would otherwise have
  been invented twice — `subject` (who the platform resolved the token to),
  `description` on a profile, `marketplaces`, and `model` as an object with
  `default` and `allow` rather than a bare string. All optional; a client that
  ignores them is still conforming. Added the rule that `model.allow` is advisory
  and never a security boundary, and that a platform must not publish a marketplace
  whose manifest it cannot serve.

## Initial draft

- Overview, discovery and authorization, profiles.
- Registry entry schema and a dependency-free validator.
