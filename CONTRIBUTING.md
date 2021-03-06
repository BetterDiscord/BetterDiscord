# Contributing to BetterDiscord

Thanks for taking the time to contribute!

The following is a set of guidelines for contributing to BetterDiscord. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request. These guidelines have been adapted from [Atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md).

#### Table Of Contents

[Code of Conduct](#code-of-conduct)

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
  * [BetterDiscord Architecture](#betterdiscord-architecture)

[How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs)
  * [Suggesting Enhancements](#suggesting-enhancements)
  * [Your First Code Contribution](#your-first-code-contribution)
  * [Pull Requests](#pull-requests)

[Styleguides](#styleguides)
  * [Git Commit Messages](#git-commit-messages)
  * [JavaScript Styleguide](#javascript-styleguide)
  * [CSS Styleguide](#css-styleguide)

[Additional Notes](#additional-notes)
  * [Issue Labels](#issue-labels)

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct from the Contributor Covenant](https://www.contributor-covenant.org/version/1/4/code-of-conduct.html). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## What should I know before I get started?

### BetterDiscord Architecture

BetterDiscord is currently broken up into two main pieces--the local injector, and the renderer application.

#### Injector

The injector is the piece that runs on the user's computer, and the piece added by the [installer](https://github.com/rauenzi/BBDInstaller). The main job of this package is to inject into Discord and load the renderer package. The injector and its code lives in the `injector` folder.

#### Renderer Application

This is the main payload of BetterDiscord. This is what gets linked executed in the renderer context by the [injector](#injector). This portion is where most of the user interaction and development will be. This module is responsible for loading plugins and themes, as well as handling settings, emotes and more.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for BetterDiscord. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

Before creating bug reports, please check [this list](#before-submitting-a-bug-report) as you might find out that you don't need to create one. When you are creating a bug report, please [include as many details as possible](#how-do-i-submit-a-good-bug-report). Fill out [the required template](https://github.com/rauenzi/BetterDiscordApp/blob/master/.github/ISSUE_TEMPLATE/bug-report.md), the information it asks for helps us resolve issues faster.

> **Note:** If you find a **Closed** issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

#### Before Submitting A Bug Report

* **Try [repairing your installation](https://github.com/rauenzi/BetterDiscordApp#installation).** This can often fix issues where Discord has overwritten the injector or corrupted data files.
* **Check the [#faq channel](https://discord.gg/2HScm8j)** on our support server for answers to many questions. Also check the **#announcements** channel for any recent announcements about breaking changes.
* **Perform a [search](https://github.com/rauenzi/BetterDiscordApp/issues)** to see if the problem has already been reported. If it has **and the issue is still open**, add a :+1: to the existing issue instead of opening a new one.

#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). After you've determined this is a new bug using the steps from above, create an issue and provide the following information by filling in [the template](https://github.com/rauenzi/BetterDiscordApp/blob/master/.github/ISSUE_TEMPLATE/bug-report.md).

Explain the problem and include additional details to help maintainers reproduce the problem:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible. For example, start by explaining how you started Discord, e.g. which addons exactly you used, and what actions were taken. When listing steps, **don't just say what you did, but explain how you did it**. For example, if you opened a menu, explain if you used the mouse, or a keyboard shortcut or something else entirely.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples. If you're providing snippets in the issue, use [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.
* **If you're reporting that Discord/BetterDiscord crashed**, include a crash report with a stack trace from the console. To open the [console](https://developers.google.com/web/tools/chrome-devtools/) press `ctrl`+`shift`+`i` and click the `console` tab at the top. You should see red errors toward the bottom of this page. Include the crash report in the issue in a [code block](https://help.github.com/articles/markdown-basics/#multiple-lines), a [file attachment](https://help.github.com/articles/file-attachments-on-issues-and-pull-requests/), a [gist](https://gist.github.com/) (and provide link to that gist), or even a screenshot of the error.
* **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened and share more information using the guidelines below.

Provide more context by answering these questions:

* **Did the problem start happening recently** (e.g. after updating to a new version of Discord/BetterDiscord) or was this always a problem?
* If the problem started happening recently, what's the version and release channel as well as the versions of BetterDiscord?
* **Can you reliably reproduce the issue?** If not, provide details about how often the problem happens and under which conditions it normally happens.

Include details about your configuration and environment:

* **Which version and release channel of Discord are you using?** The version looks something like `0.0.306` and the release channels are stable, canary, and ptb.
* **What's the name and version of the OS you're using**? Ideally there are no cross-compatibility issues, but it does happen.
* **Which plugins/themes do you have installed?** You can provide a list or screenshot of the folder.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for BetterDiscord, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion and find related suggestions.

Before creating enhancement suggestions, please check [this list](#before-submitting-an-enhancement-suggestion) as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please [include as many details as possible](#how-do-i-submit-a-good-enhancement-suggestion). Fill in [the template](https://github.com/rauenzi/BetterDiscordApp/blob/master/.github/ISSUE_TEMPLATE/feature_request.md), including the steps that you imagine you would take if the feature you're requesting existed.

#### Before Submitting An Enhancement Suggestion

* **Check if there's already a plugin which provides that enhancement.**
* **Perform a [cursory search](https://guides.github.com/features/issues/)** to see if the enhancement has already been suggested. If it has, add a :+1: to the existing issue instead of opening a new one.

#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://guides.github.com/features/issues/). After you've determined this is a new suggestion using the steps from above, create an issue and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include copy/pasteable snippets which you use in those examples, as [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part of BetterDiscord which the suggestion is related to.
* **Explain why this enhancement would be useful** to most BetterDiscord users and isn't something that can or should be implemented as a plugin.

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through `help-wanted` issues or any issues labelled `can't reproduce`.

#### Local development

BetterDiscord and the injector can be developed locally. First, clone the repo and run `npm install && npm run build-all` and locate the `dist` folder. Next you'll need to setup the injector to use your local files. In order to do this, you'll need to locate your local injector installation. Relative to your `Discord.exe` it would be in `./resources/app`. Modify the `./resources/app/betterdiscord/config.json` file and set `localPath` to the **absolute** path of your `dist` folder from  before. Then for this to take effect, you'll need to fully restart Discord. Any future modifications to the remote app (`dist` folder) will be picked up on Discord reload.

### Pull Requests

Please follow these steps to have your contribution considered by the maintainers:

1. Use a pull request template, if one exists.
2. Follow the [styleguides](#styleguides)
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing <details><summary>What if the status checks are failing?</summary>If a status check is failing, and you believe that the failure is unrelated to your change, please leave a comment on the pull request explaining why you believe the failure is unrelated. A maintainer will re-run the status check for you. If we conclude that the failure was a false positive, then we will open an issue to track that problem with our status check suite.</details>

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* When only changing documentation, include `[ci skip]` in the commit title

### JavaScript Styleguide

All JavaScript must adhere to the [ESLint rules](https://github.com/rauenzi/BetterDiscordApp/blob/master/.eslintrc) of the repo.

Some other style related points not covered by ESLint:

* Use verbose variable names
* Prefer to use react patches over DOM manipulation when possible
* Prefer to use separate components from Discord when possible
* Inline `export`s with expressions whenever possible
  ```js
  // Use this:
  export default class ClassName {
  
  }

  // Instead of:
  class ClassName {

  }
  export default ClassName
  ```
* Place class properties in the following order:
    * Class methods and properties (methods starting with `static`)
    * Instance methods and properties
* Place requires in the following order:
    * Built in Node Modules (such as `path`)
    * Repo level global imports (such as `modules`, `builtins`)
    * Local Modules (using relative paths)
* Prefer to import whole modules instead of singular functions
    * Keep modules namespaced and organized
    * This includes Node Modules (such as `fs`)
```js
const fs = require("fs"); // Use this
const {readFile, writeFile} = require("fs"); // Avoid this

import Utilities from "./utilities"; // Use this
import {deepclone, isEmpty} from "./utilties"; // Avoid this
```

### CSS Styleguide

All CSS must adhere to the [Stylelint rules](https://github.com/rauenzi/BetterDiscordApp/blob/stable/.stylelintrc) of the repo.

Some other style related points not covered by ESLint:

* Use verbose class names where applicable
* Keep css files modular
* Avoid conflicts with Discord's classes

## Additional Notes

### Issue Labels

This section lists the labels we use to help us track and manage issues. Please open an issue if you have suggestions for new labels.

[GitHub search](https://help.github.com/articles/searching-issues/) makes it easy to use labels for finding groups of issues or pull requests you're interested in. For example, you might be interested in [bugs that have not been able to be reproduced](https://github.com/rauenzi/BetterDiscordApp/issues?q=is%3Aopen+label%3A%22can%27t+reproduce%22+label%3A%22bug%22). To help you find issues, each label is listed with search links for finding open items with that label. We encourage you to read about [other search filters](https://help.github.com/articles/searching-issues/) which will help you write more focused queries.

#### Type of Issue and Issue State

| Label name | Description | View All |
| --- | --- | --- |
| `awaiting response` | Waiting for a response from the user, issues with this tag are prone to pruning. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/bug) |
| `bug` | Issue related to a bug report, may or may not be yet confirmed. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/awaiting%20response) |
| `can't fix` | Issues which are invalid or are a limitation of something else like Electron. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/can%27t%20fix) |
| `can't reproduce` | Reported bugs that could not be confirmed, help welcome. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/can%27t%20reproduce) |
| `confirmed` | Confirmed bugs to be actively worked. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/confirmed) |
| `duplicate` | Issues which are duplicates of other issues, i.e. they have been reported before. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/duplicate) |
| `enhancement` | Feature or improvement suggestion. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/enhancement) |
| `help wanted` | Help from the community appreciated. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/help%20wanted) |
| `needs info` | Issue did not supply enough information to take action on. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/needs%20info) |
| `question` | Questions more than bug reports or feature requests (e.g. how do I do X). | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/question) |
| `wontfix` | Decision has been made not to fix these issues at least for now. | [View All](https://github.com/rauenzi/BetterDiscordApp/labels/wontfix) |
