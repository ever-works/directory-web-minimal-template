import { describe, it, expect } from 'vitest';
import * as analytics from '../index';

describe('@ever-works/plugin-analytics barrel exports', () => {
    it('exports analyticsPlugin', () => {
        expect(analytics.analyticsPlugin).toBeTypeOf('function');
    });

    it('exports resolveAnalyticsConfig', () => {
        expect(analytics.resolveAnalyticsConfig).toBeTypeOf('function');
    });

    it('exports renderAnalyticsScripts', () => {
        expect(analytics.renderAnalyticsScripts).toBeTypeOf('function');
    });

    it('exports renderPlausibleScript', () => {
        expect(analytics.renderPlausibleScript).toBeTypeOf('function');
    });

    it('exports renderUmamiScript', () => {
        expect(analytics.renderUmamiScript).toBeTypeOf('function');
    });

    it('exports renderFathomScript', () => {
        expect(analytics.renderFathomScript).toBeTypeOf('function');
    });

    it('exports renderGa4Script', () => {
        expect(analytics.renderGa4Script).toBeTypeOf('function');
    });

    it('exports renderCustomScript', () => {
        expect(analytics.renderCustomScript).toBeTypeOf('function');
    });

    it('exports escapeAttr', () => {
        expect(analytics.escapeAttr).toBeTypeOf('function');
    });
});
