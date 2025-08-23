# How to build the app

## Requirements

- The Nova app, of course.
- [Node](https://nodejs.org/) and [the **pnpm** package manager](https://pnpm.io): to build the TypeScript source for this extension.
- **XCode**: to build the Tree Sitter library (Command Line Tools from Apple may suffice)

> [!NOTE]
> You can use [mise](https://mise.jdx.dev) to manage _many_ development environments, and if you have it set up on your machine, you will get the same versions of Node and pnpm as this project uses automatically.

## Setting Up the Dev Environment

First, install the Node dependencies for the extension:

```shell
pnpm install
```

Next, run the `update_server.sh` script to download the Rust Analyzer binary:

```shell
./Rust.novaextension/bin/update_server.sh
```

> [!NOTE]
> This is done for users automatically, but in Nova's Developer Mode for extensions any file change triggers a reload of the extension, and thus you'd get stuck in an endless loop. In Dev Mode, the extension skip attempts to update Rust Analyzer.

While you're working on the extension, you likely also want to have syntax highlighting. For that, you’ll need to build the [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) library used for syntax highlighting and symbols.

This project depends on the `tree-sitter-rust` project, so you'll need to pull down the submodule when you clone or after cloning:

- When cloning:

  ```sh
  git clone --recurse-submodules https://github.com.chriskrycho/nova-rust
  ```

- After cloning:

  ```sh
  git submodule update --init --recursive
  ```

## Working on the extension

There are three basic components to the extension:

- the TypeScript source, which is where you will likely spend most of your time
- the `rust-analyzer` binary, which you should not normally need to update other than at installation
- the syntax highlighting parser and definitions

### Compiling TypeScript

To build the TypeScript source for the extension:

```sh
pnpm run build
```

This invokes the TypeScript compiler to type check the source and emit the compiled output into the correct destination.

### Syntax highlighting

> [!NOTE]
> You can rebuild the syntax definitions at any time, but you should generally only need to do this when first setting up the project or when there is an updated version of the `tree-sitter-rust` package.

From the project root, run the `./tree-sitter/compile_parser.sh` script and then move the library to the `Syntaxes` folder.

```sh
./tree-sitter/compile_parser.sh "$(pwd)/tree-sitter/tree-sitter-rust" /Applications/Nova.app
mv ./tree-sitter/libtree-sitter-rust.dylib ./Rust.novaextension/Syntaxes/libtree-sitter-rust.dylib
```

Additionally, the `Rust.novaextension/Queries` directory includes Tree-sitter queries to define the syntax highlighting _rules_ to run against the parser compiled above.

### Installing the extension

Now you can test the extension in Nova by selecting **Extensions -> Activate Project as Extension**. Open a Rust project to see it in action. You can monitor logs and errors by selecting **Extensions -> Show Extension Console** from the menus in the Rust project.
