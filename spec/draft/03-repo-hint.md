# 3. The repository hint

A person is often already standing in a checkout when they want an agent configured.
This document defines a file a repository MAY carry so that a client can answer "which
platform configures work on this code" without being told.

The key words MUST, MUST NOT, SHOULD and MAY are to be interpreted as described in
BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119),
[RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)).

## 1. Two directions, one document

Discovery runs in two directions, and they are not alternatives:

| Direction | Starting point | How it resolves |
|---|---|---|
| **repo → platform** | a checkout on disk | this hint names the platform, and the client resolves [discovery](discovery-and-auth) against it |
| **platform → repo** | a profile on a platform | the profile MAY name its `repository`, and the client decides whether to obtain it |

Both end at the same profiles document. A client MAY offer either entry point, both, or
neither; neither is required for conformance, because a person who types an origin is
served by the protocol exactly as well.

The second direction is the one that covers a project with no code yet. A platform
that holds a new project has nothing to put a hint in, so a client whose only entry
point is "scan repositories for a file" cannot reach it. That is a property of the
client, not of this specification.

## 2. The file

A repository MAY carry `.agent-setup.json` in its root:

```json
{
  "v": 1,
  "platform": "https://platform.example",
  "profile": "acme",
  "tools": ["codex"]
}
```

| Field | Requirement | Meaning |
|---|---|---|
| `v` | MUST | `1`. |
| `platform` | MUST | An `https` origin with no path, resolved exactly as a typed origin is. |
| `profile` | MAY | The `id` of the profile to prefer. A hint, and still namespaced by `source.id`. |
| `tools` | MAY | Tools this repository is set up for, to skip a pointless sign-in. |

A client MUST ignore a field it does not know, and MUST reject a document whose `v` it
does not know rather than guess at the rest.

## 3. What the hint is not

**It is not an authority.** The file is writable by anyone who can land a change in the
repository, and readable by anyone who can read the repository. Everything below follows
from that one fact.

- A client MUST NOT accept profile content from this file. Not a provider, not an MCP
  server, not a model, not a marketplace. The hint names a platform; the platform names
  the configuration, to an authenticated subject, over the wire.
- A client MUST display the origin, and MUST obtain confirmation from the person, before
  beginning an authorization flow against an origin this repository has not already been
  connected to. Without that rule a pull request is a phishing primitive: the reader
  clicks *set up*, a browser opens on an issuer the attacker chose, and the credential
  they type is beyond anyone's protection.
- Once a repository has been connected to an origin, a client MUST surface a later
  change of `platform` as a change rather than following it silently.
- A client MUST NOT treat the hint as granting an entitlement. Whether this person may
  configure anything at all is still the platform's answer, and it is a different answer
  for a different person holding the same checkout.
- The three prohibitions from [profiles](profiles) §3 apply unchanged: no credential
  value, no filesystem path, no command to run.

## 4. Finding repositories that carry one

A client MAY offer to list the repositories a person can reach that carry this file. Two
ways exist and only one of them scales:

- **Code search**, scoped to the accounts the person has granted, for the path. It is
  authenticated, rate-limited and eventually consistent, so a client SHOULD cache the
  result and SHOULD NOT treat a miss as proof of absence.
- **Reading every repository** in order to look for the file. A client SHOULD NOT do
  this. The cost is paid per repository rather than per result, it grows with the
  account rather than with the answer, and it is slowest exactly for the people who
  have most to gain.

Neither is part of conformance. A client with no listing at all is conforming.
