---
title: How to verify a redacted PDF before sharing it
summary: Redact a made-up identifier in Resecta, then check the exported file with a second viewer and Poppler.
date: 2026-11-25
author: Open Source Legal
---

A PDF can display a black rectangle while the original text still copies to the clipboard. Try that distinction on a one-page fictional exhibit. The goal is to remove one private reference while preserving the public case reference beside it on the page.

## Establish what the input contains

Download the practice filing to Files on an iPhone running iOS 26 or later. Keep the original. On a computer with Poppler installed, run the following command on the same input. You should see both `ORCHID-7294`, the private reference, and `EXHIBIT-42`, the public one. This confirms the input has a searchable text layer. [Download the practice filing](https://raw.githubusercontent.com/Open-Source-Legal/opensource.legal-content/main/content/examples/pdf-redaction/practice-filing.pdf) · [Poppler](https://poppler.freedesktop.org/)

```sh
pdftotext -layout practice-filing.pdf -
```

## Make the redacted copy

1. Open the original PDF in Resecta. Search for `ORCHID-7294`, select the match, and mark it for redaction. Zoom in and check that the mark covers the whole identifier, including its last digit. Leave `EXHIBIT-42` visible.
2. Apply the redaction and leave verification enabled. Inspect the results for the applied search and read any warnings. Correct the mark and verify again if part of the identifier remains.
3. Export to Files with the name `practice-redacted.pdf`. Close the original. Open the exported copy in a second viewer and transfer that same copy to the computer. [Resecta workflow and verification checks](https://github.com/Merlin1A/resecta)

## Inspect the exported file two ways

```sh
pdfinfo practice-redacted.pdf
pdftotext -layout practice-redacted.pdf extracted.txt
pdftoppm -f 1 -l 1 -r 150 -png -singlefile practice-redacted.pdf exported-page
```

Check the following three things before you mark the exercise complete.

- **Page count.** `pdfinfo` should report one page, just like the input.
- **Extracted text.** Open `extracted.txt` and search for the private reference. A match means the exported file still exposes it. Resecta rasterizes pages, so a nearly empty text file is expected even if a sensitive word is still visible as pixels.
- **Visible pixels.** Open `exported-page.png` and zoom in. You should be able to read `EXHIBIT-42` and the filing text. The entire private identifier should be covered, including the edges of the first and last characters. A blank page would also yield empty extracted text, but fails this check.

For a quick control, render the original with the same `pdftoppm` command using `practice-filing.pdf` and a different output name. You should be able to read both references. Keep the original and export distinguishable when selecting an attachment. This one-page exercise tests a known text target. Files with multiple pages, images or other sensitive content need checks that cover those inputs too. [Resecta’s threat model](https://github.com/Merlin1A/resecta/blob/main/THREAT-MODEL.md)
