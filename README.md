# actions-swing

A powerful development kit for GitHub Actions 🏌️

> [!WARNING]
> This package is still in development and may not be stable. Use at your own risk.

## Installation

```console
$ npm install actions-swing # npm
$ yarn add actions-swing    # yarn
$ pnpm add actions-swing    # pnpm
```

## Usage

### `runtime.osReleaseId()`

Returns the `ID` field of the `/etc/os-release` file.

```typescript
import { runtime } from 'actions-swing';

const osReleaseId = await runtime.getOsReleaseId();
```

### `pkg.install()`

Installs package(s) using the system package manager on Linux.

```typescript
import { pkg } from 'actions-swing';

await pkg.install(['vim', 'git']);
await pkg.install(['vim', 'git'], { sudo: true });
```

### `pkg.uninstall()`

Uninstalls package(s) using the system package manager on Linux.

```typescript
import { pkg } from 'actions-swing';

await pkg.uninstall(['vim', 'git']);
await pkg.uninstall(['vim', 'git'], { sudo: true });
```

## License

MIT
