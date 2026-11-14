# Overview

A platform publishes what a person is entitled to as JSON documents. A client reads
those documents and writes an agent's configuration files. The platform publishes
**data**; the client owns every **file edit**.

```
$ <client> connect https://platform.example
```

Sign-in happens in the person's own browser. Nothing is pasted, no credential is
written to a file, and running the command again is the entire update story: a
rotated credential, a project added, one left behind, or a model the platform has
started offering are all the same act.

## Status of this document

This is a **draft**. The well-known path, the schemas and the rel URI MAY change
before v1 is cut. No implementation is known to conform.

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT,
RECOMMENDED, MAY and OPTIONAL in this document are to be interpreted as described in
BCP 14 (RFC 2119, RFC 8174) when, and only when, they appear in all capitals.

## Scope

The protocol describes **agents**, not any one kind of agent. A coding agent is the
first binding written, because that is where the problem was first felt, but nothing
here is specific to writing software. Any harness that reads configuration from a
file or from its environment is a binding target: a research or strategy agent, a
chat harness, a personal assistant, an in-house runtime.

What is tool-specific lives in a **binding** (see `bindings/`), and a platform names
in its `tools` array which bindings it publishes for.

## The three legs

| Leg | Owned by | Document |
|---|---|---|
| **Discovery** — does this host speak the protocol, and where | platform | `01-discovery-and-auth` |
| **Profiles** — what configurations is this person entitled to | platform | `02-profiles` |
| **Binding** — how a profile becomes files on disk | client | `bindings/` |

The split is the point. A platform implements two JSON endpoints and inherits every
tool a client supports. A client implements one tool's file format and inherits every
platform.

## Roles

Three roles, so that a reader can tell which requirements bind them. A role is
defined by its obligations and never by who implements it.

| Role | Conforms by |
|---|---|
| **Platform** | Serving the service document at the well-known path, and listing what the person may switch between. |
| **Switcher** | Reading those documents, owning every file edit, showing which profile is in force, and never restarting a tool unasked. |
| **Tool** | Nothing. The tool is the target being configured, not an implementer. |

A **Switcher** is any client that presents a choice to a person. A client with no
user interface carries the same obligations minus the display ones.

## Why more than one profile

A person is on several platforms at once, and in several contexts within each: a
production platform, the same platform running locally, and a second organisation
with a different issuer and one profile per customer.

Switching between them MUST NOT require a new sign-in or a network round trip, so a
client registers each platform it has connected to and keeps them side by side. This
creates a collision the protocol names rather than wishes away: two platforms MAY
both publish a profile whose id is `default`, so a client MUST namespace every
profile by its `source.id` rather than trusting the id alone.

## Non-goals

- **No remote control.** A profile is a description the client MAY apply, reject or
  partly ignore. A platform MUST NOT name a path on the person's disk and MUST NOT
  ship a command to run. This is the line that lets the protocol be pointed at a host
  the person does not administer.
- **No secret in a document.** A profiles document carries variable *names*. A value
  is fetched per run from its own endpoint and lands only in an environment variable.
- **No tool inventory.** The protocol describes model providers, catalogues, servers
  and marketplaces. It does not describe skills, hooks or agent definitions; those
  have owners already.
