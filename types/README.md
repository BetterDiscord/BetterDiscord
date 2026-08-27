# @betterdiscord/types

TypeScript type definitions for the [BetterDiscord](https://betterdiscord.app) plugin API (`BdApi`).

These types are generated from the BetterDiscord source and describe the global `BdApi` object,
the `window.BdApi` augmentation, and the `BetterDiscord` namespace available to plugins.

## Installation

```sh
npm install --save-dev @betterdiscord/types
```

The package declares related type packages (`@types/react`, `@types/react-dom`,
`@types/react-reconciler`) as dependencies, so they will be installed alongside it.

## Usage

Add the types to your `tsconfig.json` so they are picked up globally:

```jsonc
{
    "compilerOptions": {
        "types": ["@betterdiscord/types"]
    }
}
```

Or reference them directly from a source file:

```ts
/// <reference types="@betterdiscord/types" />
```

Once referenced, `BdApi` and the `BetterDiscord` namespace are available globally with full
type information:

```ts
const { Webpack, Patcher } = new BdApi("MyPlugin");
```

## Versioning

This package is versioned independently of BetterDiscord itself. Type changes follow semver
based on the shape of the API surface, not the BetterDiscord release version.

## License

[Apache-2.0](./LICENSE)
