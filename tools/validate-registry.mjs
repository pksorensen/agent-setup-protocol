#!/usr/bin/env node
// Validates registry/*.json without a dependency, so the pull-request gate on a
// public repository installs nothing to check a contributor's file.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(import.meta.dirname, '..', 'registry');
const ROLES = new Set(['platform', 'switcher']);
const REACH = new Set(['public', 'gated', 'private']);
const ID = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
const ALLOWED = new Set(['id', 'origin', 'roles', 'reachability', 'tools', 'contact', 'listed_by', 'documentation']);

const errors = [];
const fail = (f, m) => errors.push(`${f}: ${m}`);

for (const file of (await readdir(DIR)).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
    let e;
    try {
        e = JSON.parse(await readFile(path.join(DIR, file), 'utf8'));
    } catch (err) {
        fail(file, `not valid JSON (${err.message})`);
        continue;
    }
    const expected = file.replace(/\.json$/, '');
    for (const k of Object.keys(e)) if (!ALLOWED.has(k)) fail(file, `unknown field "${k}"`);
    if (e.id !== expected) fail(file, `"id" must equal the filename: expected "${expected}"`);
    if (!ID.test(e.id ?? '')) fail(file, '"id" must be lowercase letters, digits and hyphens');
    if (typeof e.origin !== 'string' || !e.origin.startsWith('https://')) fail(file, '"origin" must be an https URL');
    else if (e.origin.endsWith('/') || new URL(e.origin).pathname !== '/') fail(file, '"origin" must be scheme and host only, with no path');
    if (!Array.isArray(e.roles) || e.roles.length === 0) fail(file, '"roles" must list at least one role');
    else for (const r of e.roles) if (!ROLES.has(r)) fail(file, `unknown role "${r}"`);
    if (!REACH.has(e.reachability)) fail(file, '"reachability" must be public, gated or private');
}

if (errors.length) {
    console.error('Registry validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
}
console.log('Registry OK.');
