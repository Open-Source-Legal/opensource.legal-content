---
title: neurotic-docx-bench
subject: contracts-documents
publisher: Arthur Souza Rodrigues
access: Public harness and fixtures
homepage: https://benchmarks.law/neurotic-docx-bench/
github_url: https://github.com/jandira-tech/neurotic_docx_bench
licenses:
  - id: AGPL-3.0-only
    label: AGPL-3.0-only harness
    url: https://github.com/jandira-tech/neurotic_docx_bench#license
  - id: ODC-By-1.0
    label: ODC-By-1.0 fixture database
    url: https://huggingface.co/datasets/arthrod/neurotic_docx_bench-fixtures
summary: Compare DOCX conversions and redlines with Microsoft Word’s output, down to an individual page.
date: 2026-11-25
author: Open Source Legal
---

A converter can preserve all the words in a contract and still push its signature block onto another page. This suite lets you inspect that kind of difference. For conversion, it compares the exported PDF with a Word reference. For redlining, it uses Word’s comparison of the same two source files. The published page views let you inspect where the outputs diverged. [Visual comparisons](https://benchmarks.law/neurotic-docx-bench/)

## Reproducing a Word comparison

The harness uses AGPL-3.0-only. The fixture database uses ODC-By-1.0, and individual DOCX files may carry separate rights. The fixture collection links its attribution notices. Reproducing a Word-rendered reference requires Word. Visual similarity measures fidelity to that reference and does not establish whether a lawyer would accept an edit. The maintainer also develops Jubarte, one of the engines evaluated. [Harness and limitations](https://github.com/jandira-tech/neurotic_docx_bench) · [Fixture collection](https://huggingface.co/datasets/arthrod/neurotic_docx_bench-fixtures)
