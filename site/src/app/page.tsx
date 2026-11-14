import { listSpecDocs } from '@/lib/content';

const SERVICE_DOC = `{
  "v": 1,
  "platform": {
    "name": "Example Platform",
    "documentation": "https://platform.example/docs"
  },
  "tools": ["codex", "claude-code"],
  "profiles": "https://platform.example/asp/v1/profiles",
  "authorization":
    "https://platform.example/.well-known/oauth-protected-resource",
  "loopback_redirect_uris": ["http://localhost:51789"],
  "publishes_provider": true
}`;

const PROFILE_DOC = `{
  "v": 1,
  "source": {
    "id": "example",
    "display_name": "Example Platform",
    "origin": "https://platform.example"
  },
  "default": "acme",
  "profiles": [{
    "id": "acme",
    "display_name": "Acme (production)",
    "group": "Acme",
    "provider": {
      "base_url": "https://gw.platform.example/openai/v1",
      "wire_api": "responses",
      "auth": { "env_var": "ACME_API_KEY" }
    },
    "mcp_servers": [
      { "name": "acme", "url": "https://platform.example/acme/mcp" }
    ],
    "credential": "https://platform.example/asp/v1/acme/credential"
  }]
}`;

export default async function Home() {
    const docs = await listSpecDocs();

    return (
        <div className="cols">
            <nav>
                <span className="nt">Contents</span>
                <a href="#top">Overview</a>
                <a href="#problem">What it solves</a>
                <a href="#flow">The flow</a>
                <a href="#documents">The documents</a>
                <a href="#bindings">Bindings</a>
                <a href="#roles">Roles</a>
                <a href="#rules">Normative rules</a>
                <a href="/registry">Registry</a>
                <span className="nt" style={{ marginTop: '1.2rem' }}>Specification</span>
                {docs.map((d) => (
                    <a key={d.slug} href={`/spec/${d.slug}`}>
                        {d.title}
                    </a>
                ))}
            </nav>

            <main>
                <section id="top" className="stack">
                    <div className="status">
                        <span className="dot" />
                        Draft &middot; v1 &middot; no conforming implementation yet
                    </div>
                    <h1>Agent Setup Protocol</h1>
                    <p className="lede">
                        A platform publishes what a person is entitled to as two JSON documents. A
                        client reads them and writes the agent&rsquo;s configuration files. The
                        platform publishes data; the client owns every file edit.
                    </p>
                    <div className="cmd">
                        <span className="p">$</span> &lt;client&gt; connect https://platform.example
                    </div>
                    <p className="small muted">
                        Running it again is the whole update story: a rotated credential, a project
                        added, one left behind, a model the platform has started offering.
                    </p>
                </section>

                <section id="problem" className="stack">
                    <span className="eyebrow">What it solves</span>
                    <h2>Configuring an agent is a text-editing job, and it should not be.</h2>
                    <p>
                        Pointing an agent at a different project, a different customer or a different
                        model means finding a JSON or TOML file, pasting a key into it, and knowing
                        what a base URL and a wire protocol are. That is a reasonable thing to ask of
                        an engineer and an unreasonable thing to ask of everyone else now running
                        agents.
                    </p>
                    <p>
                        People who hold several of these switch by hand, and nothing in the tool says
                        afterwards which one is in force. A platform that wants to fix it today ships
                        an installer for one tool and one of itself, so the knowledge ends up in a
                        script instead of in a document, and the next platform starts over.
                    </p>
                    <p>This specification is the document that script should have been.</p>
                </section>

                <section id="flow" className="stack">
                    <span className="eyebrow">The flow</span>
                    <h2>Four steps, and only the last one touches the disk.</h2>
                    <div>
                        <div className="step">
                            <span className="n">01</span>
                            <div className="stack gap-s">
                                <h3>Discover</h3>
                                <p className="small">
                                    <code>GET {'{origin}'}/.well-known/agent-setup</code> returns the
                                    service document. One unauthenticated request. Discovery that
                                    requires a session cannot be used to find out how to get a session.
                                </p>
                            </div>
                        </div>
                        <div className="step">
                            <span className="n">02</span>
                            <div className="stack gap-s">
                                <h3>Sign in</h3>
                                <p className="small">
                                    The service document points at the resource&rsquo;s RFC&nbsp;9728
                                    metadata. The client runs loopback and PKCE in the person&rsquo;s
                                    own browser. The platform declares which loopback hosts it
                                    registered, because guessing <code>127.0.0.1</code> against an
                                    issuer expecting <code>localhost</code> fails with no useful error.
                                </p>
                            </div>
                        </div>
                        <div className="step">
                            <span className="n">03</span>
                            <div className="stack gap-s">
                                <h3>List profiles</h3>
                                <p className="small">
                                    An authenticated request returns what this person may switch
                                    between: one per project, per tenant, per customer. The platform
                                    decides what a profile means.
                                </p>
                            </div>
                        </div>
                        <div className="step">
                            <span className="n">04</span>
                            <div className="stack gap-s">
                                <h3>Bind</h3>
                                <p className="small">
                                    The client turns the chosen profile into configuration for one
                                    named tool, following that tool&rsquo;s binding. It edits; it never
                                    rebuilds a file it does not own.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="documents" className="stack">
                    <span className="eyebrow">The documents</span>
                    <h2>Two of them, and the first is public.</h2>
                    <div className="two">
                        <div>
                            <h3>Service document</h3>
                            <p className="small muted">
                                Unauthenticated, at <code>/.well-known/agent-setup</code>. Expected to
                                be fetched by strangers, logged and cached.
                            </p>
                            <pre>
                                <code>{SERVICE_DOC}</code>
                            </pre>
                            <p className="small">
                                <a href="/spec/discovery-and-auth">Full field reference &rarr;</a>
                            </p>
                        </div>
                        <div>
                            <h3>Profiles document</h3>
                            <p className="small muted">
                                Authenticated. One entry per thing the person may switch between.
                            </p>
                            <pre>
                                <code>{PROFILE_DOC}</code>
                            </pre>
                            <p className="small">
                                <a href="/spec/profiles">Full field reference &rarr;</a>
                            </p>
                        </div>
                    </div>
                    <p className="small muted">
                        Every field name is <code>snake_case</code>. A platform serving{' '}
                        <code>camelCase</code> is not conforming, though a client is wise to tolerate
                        it.
                    </p>
                </section>

                <section id="bindings" className="stack">
                    <span className="eyebrow">Bindings</span>
                    <h2>The protocol describes agents; a binding describes one tool.</h2>
                    <p>
                        A profile is tool-independent. It says there is a model endpoint of a given
                        wire shape, a set of servers, a credential to fetch. What that becomes on disk
                        is specific to the thing being configured, so each tool gets its own binding,
                        and a platform names in <code>tools</code> which ones it publishes for.
                    </p>
                    <p>
                        Nothing restricts this to coding agents. Any harness that reads configuration
                        from a file or an environment is a binding target: a research or strategy
                        agent, a chat harness, a personal assistant, an in-house runtime.
                    </p>
                    <div className="grid3">
                        <div className="box">
                            <span className="k">codex</span>
                            <p className="small">
                                First binding. Layered TOML, provider and wire API, servers, the config
                                file edited rather than rebuilt.
                            </p>
                        </div>
                        <div className="box">
                            <span className="k">claude-code</span>
                            <p className="small">Planned. Settings and server registration.</p>
                        </div>
                        <div className="box">
                            <span className="k">your tool</span>
                            <p className="small">
                                A binding is one document: which files, which keys, which of them the
                                client owns, and how the active profile is made visible.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="roles" className="stack">
                    <span className="eyebrow">Conformance</span>
                    <h2>Three roles, so an implementer can tell which half is theirs.</h2>
                    <div className="tbl">
                        <table>
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Conforms by</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="f">Platform</td>
                                    <td>
                                        Serving the service document at the well-known path, and listing
                                        what the person may switch between.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="f">Switcher</td>
                                    <td>
                                        Reading those documents, owning every file edit, showing which
                                        profile is in force, and never restarting a tool unasked.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="f">Tool</td>
                                    <td>
                                        Nothing. The tool is the target being configured, not an
                                        implementer.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="small muted">
                        A role is defined by its obligations, never by who implements it.
                    </p>
                </section>

                <section id="rules" className="stack">
                    <span className="eyebrow">Normative rules</span>
                    <h2>What a platform may never put in a document.</h2>
                    <ul>
                        <li>
                            <span className="kw">MUST NOT</span> &nbsp;<strong>a credential value.</strong>{' '}
                            Documents carry variable names. They are expected to be logged, cached and
                            shown.
                        </li>
                        <li>
                            <span className="kw">MUST NOT</span> &nbsp;
                            <strong>a path on the person&rsquo;s disk.</strong> The platform does not
                            know the machine and must not guess at it.
                        </li>
                        <li>
                            <span className="kw">MUST NOT</span> &nbsp;<strong>a command to run.</strong>{' '}
                            A profile is a description the client may apply, reject, or partly ignore.
                        </li>
                    </ul>
                    <p>
                        This is the line that lets a person point the protocol at a host they do not
                        administer. It is also what makes the documents safe to log and to show.
                    </p>
                    <h3 style={{ marginTop: '.6rem' }}>And what a client owes</h3>
                    <ul>
                        <li>
                            <span className="kw">MUST</span> &nbsp;edit configuration files rather than
                            rebuild them, leaving keys it does not own untouched.
                        </li>
                        <li>
                            <span className="kw">MUST</span> &nbsp;keep a session on the profile it
                            started with, because resuming reads state from the directory it began in.
                        </li>
                        <li>
                            <span className="kw">MUST</span> &nbsp;make the active profile visible. The
                            failure being prevented is silent: the wrong profile does not raise an
                            error, it produces ordinary work in the wrong place.
                        </li>
                    </ul>
                </section>

                <section className="stack">
                    <span className="eyebrow">Status</span>
                    <h2>Draft, and honest about it.</h2>
                    <p>
                        The path, the schemas and the rel URI may still change before v1 is cut. No
                        implementation listed anywhere is conforming yet, and{' '}
                        <a href="/registry">the registry</a> is empty for that reason rather than
                        because nobody has asked.
                    </p>
                    <p>
                        The mechanism here is the one everyone converges on, a JSON document at a
                        well-known path, and A2A&rsquo;s agent card is the pattern it follows. The gap
                        is the motivation: the tools that exist for switching between agent accounts
                        were built for quota rather than for customers, and none of them is specified,
                        so no platform can implement against them. The IETF chartered a working group
                        for agent discovery in October 2026; its charter covers an agent&rsquo;s
                        initial public properties, which is a different question from what a signed-in
                        person is entitled to configure, and it has no adopted draft.
                    </p>
                </section>
            </main>
        </div>
    );
}
