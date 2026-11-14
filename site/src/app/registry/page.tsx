import type { Metadata } from 'next';

import { listRegistry } from '@/lib/content';

export const metadata: Metadata = { title: 'Registry - Agent Setup Protocol' };

const REACH: Record<string, string> = {
    public: 'Served openly and readable without credentials.',
    gated: 'The host resolves; the operator declines to expose the document publicly.',
    private: 'Not reachable from the internet. Self-hosted, or bought and run on the operator’s own network.',
};

export default async function RegistryPage() {
    const entries = await listRegistry();

    return (
        <main>
            <span className="eyebrow">Registry</span>
            <h1>Platforms</h1>
            <p className="lede">
                An entry is a conformance claim, not a directory listing. An author submits an id, an
                origin, the roles claimed and a contact; everything else is derived from the document
                the continuous check fetches, so nothing on this page can be aspirational.
            </p>

            {entries.length === 0 ? (
                <div className="empty">
                    <h2>No platform is listed yet.</h2>
                    <p>
                        The list is empty because no implementation is conforming yet, not because
                        nobody has asked. The first entry will arrive the same way every later one
                        does: as a pull request against <code>registry/</code> in this repository.
                    </p>
                </div>
            ) : (
                <div className="tbl">
                    <table>
                        <thead>
                            <tr>
                                <th>Platform</th>
                                <th>Origin</th>
                                <th>Roles</th>
                                <th>Reachability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((e) => (
                                <tr key={e.id}>
                                    <td className="f">{e.id}</td>
                                    <td>{e.origin}</td>
                                    <td>{e.roles.join(', ')}</td>
                                    <td title={REACH[e.reachability]}>{e.reachability}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <h2 style={{ marginTop: '2rem' }}>Getting listed</h2>
            <ol>
                <li>Serve the service document at <code>/.well-known/agent-setup</code>.</li>
                <li>
                    Copy <code>registry/_template.json</code> to <code>registry/&lt;your-id&gt;.json</code> and
                    fill in the four author fields.
                </li>
                <li>Open a pull request. The check runs against your origin only.</li>
            </ol>
            <p className="small muted">
                A well-formed, honestly labelled entry is merged whether or not we have heard of the
                platform. The list publishes no ranking and no tiers of goodness.
            </p>
        </main>
    );
}
