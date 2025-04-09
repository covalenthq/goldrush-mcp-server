/**
 * Helper function to handle bigint serialization to string in JSON
 *
 * @param {any} value - The value to serialize
 * @returns {string} JSON string with bigints converted to strings
 */
export function stringifyWithBigInt(value: any): string {
    return JSON.stringify(
        value,
        (_, val) => (typeof val === "bigint" ? val.toString() : val),
        2
    );
}
