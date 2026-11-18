/**
 * Small rule based validator for form input.
 *
 * Rules use a pipe separated syntax, e.g. "required|max:120".
 */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function make(data, rules) {
    const validator = new Validator(data, rules);

    validator.run();

    return validator;
}

export class Validator {
    constructor(data, rules) {
        this.data = data ?? {};
        this.rules = rules ?? {};
        this._errors = {};
    }

    fails() {
        return Object.keys(this._errors).length > 0;
    }

    errors() {
        return this._errors;
    }

    validated() {
        const valid = {};

        for (const field of Object.keys(this.rules)) {
            if (!this._errors[field]) {
                valid[field] = this.data[field] ?? null;
            }
        }

        return valid;
    }

    run() {
        if (Object.keys(this._errors).length > 0 || Object.keys(this.rules).length === 0) {
            return;
        }

        for (const [field, ruleString] of Object.entries(this.rules)) {
            const value = this.data[field] ?? null;

            for (const rule of String(ruleString).split('|')) {
                const [name, parameter = null] = rule.split(':', 2);
                const error = this.validateRule(name, parameter, value, field);

                if (error !== null) {
                    (this._errors[field] ??= []).push(error);

                    break;
                }
            }
        }
    }

    validateRule(rule, parameter, value, field) {
        const isEmpty = value === null || value === undefined || String(value).trim() === '';

        if (rule !== 'required' && isEmpty) {
            return null;
        }

        switch (rule) {
            case 'required':
                return isEmpty ? `The ${field} field is required.` : null;
            case 'min':
                return String(value).length < Number(parameter)
                    ? `The ${field} must be at least ${parameter} characters.`
                    : null;
            case 'max':
                return String(value).length > Number(parameter)
                    ? `The ${field} may not be greater than ${parameter} characters.`
                    : null;
            case 'url':
                return isValidUrl(String(value).trim()) ? null : `The ${field} must be a valid URL.`;
            case 'integer':
                return /^-?\d+$/.test(String(value).trim())
                    ? null
                    : `The ${field} must be an integer.`;
            case 'slug':
                return SLUG.test(String(value).trim())
                    ? null
                    : `The ${field} may only contain lowercase letters, numbers and dashes.`;
            case 'in':
                return String(parameter).split(',').includes(String(value))
                    ? null
                    : `The selected ${field} is invalid.`;
            default:
                return null;
        }
    }
}

export function isValidUrl(value) {
    if (value === '') {
        return false;
    }

    try {
        const url = new URL(value);

        return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.host);
    } catch {
        return false;
    }
}
