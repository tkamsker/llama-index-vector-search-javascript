# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

- [Submitting a Pull Request (PR)](#submitting-a-pull-request-pr)
- [Setting up the development environment](#setting-up-the-development-environment)
- [Submission Guidelines](#submit)
  - [Submit an Issue](#submit-issue)
- [Running unit tests](#running-unit-tests)
- [Code style](#code-style)
- [Adding new azd environment variables](#adding-new-azd-environment-variables)

## Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

- Search the repository (<https://github.com/Azure-Samples>]/[repository-name]/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
- Make your changes in a new git fork
- Follow [Code style conventions](#code-style)
- [Run the tests](#running-unit-tests) (and write new ones, if needed)
- Commit your changes using a descriptive commit message
- Push your fork to GitHub
- In GitHub, create a pull request to the `main` branch of the repository
- Ask a maintainer to review your PR and address any comments they might have

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue
Before you submit an issue, search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.  Providing the following information will increase the
chances of your issue being dealt with quickly:

* **Overview of the Issue** - if an error is being thrown a non-minified stack trace helps
* **Version** - what version is affected (e.g. 0.1.2)
* **Motivation for or Use Case** - explain what are you trying to do and why the current behavior is a bug for you
* **Browsers and Operating System** - is this a problem with all browsers?
* **Reproduce the Error** - provide a live example or a unambiguous set of steps
* **Related Issues** - has a similar issue been reported before?
* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit)

You can file new issues by providing the above information at the corresponding repository's issues link: https://github.com/Azure-Samples/llama-index-vector-search-javascript/issues/new].

## Setting up the development environment

Install the development dependencies:

```shell
pnpm install
```

Run the development server:

```shell
pnpm dev
```

Build the project:

```shell
pnpm build
```

## Running unit tests

Run the tests:

```shell
pnpm test
```

## Code style

Run the linter for code style checks:

```shell
pnpm lint
```

## Adding new azd environment variables

When adding new azd environment variables, please remember to update:

1. App Service's [azure.yaml](./azure.yaml)
1. [ADO pipeline](.azdo/pipelines/azure-dev.yml).
1. [Github workflows](.github/workflows/azure-dev.yml)

That's it! Thank you for your contribution!
