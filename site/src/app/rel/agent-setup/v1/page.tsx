import type { Metadata } from 'next';

import { listSpecDocs } from '@/lib/content';

// This URL is written into the wire format of every platform that implements the
// protocol, as a key in the `services` map of /.well-known/agentic-platform. The
// specification calls resolving it in a browser "a documentation convenience", so
// it has to resolve: an implementer who pastes the key they just read, to check
// what it means, must not be answered with a 404.
export const metadata: Metadata = {
    title: 'https://agentsetupprotocol.com/rel/agent-setup/v1 - Agent Setup Protocol',
    description:
        'The service identifier for Agent Setup Protocol v1. An identifier, not a location.',
};

const KEY = 'https://agentsetupprotocol.com/rel/agent-setup/v1';

export default async function RelPage() {
    const docs = await listSpecDocs();

    return (
        <div className="cols">
            <nav>
                <span className="nt">Specification</span>
                {docs.map((d) => (
                    <a key={d.slug} href={`/spec/${d.slug}`}>
                        {d.title}
                    </a>
                ))}
            </nav>
            <main>
                <span className="eyebrow">Identifier</span>
                <h1>Agent Setup Protocol v1</h1>
                <article className="prose">
                    <p>
                        You have arrived here because you resolved <code>{KEY}</code>, most
                        likely after reading it as a key in a platform&rsquo;s discovery
                        document. This page is what that key means.
                    </p>

                    <h2>It is an identifier, not a location</h2>
                    <p>
                        The key names the service. It is not the address of the service, and
                        nothing is fetched from it. A platform implementing this protocol
                        publishes an entry under this key in its{' '}
                        <code>/.well-known/agentic-platform</code> index, and the entry&rsquo;s{' '}
                        <code>href</code> is the address:
                    </p>
                    <pre>
                        <code>{`{
  "services": {
    "${KEY}": {
      "href": "https://platform.example/.well-known/agent-setup"
    }
  }
}`}</code>
                    </pre>

                    <h2>It is the same string everywhere</h2>
                    <p>
                        The key stays byte-identical on every host that implements the service,
                        exactly as a link relation or an RDF vocabulary term would. A
                        self-hosted platform at <code>example.com</code> still keys its entry{' '}
                        <code>{KEY}</code>. A client that interpolates the host it is talking to
                        into the key will match nothing, anywhere.
                    </p>
                    <p>
                        Match on the key; resolve the <code>href</code>.
                    </p>

                    <h2>What the service does</h2>
                    <p>
                        One command points a coding agent at a platform, and the platform
                        configures it. The platform publishes data; the client owns every file
                        edit on disk. A profile never carries a credential value, a path on the
                        reader&rsquo;s disk, or a command to run.
                    </p>
                    <p>
                        Start at <a href="/spec/overview">the overview</a>, or go straight to{' '}
                        <a href="/spec/discovery-and-auth">discovery and authorization</a>,
                        which specifies this key and the documents it leads to.
                    </p>
                </article>
            </main>
        </div>
    );
}
