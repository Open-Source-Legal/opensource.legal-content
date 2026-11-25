---
title: Why one tool gets two links
summary: The python-docx entry illustrates a small editorial choice in the Open Source Legal directory.
date: 2026-11-25
author: Open Source Legal
---

Take the python-docx entry in our directory. It has a homepage and a GitHub repository. Two links might seem excessive for a library with a two-sentence description. Try answering two questions with them.

**How do I add a table to a Word file?** The documentation’s quickstart shows a table being created, populated and saved. Someone trying the library for the first time can start with a short example and open the resulting file in Word. [python-docx quickstart](https://python-docx.readthedocs.io/en/latest/user/quickstart.html#adding-a-table)

**What happens if my document behaves differently?** The repository gives that reader somewhere to take the next question. They can look for an existing issue, inspect the implementation or share a small document that reproduces the difference. [python-docx repository](https://github.com/python-openxml/python-docx)

That distinction matters when proposing a listing. If you used a project’s documentation to get your first result, include that address as its homepage. Put the source repository in the GitHub field. A project with just one of those destinations can still be listed. A reader with both can move from trying the tool to understanding how it works.

You can see those fields in the directory JSON and suggest a correction through a pull request. [Directory source](https://github.com/Open-Source-Legal/opensource.legal-content/blob/main/oss_directory.json)
