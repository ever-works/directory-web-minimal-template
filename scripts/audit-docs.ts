#!/usr/bin/env tsx
/**
 * Doc-Quality Audit Runner
 *
 * Codifies the 6 grep-based drift classes documented in
 * `AGENTS.md § Doc-Quality Audit Checklist` into a single executable
 * pass. Each class wraps the exact regex from the checklist; the script
 * is the canonical *runner*, the checklist remains the canonical
 * *reference*.
 *
 * Usage: pnpm audit:docs
 *
 * Exit codes:
 *   0 — all classes PASS (no non-whitelisted drift detected)
 *   1 — at least one class FAILed with real drift
 *
 * History:
 *   - iter 145: codified the 5 grep blocks in AGENTS.md
 *   - iter 146: surfaced miss-target (`>`-blockquote-prefixed status)
 *   - iter 147: tightened blockquote-tolerant Status regex
 *   - iter 148: added 6th class (cross-file rule-count parity)
 *   - iter 149: codified all 6 classes in this script
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const REPO_ROOT = process.cwd();

interface Hit {
    file: string;
    line: number;
    text: string;
}

interface AuditResult {
    pass: boolean;
    hits: Hit[];
    notes: string[];
}

interface AuditClass {
    id: string;
    name: string;
    description: string;
    run: () => AuditResult;
}

/* ------------------------------------------------------------------ */
/* File-system helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Recursively collect all files under `dir` matching the predicate.
 * Skips node_modules, .git, dist, .turbo, .astro, .cache, coverage.
 */
function walk(dir: string, predicate: (path: string) => boolean): string[] {
    const skip = new Set([
        'node_modules',
        '.git',
        'dist',
        '.turbo',
        '.astro',
        '.cache',
        'coverage',
        '.content',
        '.vercel'
    ]);
    const out: string[] = [];
    const stack: string[] = [dir];
    while (stack.length) {
        const cur = stack.pop()!;
        let entries: string[];
        try {
            entries = readdirSync(cur);
        } catch {
            continue;
        }
        for (const e of entries) {
            if (skip.has(e)) continue;
            const full = join(cur, e);
            let st;
            try {
                st = statSync(full);
            } catch {
                continue;
            }
            if (st.isDirectory()) stack.push(full);
            else if (predicate(full)) out.push(full);
        }
    }
    return out;
}

function relPath(p: string): string {
    return relative(REPO_ROOT, p).split(sep).join('/');
}

function readLines(file: string): string[] {
    return readFileSync(file, 'utf8').split(/\r?\n/);
}

/**
 * Run a regex over a set of files and collect line-anchored hits.
 */
function grepFiles(files: string[], regex: RegExp): Hit[] {
    const hits: Hit[] = [];
    for (const file of files) {
        let lines: string[];
        try {
            lines = readLines(file);
        } catch {
            continue;
        }
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // reset stateful regex
            regex.lastIndex = 0;
            if (regex.test(line)) {
                hits.push({ file: relPath(file), line: i + 1, text: line.trim() });
            }
        }
    }
    return hits;
}

/* ------------------------------------------------------------------ */
/* File-set helpers                                                   */
/* ------------------------------------------------------------------ */

const isMarkdown = (p: string) => p.endsWith('.md') || p.endsWith('.mdx');

function docsFiles(): string[] {
    return walk(join(REPO_ROOT, 'docs'), isMarkdown);
}

function specifyFiles(): string[] {
    const root = join(REPO_ROOT, '.specify');
    if (!existsSync(root)) return [];
    return walk(root, isMarkdown);
}

function planFiles(): string[] {
    const root = join(REPO_ROOT, 'docs', 'plans');
    if (!existsSync(root)) return [];
    return walk(root, (p) => isMarkdown(p) && /\bq\d+/.test(relPath(p)));
}

function featureFiles(): string[] {
    const root = join(REPO_ROOT, '.specify', 'features');
    if (!existsSync(root)) return [];
    return walk(root, (p) => isMarkdown(p) && /\bq\d+/.test(relPath(p)));
}

function planAndFeatureFiles(): string[] {
    return [...planFiles(), ...featureFiles()];
}

const ROOT_DOCS = ['CLAUDE.md', 'AGENTS.md', 'README.md'].map((f) => join(REPO_ROOT, f));

/* ------------------------------------------------------------------ */
/* Whitelist helpers                                                  */
/* ------------------------------------------------------------------ */

interface WhitelistRule {
    /** File path (relative-form) the hit lives in. */
    file: string;
    /** Substring the hit's `text` must contain to match. */
    contains: string;
    /** Inline citation explaining why the hit is whitelisted. */
    reason: string;
}

function isWhitelisted(hit: Hit, rules: WhitelistRule[]): WhitelistRule | undefined {
    return rules.find((r) => hit.file === r.file && hit.text.includes(r.contains));
}

/* ------------------------------------------------------------------ */
/* AUDIT CLASS 1 — Status drift (line-anchored, iter-145 regex)       */
/* ------------------------------------------------------------------ */

function auditStatusDriftLineAnchored(): AuditResult {
    // iter-145 codified regex:
    //   ^Status:.*PLANNED|^Status:.*SPECIFIED|^Status:.*DRAFT
    const regex = /^Status:.*(PLANNED|SPECIFIED|DRAFT)/;
    const hits = grepFiles(planAndFeatureFiles(), regex);
    return { pass: hits.length === 0, hits, notes: [] };
}

/* ------------------------------------------------------------------ */
/* AUDIT CLASS 2 — Status drift (blockquote-tolerant, iter-147 regex) */
/* ------------------------------------------------------------------ */

function auditStatusDriftBlockquoteTolerant(): AuditResult {
    // iter-147 codified regex:
    //   ^>?\s*\*?\*?Status:\s+\*?\*?[^✅]
    // The `[^✅]` filters lines whose first state-character is the
    // resolved sigil. Per iter-147, also tolerate `🗄️` (SUPERSEDED).
    // iter-149 note: emoji sigils are surrogate pairs in JS strings;
    // can't compare with `===` against a 1-codeunit slice. Use
    // startsWith on the substring after `Status:` instead.
    const regex = /^>?\s*\*?\*?Status:\s+\*?\*?/;
    const hits = grepFiles(planAndFeatureFiles(), regex).filter((h) => {
        // Strip everything up to and including `Status: ` plus optional
        // markdown bold opener so the first character of the remainder
        // is the state sigil/word.
        const after = h.text.replace(/^[^S]*Status:\s+\*?\*?/, '');
        // Whitelist resolved sigils:
        //   ✅ — RESOLVED / COMPLETE / DONE
        //   🗄 / 🗄️ — SUPERSEDED (iter 146 added 🗄️ for q22-upstream-repro.md)
        if (after.startsWith('✅') || after.startsWith('🗄')) return false;
        // Whitelist the literal grep pattern itself if it appears in
        // checklist references inside plan/feature bodies.
        if (h.text.includes('grep')) return false;
        return true;
    });
    return { pass: hits.length === 0, hits, notes: [] };
}

/* ------------------------------------------------------------------ */
/* AUDIT CLASS 3 — Value drift (count parity)                         */
/* ------------------------------------------------------------------ */

interface ParityCheck {
    label: string;
    expected: number | string;
    actual: number | string;
}

function auditValueDrift(): AuditResult {
    const checks: ParityCheck[] = [];

    // Spec count parity: project.md "All N .specify/" should match
    // actual file count under .specify/features/.
    const featureCount = readdirSync(join(REPO_ROOT, '.specify', 'features')).filter((f) =>
        f.endsWith('.md')
    ).length;
    const projectMd = readFileSync(join(REPO_ROOT, '.specify', 'project.md'), 'utf8');
    const allMatch = projectMd.match(/All (\d+) \.specify\/ feature specs/);
    if (allMatch) {
        checks.push({
            label: 'spec count: All N .specify/ feature specs',
            expected: featureCount,
            actual: parseInt(allMatch[1], 10)
        });
    }

    // Package count parity: project.md "N packages" header should match
    // actual packages/ subdirectory count.
    const pkgCount = readdirSync(join(REPO_ROOT, 'packages')).filter((d) => {
        const full = join(REPO_ROOT, 'packages', d);
        try {
            return statSync(full).isDirectory();
        } catch {
            return false;
        }
    }).length;
    const pkgMatch = projectMd.match(/\*\*(\d+) packages\*\*/);
    if (pkgMatch) {
        checks.push({
            label: 'package count: **N packages**',
            expected: pkgCount,
            actual: parseInt(pkgMatch[1], 10)
        });
    }

    // App count parity.
    const appCount = readdirSync(join(REPO_ROOT, 'apps')).filter((d) => {
        const full = join(REPO_ROOT, 'apps', d);
        try {
            return statSync(full).isDirectory();
        } catch {
            return false;
        }
    }).length;
    const appMatch = projectMd.match(/\*\*(\d+) apps\*\*/);
    if (appMatch) {
        checks.push({
            label: 'app count: **N apps**',
            expected: appCount,
            actual: parseInt(appMatch[1], 10)
        });
    }

    // Stale CT-count claim — iter-132/iter-147 closed the 43→48 drift.
    // Any new occurrence of `43 cases` outside the AGENTS.md grep
    // pattern itself or historical-iter-context blocks is real drift.
    const ctRegex = /43 cases|43\/43/;
    const ctHits = grepFiles([...ROOT_DOCS, ...docsFiles(), ...specifyFiles()], ctRegex).filter(
        (h) => {
            // Whitelist the AGENTS.md grep pattern itself.
            if (h.file === 'AGENTS.md' && h.text.includes('grep')) return false;
            // Whitelist historical iter-N context: any line citing iter
            // numbers <= 131 (before iter-132 fixed the CT count) is
            // historical record.
            if (/iter(?:ation)?\s*1[01]\d|iter(?:ation)?\s*1[23][01]/.test(h.text)) return false;
            // Whitelist log.md change-log entries (full historical record).
            if (h.file === 'docs/log.md') return false;
            // Whitelist questions.md historical Q22-arc narrative.
            if (h.file === 'docs/questions.md') return false;
            // Whitelist docs/index.md (per-iter descriptors are by
            // construction historical iteration narrative).
            if (h.file === 'docs/index.md') return false;
            // Whitelist plan/feature historical-context blocks
            // (iter-N status, exit criteria satisfied at iter-N).
            if (
                /docs\/plans\/q\d+/.test(h.file) ||
                /\.specify\/features\/q\d+/.test(h.file)
            ) {
                return false;
            }
            return true;
        }
    );

    const driftHits: Hit[] = ctHits.slice();
    const notes: string[] = [];

    for (const c of checks) {
        if (c.expected !== c.actual) {
            driftHits.push({
                file: '.specify/project.md',
                line: 0,
                text: `${c.label}: expected ${c.expected}, found ${c.actual}`
            });
        } else {
            notes.push(`${c.label}: ${c.actual} ✓`);
        }
    }

    return { pass: driftHits.length === 0, hits: driftHits, notes };
}

/* ------------------------------------------------------------------ */
/* AUDIT CLASS 4 — Toolchain version drift                            */
/* ------------------------------------------------------------------ */

function auditToolchainVersionDrift(): AuditResult {
    // Read pinned versions from apps/web/package.json (canonical app).
    const webPkg = JSON.parse(
        readFileSync(join(REPO_ROOT, 'apps', 'web', 'package.json'), 'utf8')
    );
    const deps = { ...webPkg.dependencies, ...webPkg.devDependencies };
    const pinned: Record<string, string> = {
        astro: deps.astro?.replace(/^[\^~]/, ''),
        preact: deps.preact?.replace(/^[\^~]/, ''),
        tailwindcss: deps.tailwindcss?.replace(/^[\^~]/, ''),
        typescript: deps.typescript?.replace(/^[\^~]/, '')
    };

    // For each major.minor referenced in docs/CLAUDE.md/AGENTS.md, the
    // pinned version's major.minor must match. We do NOT enforce patch
    // parity (semver-caret tolerates patch drift).
    const docFiles = [...ROOT_DOCS, ...docsFiles(), ...specifyFiles()];
    const driftHits: Hit[] = [];
    const notes: string[] = [];

    type Tool = { name: keyof typeof pinned; regex: RegExp };
    const tools: Tool[] = [
        { name: 'astro', regex: /Astro (\d+)\.(\d+)/g },
        { name: 'preact', regex: /Preact (\d+)\.(\d+)/g },
        { name: 'tailwindcss', regex: /Tailwind (?:CSS )?(\d+)\.(\d+)/g },
        { name: 'typescript', regex: /TypeScript (\d+)\.(\d+)/g }
    ];

    for (const tool of tools) {
        const pinnedVer = pinned[tool.name];
        if (!pinnedVer) continue;
        const [pinMajor, pinMinor] = pinnedVer.split('.');
        for (const file of docFiles) {
            let lines: string[];
            try {
                lines = readLines(file);
            } catch {
                continue;
            }
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const re = new RegExp(tool.regex.source, 'g');
                let m: RegExpExecArray | null;
                while ((m = re.exec(line)) !== null) {
                    const major = m[1];
                    // Only flag if the doc claims a *different* major.
                    // Different minor is informational (often historical).
                    if (major !== pinMajor) {
                        // Whitelist historical-iter-context lines (Vitest 3.2.4
                        // / Vitest 4.1.4 / Astro 5.x etc. in bisect history,
                        // upgrade narrative, change-log entries).
                        const fileRel = relPath(file);
                        if (fileRel === 'docs/log.md') continue;
                        if (fileRel === 'docs/questions.md') continue;
                        if (/docs\/plans\/q\d+/.test(fileRel)) continue;
                        if (/\.specify\/features\/q\d+/.test(fileRel)) continue;
                        if (line.includes('grep')) continue;
                        driftHits.push({
                            file: fileRel,
                            line: i + 1,
                            text: `${tool.name} ${m[0]} found, pinned ${pinnedVer}`
                        });
                    }
                }
            }
        }
        notes.push(`${tool.name}: pinned ${pinnedVer} (major ${pinMajor})`);
    }

    return { pass: driftHits.length === 0, hits: driftHits, notes };
}

/* ------------------------------------------------------------------ */
/* AUDIT CLASS 5 — ISR wording drift                                  */
/* ------------------------------------------------------------------ */

function auditISRWordingDrift(): AuditResult {
    // iter-17 / Q17 made ISR the default. Any "fully static" / "no SSR"
    // claim in user-facing docs that contradicts R5 is real drift.
    //
    // The greppable string is highly polysemous in this codebase:
    //   - sample-basic / sample-jobs / sample-events / sample-real-estate
    //     / sample-git ARE legitimately pure-static (no Vercel adapter
    //     in their astro.config.ts), so their feature specs and plans
    //     correctly say "Fully static (Astro `output: 'static'`)";
    //   - audit checklist / audit script / audit spec all contain the
    //     literal grep pattern as a string;
    //   - iteration descriptors in docs/index.md and historical entries
    //     in docs/log.md cite the original drift verbatim;
    //   - docs/architecture/content-sync.md and docs/guides/content-sync.md
    //     and docs/guides/deployment.md each have a `## Static Mode` /
    //     `ENABLE_ISR=false` section that legitimately uses the wording.
    //
    // Strategy: file-level allowlist for the long tail of legitimate
    // mentions; flag only files NOT in the allowlist (which would be
    // genuinely new drift, e.g. user-guide top-level claims).
    const regex = /(fully static|no SSR|Fully static)/;
    const docFiles = [...ROOT_DOCS, ...docsFiles(), ...specifyFiles()];
    const allowedFiles = new Set([
        // Audit infrastructure (codifies/discusses the grep pattern itself)
        'AGENTS.md',
        'scripts/audit-docs.ts',
        'docs/plans/audit-docs-script.md',
        '.specify/features/audit-docs-script.md',
        // Historical narrative surfaces
        'docs/log.md',
        'docs/index.md',
        // Q-arc historical contexts
        // (matched dynamically by path prefix below)
        // Architecture / guides legitimately discussing both modes
        'docs/architecture/content-sync.md',
        'docs/guides/content-sync.md',
        'docs/guides/deployment.md',
        // Sample-app spec / plans (samples ARE pure-static by design)
        'docs/plans/phase-5-sample.md',
        '.specify/features/sample-basic.md',
        '.specify/features/sample-events.md',
        '.specify/features/sample-git.md',
        '.specify/features/sample-jobs.md',
        '.specify/features/sample-real-estate.md',
        // web-app feature spec authored pre-iter-17; the "Build generates
        // fully static HTML" line refers to Astro's static *build mode*
        // (which ISR also uses underneath at build time)
        '.specify/features/web-app.md',
        // project.md Goals predate iter-17; goal #3 reads "Generate fully
        // static output for maximum performance" — historically correct
        // framing for the project's static-first identity
        '.specify/project.md'
    ]);
    const hits = grepFiles(docFiles, regex).filter((h) => {
        if (allowedFiles.has(h.file)) return false;
        // Q-arc plans and features are historical-context surfaces
        if (/^docs\/plans\/q\d+/.test(h.file)) return false;
        if (/^\.specify\/features\/q\d+/.test(h.file)) return false;
        return true;
    });
    return { pass: hits.length === 0, hits, notes: [] };
}

/* ------------------------------------------------------------------ */
/* AUDIT CLASS 6 — Structural / link drift                            */
/* ------------------------------------------------------------------ */

function auditStructuralLinkDrift(): AuditResult {
    // Relative markdown links from docs/ that escape the docs/ scope
    // break under Docusaurus content-scope routing. iter-142 closed
    // the cross-repo `../../` class. This audit catches new offenders.
    const regex = /\]\(\.\.\//;
    const hits = grepFiles(docsFiles(), regex).filter((h) => {
        // Whitelist historical iter-142 fix narrative in log.md.
        if (h.file === 'docs/log.md') return false;
        // Whitelist plan/feature files — within-docs/ relative links
        // (e.g. ../questions.md, ../architecture/) resolve correctly.
        if (h.text.includes('](../questions.md)')) return false;
        if (h.text.includes('](../architecture/')) return false;
        if (h.text.includes('](../guides/')) return false;
        if (h.text.includes('](../plans/')) return false;
        if (h.text.includes('](../specs/')) return false;
        return true;
    });
    return { pass: hits.length === 0, hits, notes: [] };
}

/* ------------------------------------------------------------------ */
/* AUDIT CLASS * — Cross-file consistency (parity check)              */
/* ------------------------------------------------------------------ */

function auditCrossFileConsistency(): AuditResult {
    const agents = readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8');
    const claude = readFileSync(join(REPO_ROOT, 'CLAUDE.md'), 'utf8');
    const agentsRules = (agents.match(/^### R\d+:/gm) ?? []).length;
    const claudeRules = (claude.match(/^\d+\.\s+\*\*/gm) ?? []).length;

    // Per iter-148: AGENTS.md has 15 R-rules, CLAUDE.md has 17 numbered
    // items (R3+R4 fan out into items 2-4 + 7 in CLAUDE.md for
    // marketing clarity; R9-R15 map 1:1 to items 11-17).
    const expectedAgents = 15;
    const expectedClaude = 17;
    const pass = agentsRules === expectedAgents && claudeRules === expectedClaude;
    const notes = [
        `AGENTS.md R-rules: ${agentsRules} (expected ${expectedAgents})`,
        `CLAUDE.md numbered Critical Rules: ${claudeRules} (expected ${expectedClaude})`
    ];
    const hits: Hit[] = pass
        ? []
        : [
              {
                  file: 'AGENTS.md vs CLAUDE.md',
                  line: 0,
                  text: `rule-count parity drift — AGENTS=${agentsRules}/${expectedAgents}, CLAUDE=${claudeRules}/${expectedClaude}`
              }
          ];
    return { pass, hits, notes };
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

const classes: AuditClass[] = [
    {
        id: '1/6',
        name: 'Status drift (line-anchored, iter-145)',
        description: '^Status:.*PLANNED|SPECIFIED|DRAFT in docs/plans/ + .specify/features/',
        run: auditStatusDriftLineAnchored
    },
    {
        id: '2/6',
        name: 'Status drift (blockquote-tolerant, iter-147)',
        description: '^>?\\s*\\*?\\*?Status:\\s+\\*?\\*?[^✅🗄] (skips resolved sigils)',
        run: auditStatusDriftBlockquoteTolerant
    },
    {
        id: '3/6',
        name: 'Value drift (count parity)',
        description: 'spec/package/app counts in project.md vs filesystem; CT-count claim 43→48',
        run: auditValueDrift
    },
    {
        id: '4/6',
        name: 'Toolchain version drift',
        description: 'Astro/Preact/Tailwind/TypeScript major-version mentions vs apps/web/package.json',
        run: auditToolchainVersionDrift
    },
    {
        id: '5/6',
        name: 'ISR wording drift',
        description: '"fully static" / "no SSR" claims that contradict R5 (post iter-17)',
        run: auditISRWordingDrift
    },
    {
        id: '6/6',
        name: 'Structural / link drift',
        description: '](../ relative links from docs/ that escape the Docusaurus content scope',
        run: auditStructuralLinkDrift
    },
    {
        id: ' * ',
        name: 'Cross-file consistency (AGENTS R-rules vs CLAUDE Critical Rules)',
        description: 'rule-count parity check (added iter 148): AGENTS=15 R-rules, CLAUDE=17 items',
        run: auditCrossFileConsistency
    }
];

function main(): number {
    console.log('');
    console.log('Doc-Quality Audit Runner — codifies AGENTS.md § Doc-Quality Audit Checklist');
    console.log('  reference: AGENTS.md § Doc-Quality Audit Checklist');
    console.log('  spec:      .specify/features/audit-docs-script.md');
    console.log('  plan:      docs/plans/audit-docs-script.md');
    console.log('');

    let passCount = 0;
    let failCount = 0;
    let totalHits = 0;
    const failures: { cls: AuditClass; result: AuditResult }[] = [];

    for (const cls of classes) {
        const result = cls.run();
        const status = result.pass ? 'PASS' : 'FAIL';
        const hitsLabel = result.hits.length === 0 ? '0 hits' : `${result.hits.length} hits`;
        console.log(`[${cls.id}] ${cls.name.padEnd(58)} ${status} — ${hitsLabel}`);
        for (const note of result.notes) {
            console.log(`         ${note}`);
        }
        if (result.pass) passCount++;
        else {
            failCount++;
            failures.push({ cls, result });
        }
        totalHits += result.hits.length;
    }

    console.log('');
    if (failures.length > 0) {
        console.log('--- DRIFT DETAILS ---');
        for (const { cls, result } of failures) {
            console.log('');
            console.log(`[${cls.id}] ${cls.name}`);
            for (const h of result.hits) {
                console.log(`  ${h.file}:${h.line}: ${h.text}`);
            }
        }
        console.log('');
    }

    const totalClasses = classes.length;
    console.log(
        `${passCount}/${totalClasses} PASS — ${
            failCount === 0 ? 'no documentation drift detected.' : `${failCount} class(es) failed; ${totalHits} hit(s) reported above.`
        }`
    );
    console.log('');

    return failCount === 0 ? 0 : 1;
}

process.exit(main());
