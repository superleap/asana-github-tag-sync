### Contributing to Super Leap projects

Super Leap open source projects are experimental packages that mostly serve as tutorials for various tooling purposes. Some examples include CLI tools, project management, 3rd party integrations, ES6+. While some packages might be useful you are advised to contribute only if you intend to use these packages.  

### `master` branch is unsafe

We will do our best to keep `master` in good shape, with tests passing at all times. Superleap.xyz projects follow JIRA standard issue naming: 
- project name initials
- issue number
- a simple dash
- branch description

### Test Suite

Use `npm test` to run the full test suite with eslint and code quality checks.

Just make sure to run the whole test suite before submitting a pull request!

### Pull Requests

**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

**Before** submitting a pull request, please make sure the following is done:

- Fork the repo and create your branch from `master`
- Branch naming follows `gils{issue-number[0-9]+}-{pull-request-description}` notation
- PR has tests / docs demo, and is linted (`npm test`).
- If you've added code that should be tested, add tests!
- If you've changed APIs, update the documentation.
- Commits are done through [commitizen](https://commitizen.github.io/cz-cli/) `git cz`
- Description explains the issue / use-case resolved, and auto-closes the related issue(s) (http://tr.im/vFqem).

## Style Guide

Eslint is fully configured with `eslint:recommended`.
You can check the status of your code styling by simply running: `gulp lint`

Simmilarity and compatibility with a more common standard will be documented at a later date. For now `.eslintrc` has sections commented just as they appear in the [eslint rules](http://eslint.org/docs/rules/).

### Code Conventions

* Use semicolons `;`
* 2 spaces for indentation (no tabs)
* Prefer `'` over `"` other than JSON
* Write "attractive" code
* Write ES7 code

## License

By contributing to the `superleap/github-issues-label-sync` GitHub repository, you agree that your contributions will be licensed under its BSD license.
