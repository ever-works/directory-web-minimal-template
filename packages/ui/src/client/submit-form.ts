/**
 * Static "submit an item" form. No backend: the form turns the visitor's answers into
 *
 * - a pre-filled GitHub "create new file" page for `data/<slug>/<slug>.yml` in the data repository — GitHub forks the
 *   repository for the visitor and opens a pull request (the Git-first way to add an item),
 * - or a pre-filled GitHub issue,
 * - or a pre-filled email,
 *
 * depending on which targets the page enables (`data-github-repo`, `data-github-branch`, `data-email` on the form).
 */

/** Values collected by the submit form. */
export interface SubmissionInput {
    name: string;
    website: string;
    description: string;
    category: string;
    tags: string[];
    email: string;
    notes: string;
}

/** Slug used for `data/<slug>/<slug>.yml`. */
export function submissionSlug(name: string): string {
    return (
        name
            .trim()
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'new-item'
    );
}

/** YAML for a new item file (JSON strings are valid YAML double-quoted scalars, so values are always escaped). */
export function submissionYaml(input: SubmissionInput, now = new Date()): string {
    const q = (value: string) => JSON.stringify(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
    const lines = [
        `name: ${q(input.name)}`,
        `description: ${q(input.description)}`,
        `source_url: ${q(input.website)}`,
        ...(input.category ? [`category: ${q(input.category)}`] : []),
        ...(input.tags.length ? ['tags:', ...input.tags.map((tag) => `  - ${q(tag)}`)] : []),
        `updated_at: ${q(stamp)}`
    ];
    return `${lines.join('\n')}\n`;
}

/** Markdown body for issues and emails. */
export function submissionMarkdown(input: SubmissionInput): string {
    return [
        `**Name:** ${input.name}`,
        `**Website:** ${input.website}`,
        input.category ? `**Category:** ${input.category}` : '',
        input.tags.length ? `**Tags:** ${input.tags.join(', ')}` : '',
        '',
        input.description,
        input.notes ? `\n**Notes:** ${input.notes}` : '',
        input.email ? `\n**Contact:** ${input.email}` : '',
        '',
        '```yaml',
        submissionYaml(input).trimEnd(),
        '```'
    ]
        .filter((line, i, all) => line !== '' || all[i - 1] !== '')
        .join('\n');
}

/** GitHub "create new file" URL (opens a fork + pull request flow for non-collaborators). */
export function githubNewFileUrl(repo: string, branch: string, input: SubmissionInput): string {
    const slug = submissionSlug(input.name);
    const params = new URLSearchParams({ filename: `data/${slug}/${slug}.yml`, value: submissionYaml(input) });
    return `https://github.com/${repo}/new/${encodeURIComponent(branch)}?${params.toString()}`;
}

/** GitHub new-issue URL. */
export function githubIssueUrl(repo: string, input: SubmissionInput): string {
    const params = new URLSearchParams({ title: `Add: ${input.name}`, body: submissionMarkdown(input) });
    return `https://github.com/${repo}/issues/new?${params.toString()}`;
}

/** mailto: URL. */
export function mailtoUrl(email: string, input: SubmissionInput): string {
    return `mailto:${email}?subject=${encodeURIComponent(`Submission: ${input.name}`)}&body=${encodeURIComponent(submissionMarkdown(input))}`;
}

function readForm(form: HTMLFormElement): SubmissionInput {
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? '').trim();
    return {
        name: value('name'),
        website: value('website'),
        description: value('description'),
        category: value('category'),
        tags: value('tags')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 10),
        email: value('email'),
        notes: value('notes')
    };
}

/** Wire up `form[data-component="submit-form"]`. */
export function initSubmitForm(): void {
    const form = document.querySelector<HTMLFormElement>('form[data-component="submit-form"]');
    if (!form || form.dataset['ready']) return;
    form.dataset['ready'] = 'true';
    const repo = form.dataset['githubRepo'] ?? '';
    const branch = form.dataset['githubBranch'] || 'main';
    const email = form.dataset['email'] ?? '';
    const status = form.querySelector<HTMLElement>('[data-part="status"]');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
        const target = submitter?.value || (repo ? 'github-pr' : email ? 'email' : '');
        if (!form.reportValidity()) return;
        const input = readForm(form);
        if (!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(input.website)) {
            const website = form.elements.namedItem('website') as HTMLInputElement | null;
            website?.setCustomValidity('Enter the full website address, starting with https://');
            website?.reportValidity();
            website?.addEventListener('input', () => website.setCustomValidity(''), { once: true });
            return;
        }
        let url = '';
        if (target === 'github-pr' && repo) url = githubNewFileUrl(repo, branch, input);
        else if (target === 'github-issue' && repo) url = githubIssueUrl(repo, input);
        else if (target === 'email' && email) url = mailtoUrl(email, input);
        if (!url) return;
        if (status) {
            status.hidden = false;
            status.textContent =
                target === 'email'
                    ? 'Your email app should open with the submission. Send it to finish.'
                    : 'GitHub opened in a new tab with your submission pre-filled. Review it and confirm to send it to the maintainers.';
        }
        if (target === 'email') window.location.href = url;
        else window.open(url, '_blank', 'noopener');
    });
}
