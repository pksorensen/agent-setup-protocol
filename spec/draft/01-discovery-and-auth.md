# Discovery and authorization

Two questions have to be answered before anything is configured: does this host speak
the protocol, and how does a person prove who they are to it. This document specifies
both. The key words are to be interpreted as described in BCP 14.

## 1. The service document

A platform MUST serve a **service document** at

```
GET {origin}/.well-known/agent-setup
```

The response MUST be `application/json` and MUST be retrievable **without
credentials**. Discovery that requires a session cannot be used to find out how to
obtain a session, and a client has to be able to tell "this host does not speak the
protocol" apart from "you are not signed in" before it opens a browser window.

A platform MAY additionally advertise the document from an existing well-known index
of its own, keyed by the rel URI below. The well-known path is the interoperable
form; an index entry is a convenience for platforms that already have one.

### Fields

| Field | | Meaning |
|---|---|---|
| `v` | MUST | Integer document version. `1` for this specification. |
| `platform.name` | MUST | Human-readable name, shown to the person before they sign in. |
| `platform.documentation` | SHOULD | A page a person can read to find out what this platform is. |
| `profiles` | MUST | Absolute URL of the profiles document. |
| `authorization` | MUST | Absolute URL of the protected-resource metadata (§3). |
| `tools` | SHOULD | Bindings this platform publishes profiles for, by binding id. |
| `loopback_redirect_uris` | SHOULD | Redirect URIs registered for loopback clients (§4). |
| `publishes_provider` | MAY | `true` if profiles may carry a `provider` block. |

A platform MUST NOT require the `profiles` URL to live on the same origin as the
service document; a client MUST treat it as opaque and follow it as given.

### Example

```json
{
  "v": 1,
  "platform": {
    "name": "Example Platform",
    "documentation": "https://platform.example/docs"
  },
  "tools": ["codex"],
  "profiles": "https://platform.example/asp/v1/profiles",
  "authorization": "https://platform.example/.well-known/oauth-protected-resource",
  "loopback_redirect_uris": ["http://localhost:51789"],
  "publishes_provider": true
}
```

## 2. The rel URI

The protocol is identified by the URI

```
https://agentsetupprotocol.com/rel/agent-setup/v1
```

This string is an **identifier, not an address**. A client MUST compare it
byte-for-byte and MUST NOT dereference it to decide whether a platform conforms. A
self-hosted platform on a private network still keys its entry with exactly this
value; a platform that mints its own variant is not interoperable, because a client
matching on the string will not recognise it.

The version segment changes only on a breaking change to the document set. See the
versioning policy.

## 3. Authorization

The `authorization` URL MUST point at protected-resource metadata as defined by
RFC 9728. From there a client follows the authorization-server metadata (RFC 8414)
to the endpoints it needs. The protocol defines no endpoints of its own and no
token format: it points at the platform's existing identity provider and gets out of
the way.

A client MUST use the authorization code flow with PKCE (S256). A client MUST NOT
ask a person to paste a token, and a platform MUST NOT offer pasting as its primary
path.

A client that cannot open a browser on the machine it runs on SHOULD fall back to
the device authorization grant (RFC 8628) where the platform offers it.

### Tokens

A platform MUST validate the audience of any token it accepts for the profiles
document. A token minted for a different resource of the same issuer MUST be
rejected. This is stated because the failure is silent: without an audience check,
any token from the same issuer reads any person's profiles, and nothing in an access
log distinguishes that from ordinary use.

Where a platform asks a client to request a particular resource indicator (RFC 8707),
that value MUST be an absolute URI, and a client SHOULD omit the parameter rather than
forward a value that cannot be one. A bare name is not a resource indicator, and
publishing one is not a cosmetic error: an authorization server that validates the
parameter answers `invalid_target` and redirects to the client's loopback, so the
person's browser never reaches a login page at all and the client is left holding a
dead callback instead of a message saying what was wrong.

A client MUST NOT write an access token into a configuration file. Where a token or
key must reach a tool, it travels in an environment variable, and the configuration
file names the variable rather than carrying its value.

## 4. Loopback redirect URIs

A platform SHOULD publish `loopback_redirect_uris` listing the redirect URIs it has
registered for loopback clients, each with an explicit host and port.

The reason is a failure with no useful diagnosis. `http://localhost:{port}` and
`http://127.0.0.1:{port}` are different strings to an authorization server even
though they resolve to the same socket. A client that guesses the wrong one is
refused at the redirect with a generic error, after the person has already signed in
and consented, and nothing in the message says which half was wrong.

A client MUST use a URI from this list when one is published. When none is
published, a client MUST NOT assume a particular host, port or range; it SHOULD try
a registered-client flow or report that the platform has not published enough to
connect. Any port a particular implementation happens to use is a property of that
implementation and is NOT part of this specification.

## 5. Wire format

Every field name in every document defined by this specification is `snake_case`. A
platform serving `camelCase` is **not conforming**.

A client SHOULD nevertheless accept `camelCase` as an alias on read, and SHOULD warn
rather than fail. The rule exists so that platforms converge; being strict on read
would only move the breakage onto the person.

## 6. Forward compatibility

| Condition | Required behaviour |
|---|---|
| An unknown field | The client MUST ignore it. It MUST NOT fail a run because of one. |
| `v` greater than the client knows | The client SHOULD read the fields it recognises, warn, and continue. |
| `v` lower than the client knows | The client MUST read it as that older version. |
| A missing MUST field | The client MUST report the document as malformed and MUST NOT guess a value. |
| A `tools` entry the client has no binding for | The client MUST ignore that entry, not the document. |

These rules bind in one direction only: a platform that publishes a field no client
reads yet loses nothing, which is what makes the document set extensible without a
coordinated release.
