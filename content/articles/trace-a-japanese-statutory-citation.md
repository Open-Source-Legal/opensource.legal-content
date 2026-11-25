---
title: Trace a Japanese statutory citation to the exact paragraph
summary: Use JLaw-CiteGraph to resolve a relative reference in Japan’s Labor Standards Act and check both ends in the official e-Gov text.
date: 2026-11-25
author: Open Source Legal
---

A search for an article number misses references written as 前項, meaning “the preceding paragraph.” Article 20, paragraph 2 of Japan’s Labor Standards Act uses exactly that phrase. With JLaw-CiteGraph you can inspect the link the parser assigned and decide whether the text supports it.

## Open a dated copy of the graph

Use Python 3.11 or newer and allow about 3 GB of disk space for the unpacked search database. In a fresh Python environment, run these commands from a working folder in a macOS or Linux shell. The dataset tag identifies the November 3 e-Gov snapshot. [JLaw-CiteGraph](https://github.com/yabooung/jp-law-citation-graph) · [Snapshot files](https://huggingface.co/datasets/yabooung/jp-law-citation-graph/tree/2026-11-03)

```sh
python -m pip install jlawcite==2.5.0
export JLAWCITE_DB="$PWD/jp-search.sqlite"
jlawcite download --snapshot 2026-11-03 --db "$JLAWCITE_DB"
```

## Read the reference in both directions

Start with the paragraph containing the reference. Then ask for its outgoing citation links.

```sh
jlawcite get '労働基準法20条2項'
jlawcite refs '労働基準法20条2項' --direction out --rel CITES
```

The first command identifies `322AC0000000049_a20_p2`. The second returns one outgoing citation, labeled 前項, to `322AC0000000049_a20_p1`. The shared law and article identifiers tell you the reference stays inside Article 20. The final component changes from paragraph 2 to paragraph 1.

Read the destination, then ask which provisions cite it. Find the paragraph 2 identifier in the incoming results.

```sh
jlawcite get '労働基準法20条1項'
jlawcite refs '労働基準法20条1項' --direction in --rel CITES --limit 100
```

## Check the official text

Open the Labor Standards Act on e-Gov and find 第二十条 (Article 20). Look for the paragraph numbered ２ and the words 前項の予告. Read the immediately preceding paragraph. It introduces the notice that paragraph 2 refers to. The first paragraph may appear without a printed numeral. If e-Gov has since updated the law, use its version history to select the text applicable on November 4, 2026, the graph’s effective date. [Official act on e-Gov](https://laws.e-gov.go.jp/law/322AC0000000049)

For a research note, record the law ID, both paragraph IDs, the snapshot date and the official source. Those details let another reader repeat the lookup and recognize when a later amendment calls for a fresh check. JLaw-CiteGraph publishes the code under Apache-2.0 and the graph data under CC BY 4.0. [Data license and attribution](https://github.com/yabooung/jp-law-citation-graph/blob/main/DATA_LICENSE.md)
