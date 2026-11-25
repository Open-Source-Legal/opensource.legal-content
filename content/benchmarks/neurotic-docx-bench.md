---
title: neurotic-docx-bench
publisher: Arthur Souza Rodrigues
access: Public harness and fixtures
summary: Compare DOCX conversions and redlines with Microsoft Word’s output, down to an individual page.
date: 2026-11-25
author: Open Source Legal
---

A converter can preserve all the words in a contract and still push its signature block onto another page. This suite lets you inspect that kind of difference. For conversion, it compares the exported PDF with a Word reference. For redlining, it uses Word’s comparison of the same two source files. The published page views let you inspect where the outputs diverged. [Visual comparisons](https://benchmarks.law/neurotic-docx-bench/)

**What you can run.** The harness and versioned fixture manifests are public. Reproducing a Word-rendered reference requires Word. Visual similarity measures fidelity to that reference and does not establish whether a lawyer would accept an edit. The maintainer also develops Jubarte, one of the engines evaluated. [Harness and limitations](https://github.com/jandira-tech/neurotic_docx_bench) · [Fixture collection](https://huggingface.co/datasets/arthrod/neurotic_docx_bench-fixtures)
