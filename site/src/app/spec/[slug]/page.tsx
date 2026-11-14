import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSpecDoc, listSpecDocs } from '@/lib/content';

// The repository is read at build time only, so an unknown slug must 404 rather than
// reach the filesystem at request time: spec/ is not inside the standalone image.
export const dynamicParams = false;

export async function generateStaticParams() {
    return (await listSpecDocs()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const doc = await getSpecDoc((await params).slug);
    return doc ? { title: `${doc.title} - Agent Setup Protocol` } : {};
}

export default async function SpecPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const doc = await getSpecDoc(slug);
    if (!doc) notFound();

    const all = await listSpecDocs();

    return (
        <div className="cols">
            <nav>
                <span className="nt">Specification</span>
                {all.map((d) => (
                    <a key={d.slug} href={`/spec/${d.slug}`} aria-current={d.slug === slug ? 'page' : undefined}>
                        {d.title}
                    </a>
                ))}
            </nav>
            <main>
                <span className="eyebrow">Draft</span>
                <h1>{doc.title}</h1>
                {/* Repository content, rendered at build time. */}
                <article className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
            </main>
        </div>
    );
}
