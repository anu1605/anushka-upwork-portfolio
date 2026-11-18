import { describe, expect, it } from 'vitest';

import { make } from '../server/validate.js';

describe('validator', () => {
    it('accepts a valid payload', () => {
        const validator = make(
            {
                name: 'Anushka',
                subject: 'Hello',
                message: 'A message that is long enough.',
            },
            {
                name: 'required|min:2|max:120',
                subject: 'required|min:3|max:200',
                message: 'required|min:10|max:5000',
            },
        );

        expect(validator.fails()).toBe(false);
        expect(validator.validated()).toMatchObject({ name: 'Anushka' });
    });

    it('flags missing required fields', () => {
        const validator = make({}, { name: 'required', subject: 'required' });

        expect(validator.fails()).toBe(true);
        expect(validator.errors().name).toEqual(['The name field is required.']);
        expect(validator.errors().subject).toEqual(['The subject field is required.']);
    });

    it('validates url, slug and in rules', () => {
        const validator = make(
            {
                website: 'ftp://example.com',
                slug: 'Not A Slug',
                status: 'archived',
            },
            {
                website: 'url',
                slug: 'slug',
                status: 'in:published,draft',
            },
        );

        expect(validator.fails()).toBe(true);
        expect(Object.keys(validator.errors()).sort()).toEqual(['slug', 'status', 'website']);
    });

    it('skips non-required rules for empty values', () => {
        const validator = make({ website: '' }, { website: 'url|max:200' });

        expect(validator.fails()).toBe(false);
    });

    it('enforces min and max lengths', () => {
        const validator = make({ summary: 'hi', title: 'this title is far too long' }, {
            summary: 'min:5',
            title: 'max:10',
        });

        expect(validator.errors().summary).toEqual(['The summary must be at least 5 characters.']);
        expect(validator.errors().title).toEqual(['The title may not be greater than 10 characters.']);
    });
});
