# Changelog

This document set is a draft, so changes are listed rather than versioned. The wire
`v` stays `1` until a change would break a client that reads the fields it knows and
ignores the rest; the rel URI's version segment changes only on a breaking change to
the document set.

## Unreleased

- **Repository hint** (new, `03-repo-hint.md`): a `.agent-setup.json` a repository may
  carry naming which platform configures work on that code, so a person already standing
  in a checkout does not have to be told. Specified as a pointer and never an authority:
  a client must not accept profile content from it, and must show the origin and get
  confirmation before authorizing against an origin the repository has not already been
  connected to, because the file is writable by anyone who can land a pull request.
  Also records that scanning every repository to find the file is the wrong way to list
  them, and that a client whose only entry point is such a scan cannot reach a project
  that has no code yet.
- **Profiles**: optional `repository`, an https git URL for the code a profile is about.
  A remote, never a local path; whether to obtain it and where it lands stays the
  client's decision.

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
