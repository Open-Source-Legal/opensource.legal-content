---
title: Harvey Legal Agent Benchmark (LAB)
subject: legal-reasoning
publisher: Harvey
access: Public harness and tasks
homepage: https://github.com/harveyai/harvey-labs
github_url: https://github.com/harveyai/harvey-labs
licenses:
  - id: MIT
    label: MIT repository
    url: https://github.com/harveyai/harvey-labs/blob/main/LICENSE
summary: Give an agent a legal assignment and its working documents, then score the work it produces against a task-specific rubric.
date: 2026-11-25
author: Open Source Legal
---

The project’s walkthrough uses an M&A data-room assignment. You can inspect the instructions and source documents, run an agent, and review the grader’s report against the rubric. This is a useful starting point for someone who wants to see which parts of an assignment a system completed. [Worked example](https://github.com/harveyai/harvey-labs/blob/main/docs/tutorial.md)

## Recording a reproducible result

Save the task ID, model configuration and LAB release alongside a result. Harvey revises tasks and grading criteria, so two runs against different releases can produce different scores even with the same agent. The repository includes the harness, release history and download instructions. [Harvey LAB repository](https://github.com/harveyai/harvey-labs) · [Releases](https://github.com/harveyai/harvey-labs/releases)
