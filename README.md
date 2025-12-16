<div align="center">
<h1>👾 xTRPC</h1>

Export clean, lightweight TypeScript types from your tRPC router

</div>

> **Fork of [@algora/xtrpc](https://github.com/algoravioli/xtrpc)** - Enhanced for better performance and tRPC 11 compatibility

## What's the problem?

Let's say you've built a tRPC API server and want to use those types in your frontend app (or share them with other projects). The obvious solution is to export the types using TypeScript's declaration file generation with `tsc`.

But here's what goes wrong:

**Your type files become massive**

When TypeScript generates a `.d.ts` file, it includes _everything_ your procedures reference - not just the API inputs and outputs you actually need, but also:

- Internal utility types
- Database models
- Helper functions
- Every dependency of every dependency

Your type file explodes in size, even though consumers only need to know "here's the procedure name, here's what to send, here's what you get back."

**Your internals leak out**

Worse, your tRPC `Context` type (which might contain things like database connections, auth state, and internal services) gets exported too. That's a security risk - you're exposing implementation details that should stay private.

**Everything slows down**

All those extra types mean your IDE has to work much harder. Autocomplete that should take a second now takes 30-60 seconds. Your editor starts to feel sluggish. Type checking crawls.

## How xTRPC solves it

xTRPC takes your router and cleans it up before generating the type file:

1. **Removes implementations** - Strips out all the function bodies from your procedures and middleware, so the types they use don't end up in the output
2. **Hides your context** - Replaces your `Context` type with `any`, keeping your internal types private
3. **Exports just the API shape** - Generates a minimal type file with only what consumers need: procedure names, inputs, and outputs

The result? A tiny, fast type file that keeps your implementation details private whilst maintaining complete type safety.

## Installation

```bash
npm i -D @dios-david/xtrpc
```

## Quick start

### 1. Create a config file

Create `xtrpc.config.json` in your project root:

```json
{
  "input": {
    "routerFile": "src/server/router.ts"
  }
}
```

See [configuration](#configuration) for all available options.

### 2. Generate your types

```bash
npx xtrpc
```

This creates `types/api.d.ts` containing your cleaned router types.

### 3. Use the generated types

```ts
// Export the generated type
export { type AppRouter } from "my-server/types/api";

// Use it in your client
export const client = createTRPCClient<AppRouter>({
  // ... your config
});
```

That's it! Your client now has full type safety without any of the baggage.

## Configuration

Create `xtrpc.config.json` in your project root. Only `input.routerFile` is required - everything else has sensible defaults.

```json
{
  "input": {
    "tsconfigPath": "tsconfig.json",
    "routerFile": "src/server/router.ts",
    "routerTypeName": "AppRouter"
  },
  "output": {
    "filePath": "types/api.d.ts"
  },
  "verbose": false
}
```

| Option                 | Type    | Default            | Description                           |
| ---------------------- | ------- | ------------------ | ------------------------------------- |
| `input.tsconfigPath`   | string  | `"tsconfig.json"`  | Where to find your TypeScript config  |
| `input.routerFile`     | string  | **(required)**     | The file that contains your router    |
| `input.routerTypeName` | string  | `"AppRouter"`      | The name of your exported router type |
| `output.filePath`      | string  | `"types/api.d.ts"` | Where to save the generated types     |
| `verbose`              | boolean | `false`            | Show detailed output whilst running   |

## When to use this

**Monorepos**

You have a server package and a client package that need to share types, but you don't want to couple them together with implementation details.

**Public APIs**

You're building a public API and want to give users a typed SDK without exposing your database schema or internal architecture.

**Large routers**

Your tRPC router has grown large enough that your IDE is noticeably slow when working with it.

**Security-conscious projects**

You need to ensure sensitive types (auth context, database models, internal services) never leave your server codebase.

## How it works

xTRPC uses [ts-morph](https://github.com/dsherret/ts-morph) (a tool for working with TypeScript code) to:

1. Load the file containing your router
2. Find your router type definition
3. Transform it:
   - Replace your `Context` type with `any`
   - Replace middleware bodies with simple pass-through functions
   - Remove procedure implementations
4. Save the cleaned version as a `.d.ts` file

Your actual server code isn't touched - only the generated type file is modified.

## Known limitations

**Go to definition jumps to generated file**

When you use _"Go to Definition"_ in your IDE, it'll take you to the generated `.d.ts` file instead of your actual source code. This could potentially be fixed by generating declaration maps, but we haven't tested that yet.

**Manual configuration required**

You need to tell xTRPC exactly where your router file is - it won't try to find it automatically. This is intentional (for performance reasons), but it does mean a bit of manual setup.

## Contributing

Found a bug? Have an idea? Open an issue or pull request on [GitHub](https://github.com/dios-david/xtrpc).

## Licence

MIT © Algora PBC.

MIT © David Dios

## Acknowledgements

This project is a fork of [@algora/xtrpc](https://github.com/algoravioli/xtrpc), rebuilt for improved performance and tRPC 11 support. Thanks to the original authors for the innovative approach to this problem.
