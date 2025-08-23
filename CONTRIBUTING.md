# Contributing to This Project

You're interested in making this project better? Thank you! Below are some ways to make me really appreciate your contributions.

## How to build the app

### Requirements

- The Nova app, of course.
- [Node](https://nodejs.org/) and [the **pnpm** package manager](https://pnpm.io): to build the TypeScript source for this extension.
- **XCode**: to build the Tree Sitter library (Command Line Tools from Apple may suffice)

> [!NOTE]
> You can use [mise](https://mise.jdx.dev) to manage _many_ development environments, and if you have it set up on your machine, you will get the same versions of Node and pnpm as this project uses automatically.

### Setting Up the Dev Environment

First, install the dependencies and build the source for the extension:

```shell
pnpm install
pnpm run build
```

Next, run the `update_server.sh` script to download the Rust Analyzer binary, then rename it manually:

```shell
cd Rust.novaextension/bin/
./update_server.sh
mv rust-analyzer-new rust-analyzer
cd ../..
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

Then you can build the syntax definitions. From the project root, run the `./tree-sitter/compile_parser.sh` script and then move the library to the `Syntaxes` folder.

```sh
./tree-sitter/compile_parser.sh "$(pwd)/tree-sitter/tree-sitter-rust" /Applications/Nova.app
mv ./tree-sitter/libtree-sitter-rust.dylib ./Rust.novaextension/Syntaxes/libtree-sitter-rust.dylib
```

Now you can test the extension in Nova by selecting **Extensions -> Activate Project as Extension**. Open a Rust project to see it in action. You can monitor logs and errors by selecting **Extensions -> Show Extension Console** from the menus in the Rust project.

## Administrative details

### Issues

- Please use an issue template if appropriate.
- Please be as descriptive as you can. It'll save us both time on follow-up questions.

### Pull Requests

My biggest request for pull requests is that they address a single concern. That could mean a single feature, or a single file of configuration parameters. Please make it manageable for me to review your changes.

### Commits

I am in the habit of using a loose version of the [Angular commit message style guide](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit), which has lately been subsumed by [Conventional Commits](https://www.conventionalcommits.org/). I appreciate this format for making it easier to follow development when scanning commit logs. If you don't follow this style, there's a greater chance your commits will get squash merged.

Related to my general request that pull requests are limited in scope, please also don't make massive commits. Keep the line count manageable so I can follow what you're changing.
