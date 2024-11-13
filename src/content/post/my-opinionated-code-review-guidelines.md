---
title: "My opinionated code review guidelines"
description: "My opinionated code review guidelines"
pubDate: "October 31 2024"
tags:
  - Software Engineer
---

To me, code review is the fastest way to reveal valuable insights into feature implementation and how developers approach as well as coding style.
By examining code in detail, I can gain knowledge about coding skill, architectural decisions even some minor optimization strategies.

![Talk is cheap](./media/talk-is-cheap.png)

To start the guideline, we need to know [what to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html) (from Google’s Code Review Guidelines).

Review checklist:

This checklist encourage developers assure any changes to the codebase are considered carefully about key factors such as quality, performance, reliability, security and maintainability.

* Quality
  * The code changes have an adequate automation tests with a standard senses of how many tests we should have in each group. Teams can follow testing pyramid or testing trophy.
  * The code changes must respect the pull request title and description, and make sure there is no logical flaws.
  * If there is an exception from unexpected condition that needed to ignore, please create a linked issue to follow  up later.
* Lint
  * Code should be neat and clean. For example, there is no multiple consecutive blank lines or spelling mistake that is easy to be caught by the editor...
  * No issues reported from code analytics tool (ESLint, Ktlint)
* Observability
  * Enough debug logging and tracing
* Performance
  * The choosing solution is appropriate and ready for future scaling.
  * Establishing best practices guideline such as SQL tuning guide line, multi-threading for back end, list rendering for front end...
* Security
  * No sensitive information exposed in the code base.
  * Strictly reviewing all of the attach surface such as form validation

## Merge request creator's responsibilities

* Find the optimal solution to implement the feature:

  * Address the task in the most suitable way.
  * Ensure all requirements are met.
  * Eliminate any potential bugs, logic errors, edge cases, or security vulnerabilities.
* Proactively seek reviews if there has been a delay in receiving feedback.

* Conduct a self-review before submitting a merge request to respect reviewers' time:
  * Keep changes as small as possible. If the merge request involves more than 500 changes, explain the reason clearly and inform the maintainers.
  * Prioritize addressing the specific problem effectively.
  * Ensure thorough testing is in place, and verify that all tests pass.
  * Rebase if you're the sole developer working on the feature branch; otherwise, merge the target branch (the one you're merging into) back into your feature branch.
  * Select a reviewer who could be a team member or a domain expert. The reviewer may suggest alternative solutions or help identify bugs, logic issues, or edge cases.
  * For simple merge requests, such as typo corrections or color code updates, you can assign the request directly to a maintainer.
  * Ensure you've self-reviewed the code for basic issues like linting, code formatting, spelling, and other common errors.
  * You can proactively comment on the merge request in places where decisions are made that require trade-offs or provide context for the reviewer to understand the problem more easily.

## Reviewer's responsibilities

Check the merge request to ensure all acceptance criteria are met.
If the merge request is too large and addresses multiple issues, recommend that the author split it into smaller, more manageable merge requests.
Focus the review on key areas such as overall architecture, code organization, separation of concerns, testing coverage, and readability.
When conducting the review:

* Understand the context of the merge request, including its purpose and how it fits into the broader project.
* Start with the big picture by focusing on high-level concerns first.
* Provide clear feedback, explaining what needs to be changed and why the change is necessary.
* Be respectful and constructive in your feedback, aiming to help improve the code and the developer’s understanding.
* Avoid nitpicking over minor issues that don’t impact the code’s quality, though gentle suggestions can be made.
* Be timely with your review—respond as quickly as possible and avoid prolonging the process unnecessarily.


## Best practices for the code review process

Review Conventions:

* Maintain a Respectful Tone: Foster a polite and constructive dialogue throughout the review process.

* Embrace Different Perspectives: Accept various programming approaches and engage in discussions about the trade-offs, pros, and cons of different solutions. Instead of simply stating that something isn't good or needs improvement, offer your own solution when possible.

* Encourage Questions: Ask questions to gain clarity on issues rather than immediately requesting changes. This promotes understanding and collaboration.

* Limit Ownership Mentions: Refrain from attributing ownership to specific individuals or referencing personal coding styles (e.g., “Mr. A’s code style”). Focus on the code itself rather than the person behind it.

* Use Professional Language: Avoid personal or derogatory terms (e.g., “trash,” “stupid”). Aim for a professional tone in all feedback.

* Be Detailed and Clear: Provide thorough, coherent explanations in your feedback to ensure clarity.

* Be Generous with Minor Issues: When responding to reviews, be understanding and lenient regarding small issues.

* Avoid Sarcasm: Maintain professionalism by steering clear of sarcastic comments.

## Balance

* Error Identification and Design Thinking: While finding errors is crucial, also consider solutions and good design principles that prepare the codebase for future changes.

* Automate Code Style: Establish coding standards and automate checks where possible to reduce the need for excessive commentary.

* Discuss Major Design Changes: If a review leads to significant design changes, consult with other reviewers or domain experts beforehand to assess whether redoing the design is necessary.

## References

* [Code Review Guidelines | GitLab](https://docs.gitlab.com/ee/development/code_review.html)
* [Code Review Developer Guide](https://google.github.io/eng-practices/review/)
