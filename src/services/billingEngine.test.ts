
// Using simple console asserts to avoid dependency on Node test runner if version is old, logic pure.
import assert from 'assert';
import { Prisma } from '@prisma/client';
import { computeBillingLinesForClientPeriod, ceilToCents, ceilToRupiah } from './billingEngine';

// Mock Data
const mockPeriodStart = new Date('2025-01-01');
const mockPeriodEnd = new Date('2025-01-31');
const mockClientId = 'client-123';
const mockFxRate = 16000;
const mockTaxRate = 0.11;

async function runTests() {
    console.log('Starting Billing Engine Tests (DI Mode)...');

    // --- Helper Tests ---
    console.log('Testing Helpers...');
    assert.strictEqual(ceilToCents(10.123).toString(), '10.13');
    assert.strictEqual(ceilToCents(10.1200001).toString(), '10.13');
    assert.strictEqual(ceilToCents(10.12).toString(), '10.12');

    assert.strictEqual(ceilToRupiah(100.1).toString(), '101');
    assert.strictEqual(ceilToRupiah(100.0).toString(), '100');
    assert.strictEqual(ceilToRupiah(100.99).toString(), '101');
    console.log('Helpers Passed.');

    // --- Scenario B: Prorate Google Workspace Example ---
    // 1–5: 70 units at $7 / month
    // 6–12: 65 units
    // Period: 1-12 (implied by usage)
    console.log('Testing Scenario B (Prorate)...');

    const mockDepsB = {
        listSubscriptions: async () => [{
            id: 'sub-prorate',
            product: {
                name: 'GWS Flexible',
                pricingType: 'PRORATE',
                priceUsd: new Prisma.Decimal(7.0) // $7/month
            },
            clientId: mockClientId
        }],
        getUsage: async () => {
            const usage = [];
            // Day 1-5: 70 units
            for (let i = 1; i <= 5; i++) usage.push({ quantity: new Prisma.Decimal(70) });
            // Day 6-12: 65 units
            for (let i = 6; i <= 12; i++) usage.push({ quantity: new Prisma.Decimal(65) });
            return usage;
        }
    };

    const result = await computeBillingLinesForClientPeriod(
        mockClientId, mockPeriodStart, mockPeriodEnd, mockFxRate, mockTaxRate,
        mockDepsB
    );

    const line = result.lines[0];
    assert.ok(line, 'Line should exist');
    assert.strictEqual(line.amountUsd.toString(), '187.84');
    console.log('Scenario B Passed (USD: 187.84).');


    // --- Scenario C: Percentage Fee ---
    console.log('Testing Scenario C (Percentage)...');

    const mockDepsC = {
        listSubscriptions: async () => [
            {
                id: 'sub-fixed',
                product: { name: 'Fixed Tool', pricingType: 'FIXED', priceUsd: new Prisma.Decimal(100.0) },
                clientId: mockClientId
            },
            {
                id: 'sub-mgmt',
                product: { name: 'Mgmt Fee', pricingType: 'PERCENTAGE', priceUsd: new Prisma.Decimal(0.10) }, // 10%
                clientId: mockClientId
            }
        ],
        getUsage: async () => []
    };

    const resultC = await computeBillingLinesForClientPeriod(
        mockClientId, mockPeriodStart, mockPeriodEnd, mockFxRate, mockTaxRate,
        mockDepsC
    );

    const fixedLine = resultC.lines.find(l => l.pricingType === 'FIXED');
    assert.ok(fixedLine, 'Fixed line should exist');
    assert.strictEqual(fixedLine!.amountUsd.toString(), '100');

    const pctLine = resultC.lines.find(l => l.pricingType === 'PERCENTAGE');
    assert.ok(pctLine, 'Percentage line should exist');
    assert.strictEqual(pctLine!.amountUsd.toString(), '10');

    // Totals
    assert.strictEqual(resultC.subtotalUsd.toString(), '110');
    assert.strictEqual(resultC.subtotalIdr, 1760000);
    assert.strictEqual(resultC.taxAmountIdr, 193600);
    assert.strictEqual(resultC.totalIdr, 1953600);

    console.log('Scenario C Passed.');

    console.log('ALL TESTS PASSED.');
}

runTests().catch(e => {
    console.error('TEST FAILED:', e);
    process.exit(1);
});
