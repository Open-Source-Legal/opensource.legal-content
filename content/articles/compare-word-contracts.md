---
title: Compare two Word contracts with tracked changes
summary: Make a redline in your browser, then check the result against a change you already know.
date: 2026-11-24
author: Open Source Legal
---
A clean copy of a revised contract tells you what it says now. A redline lets you inspect what changed. Try the workflow with a one-sentence agreement before comparing a longer document.

## Make a pair of practice documents

1. Create a Word document containing “The supplier must deliver within thirty days.”
2. Save it as `original.docx`. Make a copy called `revised.docx`.
3. In the copy, change “thirty” to “fifteen” and save. Leave Track Changes off while making this edit so both inputs are clean copies.

## Compare and inspect

Open [Crowdsourced Redlines](https://redlines.opensource.legal/). Select the original as the first document and the revision as the second. Run the comparison and download the resulting DOCX. The comparison runs in the browser.

Open the result in Word. On the **Review** tab, choose **All Markup**. You should see “thirty” deleted and “fifteen” inserted. Accept the changes in a disposable copy and read the sentence again. It should now match the revision. If the change runs in the opposite direction, check the order of the input files.

For a repeatable comparison in an application, see the [Docxodus examples](https://github.com/JSv4/Docxodus). Browse the [tool directory](/directory) for other redlining and document comparison projects.
