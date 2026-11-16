# Profiles

A profile is one configuration a person is entitled to: one project, one customer,
one tenant, one environment. The profiles document lists the ones this person may
switch between. The platform decides what a profile means; the protocol only says
how it is described.

## 1. The request

A client fetches the `profiles` URL from the service document with the access token
it obtained. The response MUST be `application/json`.

The document MUST reflect the authenticated person. A platform MUST NOT return
profiles the person is not entitled to, and MUST NOT accept a person identifier as a
parameter in place of the token.

## 2. Shape

```json
{
  "v": 1,
  "source": {
    "id": "example",
    "display_name": "Example Platform",
    "origin": "https://platform.example"
  },
  "subject": {
    "handle": "a-handle",
    "display_name": "The signed-in person"
  },
  "default": "acme",
  "profiles": [
    {
      "id": "acme",
      "display_name": "Acme (production)",
      "description": "Acme's production workspace on this platform.",
      "group": "Acme",
      "provider": {
        "base_url": "https://gw.platform.example/openai/v1",
        "wire_api": "responses",
        "auth": { "env_var": "ACME_API_KEY" }
      },
      "model": {
        "default": "a-model-the-platform-offers",
        "allow": ["a-model-the-platform-offers", "another-one"]
      },
      "mcp_servers": [
        {
          "name": "acme",
          "url": "https://platform.example/acme/mcp",
          "auth": { "env_var": "ACME_MCP_TOKEN" }
        }
      ],
      "marketplaces": [
        { "name": "acme-plugins", "url": "https://platform.example/acme/marketplace.json" }
      ],
      "instructions": "This profile is the Acme account. Its tools are available as the \"acme\" MCP server; use them rather than inferring the account from the working folder.",
      "repository": "https://github.example/acme/acme.git",
      "credential": "https://platform.example/asp/v1/acme/credential"
    },
    {
      "id": "sandbox",
      "display_name": "Acme (sandbox)",
      "group": "Acme",
      "mcp_servers": [
        { "name": "acme", "url": "https://sandbox.platform.example/mcp" }
      ]
    }
  ]
}
```

The second profile carries no `provider`. A profile that only changes which servers
are in force, leaving the model route alone, is a complete and conforming profile.

**An absent `provider` is an instruction, not an omission.** Where a profile carries
no `provider` block, a client MUST leave the reader's own model configuration exactly
as it found it: the account they are signed in to, the model they chose, the endpoint
their agent already talks to. It MUST NOT substitute a default of its own, and it MUST
NOT ask the platform for one. This is the common case, and it is what makes a platform
safe to connect to: a platform that configures context has no business touching the
reader's relationship with a model vendor, and most platforms have no model endpoint to
offer in the first place. A platform that does run one says so on the service document
with `publishes_provider`, and then says where on the profile.

The two cases are deliberately not symmetric. A platform that publishes no provider
needs the reader to bring their own; a platform that publishes one is usually doing it
because the reader's calls must go through something the platform owns, for a quota, a
contract or a record. Neither is the default for the other, so a client reads it from
the document rather than inferring it from the platform's kind.

### Document fields

| Field | | Meaning |
|---|---|---|
| `v` | MUST | Integer document version. |
| `source.id` | MUST | Short stable identifier for this platform, unique within the platform's own naming only. |
| `source.display_name` | MUST | What a client shows when it names the platform. |
| `source.origin` | MUST | The origin the client connected to. |
| `subject` | SHOULD | Who the platform resolved the token to (below). |
| `subject.handle` | MUST, if `subject` | The person's identifier on this platform, or `null` where it has none. |
| `subject.display_name` | MAY | A name to show. |
| `default` | SHOULD | The `id` of the profile to offer first. |
| `profiles` | MUST | Array, possibly empty. |

An empty `profiles` array is a valid document and MUST NOT be read as an error. It
means the person is known to the platform and currently entitled to nothing, which
is different from being unauthenticated and MUST be reported differently.

### Profile fields

| Field | | Meaning |
|---|---|---|
| `id` | MUST | Stable within `source`. Not assumed unique across platforms (§4). |
| `display_name` | MUST | What the person sees in a list. |
| `description` | MAY | One sentence a client MAY show beside the name. |
| `group` | MAY | A label for grouping related profiles in a list. |
| `provider.base_url` | MUST, if `provider` | Absolute URL of the model endpoint. |
| `provider.wire_api` | MUST, if `provider` | The request shape the endpoint speaks. |
| `provider.auth.env_var` | SHOULD, if `provider` | The **name** of the variable the credential is placed in. |
| `provider.auth.header` | MAY | The header to send the value in, instead of as a bearer token. |
| `model.default` | MAY | A model the platform suggests for this profile. |
| `model.allow` | MAY | Models the platform offers. Advisory, and never a security boundary: the platform enforces its own policy at the endpoint, because a client is free to ignore this and an attacker certainly will. |
| `mcp_servers[].name` | MUST, if present | Name the server is registered under. |
| `mcp_servers[].url` | MUST, if present | Absolute URL of the server. |
| `mcp_servers[].auth.env_var` | MAY | The **name** of the variable carrying the server's credential. |
| `mcp_servers[].auth.header` | MAY | As `provider.auth.header`, for this server. |
| `instructions` | MAY | Text the platform wants the agent itself to know about this profile (§3.1). Descriptive only, never a command, and additive to whatever the client says on its own. |
| `repository` | MAY | An `https` git URL for the code this profile is about. A remote, never a local path: whether to obtain it, and where it lands, is the client's decision alone. |
| `marketplaces[].name` | MUST, if present | Name the marketplace is registered under. |
| `marketplaces[].url` | MUST, if present | Absolute URL of the marketplace manifest. |
| `credential` | MAY | Absolute URL the client fetches a credential value from, per run. |
| `expires_at` | MAY | RFC 3339 instant after which the client SHOULD re-fetch the document. |

### Subject

`subject` exists so that a client can say *whose* profiles these are without
decoding the access token, which it has no business parsing. A client SHOULD show
it when it names the platform, because a person holding profiles from several
platforms needs to see which account each list came from.

`handle` MAY be `null`: a platform that has no notion of a handle is conforming, and
a client MUST render that case rather than treating it as a malformed document.

### Marketplaces

A `marketplaces` entry is loaded eagerly by some tools, and one whose manifest does
not resolve can be a hard error that disables every marketplace command rather than
just its own. A platform therefore MUST NOT publish a marketplace it cannot serve a
manifest for, and SHOULD omit the field rather than publish a placeholder.

## 3. What a profile may never contain

These are the constraints that make the document safe to serve, to log and to show,
and that let a person point a client at a host they do not administer.

| | Rule |
|---|---|
| MUST NOT | **A credential value.** A document carries variable *names*. A value is fetched per run from `credential` and placed only in an environment variable. |
| MUST NOT | **A path on the person's filesystem.** The platform does not know the machine, the operating system or the home directory, and MUST NOT guess at any of them. |
| MUST NOT | **A command, script, or anything intended to be executed.** This includes text in `instructions` phrased as one (§3.1). |

A profile is a **description**. A client MAY apply it, reject it, or apply part of
it. Nothing in this document gives a platform a way to cause code to run on a
person's machine, and that is deliberate: it is what makes connecting to an unknown
platform a bounded act rather than an act of trust.

A client MUST reject a document that violates these rules rather than apply the rest
of it, and SHOULD say which rule was broken.

### 3.1 `instructions`, and why it is the one field that reaches the model

Every other field in a profile configures a tool. `instructions` is different: it is
text the client places in the agent's own instructions, so a platform writes directly
into the model's context.

It exists because of a failure that is specific to running several profiles at once.
A person had two sessions open, one per customer, asked each which project it was
working on, and got the same answer from both — a local folder path that belonged to
neither. The launcher knew which profile each session was; the agent did not, and
could not say. On a platform whose profiles are customers, an agent that cannot name
its own profile cannot help anyone catch the mistake that matters, which is work done
correctly and billed to the wrong one.

So the platform fills the half only it knows: which customer, which project, which
of its own tools are already in the session.

The rules that keep it bounded:

| | Rule |
|---|---|
| MUST | A client states which profile a session is in **itself**, from `display_name` and `source`, whether or not `instructions` is present. |
| MUST NOT | A client MUST NOT let `instructions` replace that statement, or any instruction of the client's own. It is additive. |
| MUST NOT | It is not a channel for anything the rules above forbid. A credential value, a filesystem path, or a command is a violation however it is phrased — including as a sentence addressed to the agent. |
| SHOULD | A client SHOULD bound its length and SHOULD drop control characters, rather than pass arbitrary text into a prompt unchecked. |
| SHOULD | A client SHOULD make the text inspectable, in a file the person can read or a view that shows it. |

**This is not a new trust boundary, and the reason matters.** A person who connects to
a platform already accepts its MCP servers in their session and, where it publishes
one, its model endpoint. A platform that wanted to steer the agent has stronger means
than a paragraph. What `instructions` must not become is a way to get *past* the three
MUST NOTs above by wording them as a request, which is why the rule is written as text
rather than left to a client's judgment.

A client MAY ignore the field entirely. A platform MUST NOT depend on it being applied.

## 4. Several platforms at once

A person is on more than one platform, so a client keeps every platform it has
connected to side by side and switches between them without a new sign-in.

Two platforms MAY each publish a profile with `id` `default`, or `prod`, or any
other obvious name. A client MUST therefore key every stored profile by the pair
(`source.id`, `id`) and MUST NOT treat `id` alone as unique. A client that presents
profiles to a person SHOULD show which platform each belongs to.

`source.id` is chosen by the platform and is not globally coordinated, so a client
MUST also be able to distinguish two platforms claiming the same `source.id`,
normally by `source.origin`.

## 5. Credentials

Where a profile carries `credential`, the client fetches that URL with the person's
access token at the moment it needs the value. The response MUST carry the value and
MAY carry an expiry.

The value MUST be placed in the environment variable named by the corresponding
`env_var` and MUST NOT be written into any configuration file. A client SHOULD
obtain a fresh value per run rather than caching one, because that makes rotation on
the platform's side take effect without the person doing anything.

A client MUST NOT echo a credential value into logs, terminal output, error
messages, or crash reports.

### 5.1 Where the credential is sent

A credential is sent as a bearer token unless the profile says otherwise. Where
`auth.header` is present, the client MUST send the value in a request header of that
name, with no scheme prefix, and MUST NOT also send it as a bearer token.

This exists because a gateway can be unable to read a bearer token. An API gateway
that authenticates by matching a subscription key in its own header cannot match that
key behind a `Bearer ` prefix, so a client that assumes bearer gets a 401 from a
platform that handed it a perfectly good credential — and a 401 reads as a
permissions problem, which sends whoever is debugging it to the wrong place entirely.
A platform in that position has no way to say so with `env_var` alone.

`auth.header` names where the value goes. It does not carry the value, and the rule in
§5 is unchanged: only the variable's name appears in a document or a configuration
file.

## 6. Refresh

Running the connect command again is the whole update story: a rotated credential, a
project added, one taken away, or a model the platform has started offering are the
same act. A client SHOULD re-fetch the profiles document when `expires_at` has
passed, and MUST re-fetch it when the person asks.

A profile that has disappeared from the document SHOULD be removed from the client's
list rather than left behind, and a client MUST NOT keep applying a profile the
platform has stopped publishing.
