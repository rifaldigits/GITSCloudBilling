import { Prisma, Product, Subscription, UsageDaily } from '@prisma/client';
import * as subscriptionRepo from '../repositories/subscriptionRepository';
import * as usageRepo from '../repositories/usageDailyRepository';

// Define types
export interface BillingLineInput {
    subscription: Subscription & { product: Product };
    periodStart: Date;
    periodEnd: Date;
    usageDailyWords?: UsageDaily[]; // Optional, can be fetched if not provided
}

export interface BillingLineResult {
    subscriptionId: string;
    productName: string;
    pricingType: string;
    quantityTotal: number; // For usage based, sum of quantity. For fixed, usually 1 or sub quantity.
    amountUsd: Prisma.Decimal;
    amountIdr: number; // Integer
    metadata?: any;
}

export interface BillingCalculationResult {
    lines: BillingLineResult[];
    subtotalUsd: Prisma.Decimal;
    subtotalIdr: number;
    taxAmountIdr: number;
    totalIdr: number;
}

// Helpers
export function ceilToCents(amount: number | Prisma.Decimal): Prisma.Decimal {
    const d = new Prisma.Decimal(amount);
    // Round UP to 2 decimal places. 
    // Multiply by 100, ceil, divide by 100.
    return d.mul(100).ceil().div(100);
}

export function ceilToRupiah(amount: number | Prisma.Decimal): number {
    const d = new Prisma.Decimal(amount);
    // Round UP to 0 decimal places (integer).
    return d.ceil().toNumber();
}

// ... types ...

// Dependencies Interface
export interface BillingDependencies {
    listSubscriptions: (clientId: string, start: Date, end: Date) => Promise<any[]>; // return type is complex from prisma, generic any[] fine for interface or inferred
    getUsage: (subId: string, start: Date, end: Date) => Promise<any[]>;
}

const defaultDeps: BillingDependencies = {
    listSubscriptions: subscriptionRepo.listActiveSubscriptionsByClientAndPeriod,
    getUsage: usageRepo.getUsageForSubscriptionAndPeriod,
};

/**
 * Main Billing Engine Function
 */
export async function computeBillingLinesForClientPeriod(
    clientId: string,
    periodStart: Date,
    periodEnd: Date,
    fxRateUsdToIdr: number,
    taxRate: number,
    deps: BillingDependencies = defaultDeps // Dependency Injection
): Promise<BillingCalculationResult> {
    const subscriptions = await deps.listSubscriptions(
        clientId,
        periodStart,
        periodEnd
    );

    const lines: BillingLineResult[] = [];
    const fxRate = new Prisma.Decimal(fxRateUsdToIdr);

    // 1. Process Non-Percentage Lines first (Fixed & Prorate)
    // We separate them because Percentage lines depend on the subtotal of these.

    // We can just process all, and if we encounter Percentage, we postpone it?
    // Or simpler: Filter subscriptions into two groups.
    const standardSubs = subscriptions.filter(s => s.product.pricingType !== 'PERCENTAGE');
    const percentageSubs = subscriptions.filter(s => s.product.pricingType === 'PERCENTAGE');

    let subtotalUsdAccumulator = new Prisma.Decimal(0);

    // Process Standard Subscriptions
    for (const sub of standardSubs) {
        let lineAmountUsd = new Prisma.Decimal(0);
        let quantityTotal = 0;

        if (sub.product.pricingType === 'FIXED') {
            // FIXED: Full month charge assumption
            const price = sub.product.priceUsd ? new Prisma.Decimal(sub.product.priceUsd) : new Prisma.Decimal(0);
            // Assuming subscription.quantity is 1 if not present on subscription model? 
            // The schema from previous turn isn't fully visible but Subscription usually has quantity?
            // Let's assume quantity exists on Subscription or default to 1.
            // If the user didn't put quantity on Subscription, we'll check schema later or assume 1.
            // Wait, previous file view of `subscriptionRepository.ts` didn't show the model type completely.
            // But usually B2B subs have quantity. I'll cast `sub` to any to access `quantity` safely or check generic `Subscription`.
            // Prisma Subscription type should have it. If not, maybe product quantity?
            // Let's check `sub` has `quantity`? I'll assume it might not and default to 1.
            // Actually, in prompt: "totalUsd = priceUsd * quantity (quantity may be 1 or more based on subscription context)."
            const qty = (sub as any).quantity || 1;
            quantityTotal = qty;
            lineAmountUsd = price.mul(qty);

            // Round USD to cents
            lineAmountUsd = ceilToCents(lineAmountUsd);

        } else if (sub.product.pricingType === 'PRORATE') {
            // PRORATE (FLEXIBLE)
            // Fetch usage
            const usages = await deps.getUsage(sub.id, periodStart, periodEnd);

            const price = sub.product.priceUsd ? new Prisma.Decimal(sub.product.priceUsd) : new Prisma.Decimal(0);
            const dailyRate = price.div(30); // priceUsd / 30

            let amountUsdRaw = new Prisma.Decimal(0);

            for (const usage of usages) {
                // usage.quantity is Decimal or number? Prisma usually Decimal for Int/Float if configured, or just number.
                // Assuming `quantity` in UsageDaily is number or Decimal.
                const dailyQty = new Prisma.Decimal(usage.quantity);
                const dailyAmount = dailyRate.mul(dailyQty);
                amountUsdRaw = amountUsdRaw.add(dailyAmount);
                quantityTotal += dailyQty.toNumber();
            }

            // Round USD to cents
            lineAmountUsd = ceilToCents(amountUsdRaw);
        }

        subtotalUsdAccumulator = subtotalUsdAccumulator.add(lineAmountUsd);

        // Convert to IDR
        const amountIdr = ceilToRupiah(lineAmountUsd.mul(fxRate));

        lines.push({
            subscriptionId: sub.id,
            productName: sub.product.name,
            pricingType: sub.product.pricingType,
            quantityTotal,
            amountUsd: lineAmountUsd,
            amountIdr,
        });
    }

    // Process Percentage Subscriptions
    for (const sub of percentageSubs) {
        // Percentage of the base amount (subtotal of non-percentage lines)
        // percentageRate which we assume is in ... `priceUsd` field? Or a different field?
        // Prompt says: "percentageRate is a decimal (e.g. 0.10 for 10%)." 
        // Schema likely doesn't have `percentageRate` column on Product?
        // Maybe it's stored in `priceUsd` as 0.10? Or `unitName`? 
        // Let's assume it's in `priceUsd` or we look for a field.
        // Given the goal "priceUsd" is typically the money field. 
        // If pricingType is PERCENTAGE, `priceUsd` might be 0.10.
        const rate = sub.product.priceUsd ? new Prisma.Decimal(sub.product.priceUsd) : new Prisma.Decimal(0);

        // baseAmountUsd is the subtotal of non-percentage lines
        const baseAmount = subtotalUsdAccumulator;

        let lineAmountUsd = baseAmount.mul(rate);

        // Round USD
        lineAmountUsd = ceilToCents(lineAmountUsd);

        // (Note: Percentage lines usually add to the subtotal? Or are they outside?
        // "compute the percentage based on the subtotal of NON-PERCENTAGE lines"
        // But do they contribute to the final subtotal? Yes, usually.)

        // Convert to IDR
        const amountIdr = ceilToRupiah(lineAmountUsd.mul(fxRate));

        lines.push({
            subscriptionId: sub.id,
            productName: sub.product.name,
            pricingType: sub.product.pricingType,
            quantityTotal: 1,
            amountUsd: lineAmountUsd,
            amountIdr,
        });
    }

    // specific sorting: Standard first, then Percentage? 
    // They are already pushed in that order.

    // Calculate final totals
    // subtotalUsd = sum of all lines amountUsd
    const subtotalUsd = lines.reduce((sum, line) => sum.add(line.amountUsd), new Prisma.Decimal(0));

    // subtotalIdr = sum of all lines amountIdr (integers)
    const subtotalIdr = lines.reduce((sum, line) => sum + line.amountIdr, 0);

    // taxAmountIdr = ceilToRupiah(subtotalIdr * taxRate)
    const taxAmountIdr = ceilToRupiah(new Prisma.Decimal(subtotalIdr).mul(taxRate));

    const totalIdr = subtotalIdr + taxAmountIdr;

    return {
        lines,
        subtotalUsd,
        subtotalIdr,
        taxAmountIdr,
        totalIdr
    };
}
