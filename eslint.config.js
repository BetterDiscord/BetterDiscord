import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import stylistic from "@stylistic/eslint-plugin";


// Make sure typescript rules only affect typescript for now
ts.configs.recommended.forEach(r => r.files = ["**/*.ts", "**/*.tsx"]);

export default ts.config(
    // Globally apply recommended js rules
    js.configs.recommended,
    ...ts.configs.recommended,

    // Make browser and node globals generally available
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },

    // Global ignore dirs
    {
        ignores: ["dist/", "assets/"]
    },

    // Trailing spaces, and other stylistic rules
    // see more rules here: https://eslint.style/rules
    {
        plugins: {
            "@stylistic": stylistic
        },
        rules: {
            "@stylistic/no-trailing-spaces": ["error"]
        }
    },

    // Setup general JS rules
    {
        files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
        rules: {
            "accessor-pairs": "error",
            "block-spacing": ["error", "never"],
            "brace-style": ["error", "stroustrup", {allowSingleLine: true}],
            "curly": ["error", "multi-line", "consistent"],
            "dot-location": ["error", "property"],
            "dot-notation": "error",
            "func-call-spacing": "error",
            "handle-callback-err": "error",
            "key-spacing": "error",
            "keyword-spacing": "error",
            // "new-cap": ["error", {newIsCap: true}],
            "no-array-constructor": "error",
            "no-caller": "error",
            "no-console": "error",
            "no-duplicate-imports": "error",
            "no-else-return": "error",
            "no-eval": "error",
            "no-floating-decimal": "error",
            "no-implied-eval": "error",
            "no-iterator": "error",
            "no-label-var": "error",
            "no-labels": "error",
            "no-lone-blocks": "error",
            "no-mixed-spaces-and-tabs": "error",
            "no-multi-spaces": "error",
            "no-multi-str": "error",
            "no-new": "error",
            "no-new-func": "error",
            "no-new-object": "error",
            "no-new-wrappers": "error",
            "no-octal-escape": "error",
            "no-path-concat": "error",
            "no-proto": "error",
            "no-prototype-builtins": "off",
            "no-redeclare": ["error", {builtinGlobals: true}],
            "no-self-compare": "error",
            "no-sequences": "error",
            "no-shadow": ["warn", {builtinGlobals: false, hoist: "functions"}],
            "no-tabs": "error",
            "no-template-curly-in-string": "error",
            "no-throw-literal": "error",
            "no-undef": "error",
            "no-undef-init": "error",
            "no-unmodified-loop-condition": "error",
            "no-unneeded-ternary": "error",
            "no-useless-call": "error",
            "no-useless-computed-key": "error",
            "no-useless-constructor": "error",
            "no-useless-rename": "error",
            "no-var": "error",
            "no-whitespace-before-property": "error",
            "object-curly-spacing": ["error", "never", {objectsInObjects: false}],
            "object-property-newline": ["error", {allowAllPropertiesOnSameLine: true}],
            "operator-linebreak": [
                "error",
                "none",
                {overrides: {"?": "before", ":": "before", "&&": "before"}}
            ],
            "prefer-const": "error",
            "quote-props": ["error", "consistent-as-needed", {keywords: true}],
            "quotes": ["error", "double", {allowTemplateLiterals: true}],
            "rest-spread-spacing": "error",
            "semi": "error",
            "semi-spacing": "error",
            "space-before-blocks": "error",
            "space-in-parens": "error",
            "space-infix-ops": "error",
            "space-unary-ops": [
                "error",
                {words: true, nonwords: false}
            ],
            "spaced-comment": ["error", "always", {exceptions: ["-", "*"]}],
            "template-curly-spacing": "error",
            "wrap-iife": ["error", "inside"],
            "yield-star-spacing": "error",
            "yoda": "error"
        },
    },

    // Setup typescript-specific rules
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            // typescript does these better and eslint can't detect most
            "no-undef": "off",
            "no-redeclare": "off",
            "@typescript-eslint/no-explicit-any": ["off"],
            "@typescript-eslint/no-unnecessary-type-constraint": ["off"],
            "@typescript-eslint/array-type": ["error", {"default": "array-simple"}],
            "@typescript-eslint/no-unused-vars": ["error", {argsIgnorePattern: "^_", varsIgnorePattern: "^_"}]
        }
    },

    // Setup rules for scripts
    {
        files: ["scripts/*"],
        rules: {
            "no-console": "off"
        }
    },

    // Setup rules for renderer package
    {
        files: ["src/betterdiscord/**/*"],
        ...react.configs.flat.recommended,
    },
    {
        files: ["src/betterdiscord/**/*"],
        ...reactHooks.configs["recommended-latest"]
    },
    {
        files: ["src/betterdiscord/**/*"],
        settings: {
            react: {
                version: "18.3"
            }
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                DiscordNative: false,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                }
            }
        },
        rules: {
            "react/display-name": "off",
            "react/prop-types": "off",
            "react/jsx-key": "off",
            "react/jsx-no-target-blank": "error",
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error"
        }
    },
);