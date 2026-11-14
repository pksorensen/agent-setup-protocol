import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { marked } from 'marked';

/**
 * The repository is the content. These helpers read it at build time, so a merged
 * pull request against `spec/` or `registry/` is the whole publishing pipeline.
 */
const REPO = path.join(process.cwd(), '..');

export interface SpecDoc {
    slug: string;
    title: string;
    order: number;
    html: string;
}

/** `01-discovery-and-auth.md` -> slug `discovery-and-auth`, order 1. */
function parseName(file: string): { slug: string; order: number } {
    const m = /^(\d+)-(.+)\.md$/.exec(file);
    if (!m) return { slug: file.replace(/\.md$/, ''), order: 999 };
    return { slug: m[2], order: Number(m[1]) };
}

/** The first `# ` heading, which the rendered body then drops to avoid showing it twice. */
function splitTitle(md: string): { title: string; body: string } {
    const lines = md.split('\n');
    const i = lines.findIndex((l) => l.startsWith('# '));
    if (i === -1) return { title: 'Untitled', body: md };
    return { title: lines[i].slice(2).trim(), body: [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n') };
}

export async function listSpecDocs(): Promise<SpecDoc[]> {
    const dir = path.join(REPO, 'spec', 'draft');
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    const docs = await Promise.all(
        files.map(async (file) => {
            const { slug, order } = parseName(file);
            const { title, body } = splitTitle(await readFile(path.join(dir, file), 'utf8'));
            return { slug, order, title, html: await marked.parse(body) };
        }),
    );
    return docs.sort((a, b) => a.order - b.order);
}

export async function getSpecDoc(slug: string): Promise<SpecDoc | undefined> {
    return (await listSpecDocs()).find((d) => d.slug === slug);
}

export interface RegistryEntry {
    id: string;
    origin: string;
    roles: string[];
    reachability: 'public' | 'gated' | 'private';
    contact?: string;
    listed_by?: string;
}

/**
 * Author-written claims only. Anything the continuous check establishes lives in a
 * separate bot-owned file, so a pull request cannot assert its own verification.
 */
export async function listRegistry(): Promise<RegistryEntry[]> {
    const dir = path.join(REPO, 'registry');
    let files: string[] = [];
    try {
        files = (await readdir(dir)).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
    } catch {
        return [];
    }
    const rows = await Promise.all(
        files.map(async (f) => JSON.parse(await readFile(path.join(dir, f), 'utf8')) as RegistryEntry),
    );
    return rows.sort((a, b) => a.id.localeCompare(b.id));
}
