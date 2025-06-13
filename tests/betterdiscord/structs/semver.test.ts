import {test, expect, describe} from "bun:test";
import {regex, comparator} from "@structs/semver";

describe("Semver", () => {
    describe("regex", () => {
        test("should match valid semver strings", () => {
            const validVersions = [
                "1.0.0",
                "1.0.0-alpha",
                "1.0.0-alpha.1",
                "1.0.0-0.3.7",
                "1.0.0-x.7.z.92",
                "1.0.0+001",
                "1.0.0-alpha+001",
                "1.0.0-beta.11.sha.123",
                "10.20.30",
                "0.0.1"
            ];

            for (const version of validVersions) {
                expect(regex.test(version)).toBe(true);
            }
        });

        test("should not match invalid semver strings", () => {
            const invalidVersions = [
                "1",
                "1.0",
                "1.0.0-",
                "1.0.0-.",
                "1.0.0+",
                "1.0.0+.",
                "a.b.c",
                "1.0.0.0",
                "1.0.0-alpha..1",
                "+invalid",
                "-invalid",
                "-1.0.0",
                "1.0.0-alpha_beta",
                "1.0.0-alpha.."
            ];

            for (const version of invalidVersions) {
                expect(regex.test(version)).toBe(false);
            }
        });

        test("should match valid build metadata formats", () => {
            const validVersions = [
                "1.0.0+build.123",
                "1.0.0+build.123.abc",
                "1.0.0+0123",
                "1.0.0+COMMIT-SHA",
                "1.0.0+21AF26D3.117B344092BD",
                "1.0.0-alpha.1+exp.sha.5114f85",
                "1.0.0+meta-valid",
                "1.0.0-beta+exp.sha.5114f85",
                "1.0.0-alpha.beta+789",
                "1.0.0+a-b.c-d"
            ];

            for (const version of validVersions) {
                expect(regex.test(version)).toBe(true);
            }
        });

        test("should not match invalid build metadata formats", () => {
            const invalidVersions = [
                "1.0.0+",
                "1.0.0+.",
                "1.0.0+build..123",
                "1.0.0+build.123.",
                "1.0.0++build.123",
                "1.0.0+build.123+meta",
                "1.0.0+build@123",
                "1.0.0+build_123",
                "1.0.0+bu!ld",
                "1.0.0+.123",
                "1.0.0+123.",
                "1.0.0+a..b"
            ];

            for (const version of invalidVersions) {
                expect(regex.test(version)).toBe(false);
            }
        });
    });

    describe("comparator", () => {
        test("should handle regular version comparisons", () => {
            const cases = [
                // [current, remote, expected]
                ["1.0.0", "1.0.0", 0], // equal
                ["1.0.0", "1.0.1", 1], // remote is greater
                ["1.0.1", "1.0.0", -1], // current is greater
                ["1.0.0", "2.0.0", 1], // major version bump
                ["2.0.0", "1.0.0", -1], // major version downgrade
                ["1.2.3", "1.2.4", 1], // patch bump
                ["1.2.0", "1.3.0", 1], // minor bump
                ["2.0.0", "1.9.9", -1], // major takes precedence
            ];

            for (const [current, remote, expected] of cases) {
                expect(comparator(current, remote)).toBe(expected);
            }
        });

        test("should handle prerelease versions", () => {
            const cases = [
                ["1.0.0", "1.0.0-alpha", -1], // prerelease is lower than release
                ["1.0.0-alpha", "1.0.0", 1], // prerelease is lower than release
                ["1.0.0-alpha", "1.0.0-alpha.1", 1], // numeric is higher than non-numeric
                ["1.0.0-alpha.1", "1.0.0-alpha.2", 1], // numeric comparison
                ["1.0.0-alpha", "1.0.0-beta", 1], // alphabetical order
                ["1.0.0-beta", "1.0.0-alpha", -1], // alphabetical order
                ["1.0.0-alpha.1", "1.0.0-alpha.beta", 1], // numeric vs non-numeric
                ["1.0.0-alpha.beta", "1.0.0-beta", 1] // depth comparison
            ];

            for (const [current, remote, expected] of cases) {
                expect(comparator(current, remote)).toBe(expected);
            }
        });

        test("should handle build metadata", () => {
            const cases = [
                ["1.0.0+build.1", "1.0.0+build.2", 0], // build metadata doesn't affect precedence
                ["1.0.0", "1.0.0+build", 0], // build metadata doesn't affect precedence
                ["1.0.0-alpha+build", "1.0.0-alpha", 0], // build metadata doesn't affect precedence
                ["1.0.0+build.1", "1.0.1+build.1", 1], // version takes precedence over build
                ["1.0.0-alpha+build", "1.0.0+build", 1] // prerelease takes precedence over build
            ];

            for (const [current, remote, expected] of cases) {
                expect(comparator(current, remote)).toBe(expected);
            }
        });

        test("should handle invalid versions", () => {
            const cases = [
                ["invalid", "1.0.0", 0], // invalid current version
                ["1.0.0", "invalid", 0], // invalid remote version
                ["invalid", "invalid", 0], // both invalid
                ["", "", 0], // empty strings
                ["1.0", "1.0.0", 0], // incomplete version
                ["1", "1.0.0", 0] // incomplete version
            ];

            for (const [current, remote, expected] of cases) {
                expect(comparator(current, remote)).toBe(expected);
            }
        });

        test("should handle numeric edge cases", () => {
            const cases = [
                ["1.0.0", "01.0.0", 0], // leading zeros
                ["1.0.00", "1.0.0", 0], // trailing zeros
                ["1.0.0", "1.0.0000", 0], // multiple zeros
                ["1.2.3", "1.02.003", 0], // mixed leading zeros
                ["10.0.0", "2.0.0", -1], // proper numeric comparison
                ["2.0.0", "10.0.0", 1] // proper numeric comparison
            ];

            for (const [current, remote, expected] of cases) {
                expect(comparator(current, remote)).toBe(expected);
            }
        });

        test("should handle complex prerelease combinations", () => {
            const cases = [
                ["1.0.0-alpha.1", "1.0.0-alpha.1.0", 1],
                ["1.0.0-alpha.beta", "1.0.0-alpha.1", -1],
                ["1.0.0-beta.2", "1.0.0-beta.11", 1],
                ["1.0.0-beta.11", "1.0.0-rc.1", 1],
                ["1.0.0-rc.1", "1.0.0", 1],
                ["1.0.0-alpha", "1.0.0-alpha.beta", 1]
            ];

            for (const [current, remote, expected] of cases) {
                expect(comparator(current, remote)).toBe(expected);
            }
        });

        test("should handle complex build metadata scenarios", () => {
            const cases: Array<[string, string, number]> = [
                // Build metadata should be ignored in precedence
                ["1.0.0+build.123", "1.0.0+build.456", 0],
                ["1.0.0+meta", "1.0.0", 0],
                ["1.0.0", "1.0.0+meta", 0],

                // Prerelease versions with build metadata
                ["1.0.0-alpha+build.123", "1.0.0-alpha+build.456", 0],
                ["1.0.0-alpha+SHA", "1.0.0-alpha+COMMIT", 0],

                // Complex combinations of prerelease and build metadata
                ["1.0.0-alpha.1+build.123", "1.0.0-alpha.1+build.456", 0],
                ["1.0.0-beta+exp.sha.5114f85", "1.0.0-beta+exp.sha.abc123", 0],

                // Build metadata with version differences
                ["1.0.0+build.1", "1.0.1+build.1", 1],
                ["2.0.0+build.123", "1.0.0+build.123", -1],

                // Build metadata with prerelease differences
                ["1.0.0-alpha+build.1", "1.0.0-beta+build.1", 1],
                ["1.0.0+build.1", "1.0.0-alpha+build.1", -1],

                // Identical versions with different metadata formats
                ["1.0.0+build.1", "1.0.0+001", 0],
                ["1.0.0+sha.123", "1.0.0+SHA.123", 0],

                // Complex identifiers in build metadata
                ["1.0.0+21AF26D3", "1.0.0+117B344092BD", 0],
                ["1.0.0-beta+exp.sha.5114f85", "1.0.0-beta+exp.sha.5114f85.build.123", 0]
            ];

            for (const [current, remote, expected] of cases) {
                expect(comparator(current, remote)).toBe(expected);
            }
        });
    });
});
