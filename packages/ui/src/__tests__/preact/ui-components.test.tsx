/** @jsxImportSource preact */
/**
 * Tests for shadcn-style Preact UI components (Badge, Button, Input, Label, Select).
 *
 * Validates rendering, data-slot attributes, variant application, and prop forwarding.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectOption } from '../../components/ui/select';

describe('Badge component', () => {
    it('renders with data-slot="badge"', () => {
        const { container } = render(<Badge>Test</Badge>);
        expect(container.querySelector('[data-slot="badge"]')).toBeTruthy();
    });

    it('renders children', () => {
        render(<Badge>Hello Badge</Badge>);
        expect(screen.getByText('Hello Badge')).toBeTruthy();
    });

    it('applies default variant classes', () => {
        const { container } = render(<Badge>Default</Badge>);
        const el = container.querySelector('[data-slot="badge"]')!;
        expect(el.className).toContain('bg-primary');
    });

    it('applies secondary variant classes', () => {
        const { container } = render(<Badge variant="secondary">Sec</Badge>);
        const el = container.querySelector('[data-slot="badge"]')!;
        expect(el.className).toContain('bg-secondary');
    });

    it('applies outline variant classes', () => {
        const { container } = render(<Badge variant="outline">Out</Badge>);
        const el = container.querySelector('[data-slot="badge"]')!;
        expect(el.className).toContain('border-border');
    });

    it('merges custom className', () => {
        const { container } = render(<Badge className="custom-class">Badge</Badge>);
        const el = container.querySelector('[data-slot="badge"]')!;
        expect(el.className).toContain('custom-class');
    });

    it('renders as a span element', () => {
        const { container } = render(<Badge>Span</Badge>);
        const el = container.querySelector('[data-slot="badge"]')!;
        expect(el.tagName).toBe('SPAN');
    });
});

describe('Button component', () => {
    it('renders with data-slot="button"', () => {
        const { container } = render(<Button>Click</Button>);
        expect(container.querySelector('[data-slot="button"]')).toBeTruthy();
    });

    it('renders children', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeTruthy();
    });

    it('renders as a button element', () => {
        render(<Button>Btn</Button>);
        expect(screen.getByRole('button')).toBeTruthy();
    });

    it('applies default variant + size classes', () => {
        const { container } = render(<Button>Default</Button>);
        const el = container.querySelector('[data-slot="button"]')!;
        expect(el.className).toContain('bg-primary');
        expect(el.className).toContain('h-9');
    });

    it('applies ghost variant', () => {
        const { container } = render(<Button variant="ghost">Ghost</Button>);
        const el = container.querySelector('[data-slot="button"]')!;
        expect(el.className).toContain('hover:bg-muted');
    });

    it('applies sm size', () => {
        const { container } = render(<Button size="sm">Small</Button>);
        const el = container.querySelector('[data-slot="button"]')!;
        expect(el.className).toContain('h-8');
    });

    it('applies icon size', () => {
        const { container } = render(<Button size="icon">I</Button>);
        const el = container.querySelector('[data-slot="button"]')!;
        expect(el.className).toContain('size-9');
    });

    it('merges custom className', () => {
        const { container } = render(<Button className="extra">X</Button>);
        const el = container.querySelector('[data-slot="button"]')!;
        expect(el.className).toContain('extra');
    });

    it('forwards disabled prop', () => {
        render(<Button disabled>Disabled</Button>);
        const btn = screen.getByRole('button');
        expect(btn.hasAttribute('disabled')).toBe(true);
    });
});

describe('Input component', () => {
    it('renders with data-slot="input"', () => {
        const { container } = render(<Input />);
        expect(container.querySelector('[data-slot="input"]')).toBeTruthy();
    });

    it('defaults to type="text"', () => {
        const { container } = render(<Input />);
        const el = container.querySelector('input')!;
        expect(el.getAttribute('type')).toBe('text');
    });

    it('accepts custom type', () => {
        const { container } = render(<Input type="email" />);
        const el = container.querySelector('input')!;
        expect(el.getAttribute('type')).toBe('email');
    });

    it('merges custom className', () => {
        const { container } = render(<Input className="my-input" />);
        const el = container.querySelector('input')!;
        expect(el.className).toContain('my-input');
    });

    it('forwards placeholder prop', () => {
        const { container } = render(<Input placeholder="Search..." />);
        const el = container.querySelector('input')!;
        expect(el.getAttribute('placeholder')).toBe('Search...');
    });

    it('applies base styling classes', () => {
        const { container } = render(<Input />);
        const el = container.querySelector('input')!;
        expect(el.className).toContain('border-input');
        expect(el.className).toContain('bg-background');
        expect(el.className).toContain('h-9');
    });
});

describe('Label component', () => {
    it('renders with data-slot="label"', () => {
        const { container } = render(<Label>Name</Label>);
        expect(container.querySelector('[data-slot="label"]')).toBeTruthy();
    });

    it('renders children', () => {
        render(<Label>Field Label</Label>);
        expect(screen.getByText('Field Label')).toBeTruthy();
    });

    it('renders as a label element', () => {
        const { container } = render(<Label>Lab</Label>);
        const el = container.querySelector('[data-slot="label"]')!;
        expect(el.tagName).toBe('LABEL');
    });

    it('merges custom className', () => {
        const { container } = render(<Label className="bold-label">L</Label>);
        const el = container.querySelector('[data-slot="label"]')!;
        expect(el.className).toContain('bold-label');
    });

    it('applies base styling classes', () => {
        const { container } = render(<Label>L</Label>);
        const el = container.querySelector('[data-slot="label"]')!;
        expect(el.className).toContain('text-sm');
        expect(el.className).toContain('font-medium');
    });
});

describe('Select component', () => {
    it('renders with data-slot="select"', () => {
        const { container } = render(<Select><SelectOption value="a">A</SelectOption></Select>);
        expect(container.querySelector('[data-slot="select"]')).toBeTruthy();
    });

    it('renders as a select element', () => {
        const { container } = render(<Select><SelectOption value="a">A</SelectOption></Select>);
        const el = container.querySelector('[data-slot="select"]')!;
        expect(el.tagName).toBe('SELECT');
    });

    it('renders options as children', () => {
        const { container } = render(
            <Select>
                <SelectOption value="x">Option X</SelectOption>
                <SelectOption value="y">Option Y</SelectOption>
            </Select>
        );
        const options = container.querySelectorAll('option');
        expect(options.length).toBe(2);
    });

    it('merges custom className', () => {
        const { container } = render(<Select className="wide"><SelectOption value="a">A</SelectOption></Select>);
        const el = container.querySelector('[data-slot="select"]')!;
        expect(el.className).toContain('wide');
    });

    it('applies base styling classes', () => {
        const { container } = render(<Select><SelectOption value="a">A</SelectOption></Select>);
        const el = container.querySelector('[data-slot="select"]')!;
        expect(el.className).toContain('border-input');
        expect(el.className).toContain('bg-background');
    });
});

describe('SelectOption component', () => {
    it('renders an option element with value', () => {
        const { container } = render(
            <select>
                <SelectOption value="test-val">Test</SelectOption>
            </select>
        );
        const option = container.querySelector('option')!;
        expect(option.getAttribute('value')).toBe('test-val');
    });

    it('renders children as text', () => {
        const { container } = render(
            <select>
                <SelectOption value="v">Display Text</SelectOption>
            </select>
        );
        expect(container.querySelector('option')!.textContent).toBe('Display Text');
    });
});
