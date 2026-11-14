# Agent Setup Protocol

A platform publishes what a person is entitled to as JSON documents. A client reads
them and writes the agent's configuration files. The platform publishes **data**; the
client owns every **file edit**.

Status: **draft**. No implementation is conforming yet. The well-known path, the
schemas and the rel URI may still change before v1 is cut.

| Directory | What is in it |
|---|---|
| `spec/draft/` | The normative specification. |
| `bindings/` | Non-normative, per-tool: how a profile becomes configuration for one agent. |
| `schema/draft/` | JSON Schema for each document, plus validated examples. |
| `registry/` | One file per platform that claims conformance. Joined by pull request. |
| `site/` | The Next.js application that renders this repository as agentsetupprotocol.com. |

The site is generated from this repository. A merged change to `spec/`, `bindings/` or
`registry/` rebuilds and redeploys it.

## Licence

Apache-2.0 for the schemas, the conformance tooling, the workflows and the site.
CC-BY-4.0 for the specification prose and the guides. See `LICENSE` and `LICENSE-DOCS`.
