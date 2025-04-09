import type { Quote } from "@covalenthq/client-sdk";
import { z } from "zod";

/**
 * A type-safe Zod enum referencing valid quote currencies for Covalent/GoldRush.
 * If Covalent adds new ones, we can add them here as needed.
 * @type {z.ZodEnum<["USD", "CAD", "EUR", "SGD", "INR", "JPY", "VND", "CNY", "KRW", "RUB", "TRY", "NGN", "ARS", "AUD", "CHF", "GBP"]>}
 */
export const QUOTE_VALUES = z.enum([
    "USD",
    "CAD",
    "EUR",
    "SGD",
    "INR",
    "JPY",
    "VND",
    "CNY",
    "KRW",
    "RUB",
    "TRY",
    "NGN",
    "ARS",
    "AUD",
    "CHF",
    "GBP",
]);

/**
 * Array of valid quote currency strings derived from QUOTE_VALUES.
 * @type {readonly Quote[]}
 */
export const validQuoteValues: readonly Quote[] =
    QUOTE_VALUES.options as Quote[];
