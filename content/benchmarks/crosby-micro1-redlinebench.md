---
title: Crosby–micro1 RedlineBench
subject: contracts-documents
publisher: Crosby and micro1
access: Public harness and tasks
summary: Evaluate a negotiating agent’s contract edits and comments across successive turns against attorney-authored rubrics.
date: 2026-11-25
author: Open Source Legal
---

A task puts the agent on one party’s side of a negotiation. It receives the current agreement, the client’s instructions and the commercial context, then produces a Word file with tracked changes and margin comments. An LLM judging panel applies attorney-authored criteria to the result. The report breaks out dimensions such as legal correctness and commercial alignment. [Published report](https://crosby.ai/blog/crosby-micro1-redlinebench)

## Running the negotiation tasks

The public dataset contains 140 tasks derived from three negotiation scenarios. The reproduction driver uses Docker and model API credentials. Both agent generation and judging can vary between runs. The harness is MIT-licensed and the task dataset is CC BY 4.0. [Harness and reproduction guide](https://github.com/crosbylegal/redline-bench) · [Task dataset](https://huggingface.co/datasets/crosbylegal/RedlineBench)
