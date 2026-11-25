# Contribute to Open Source Legal

The directory, articles and blog posts are edited through GitHub pull requests. Sign in to GitHub, fork this repository and make a branch for your change. The GitHub file editor can create the fork and branch for you. Propose your change against the site's `main` branch. A maintainer reviews the diff and merges it for publication.

## Write a blog post

Use the blog for project updates, field notes and commentary. Create a file such as `content/blog/reviewing-a-redline.md` with the same title, summary, date and author fields as an article. Its permanent URL is `/blog/reviewing-a-redline`. Each post appears in the searchable blog archive and sitemap. The same review, CLA and CC BY-NC 4.0 terms apply to both formats. [Create a blog post](https://github.com/Open-Source-Legal/opensource.legal-content/new/main/content/blog) · [Article front matter example](#write-an-article)

## Add or correct a tool

[Edit the directory JSON](https://github.com/Open-Source-Legal/opensource.legal-content/edit/main/oss_directory.json). Add an object to the top-level array or update an existing entry. Supply a unique title, a short factual description, a category and at least one of the two URLs. Reuse an existing category where it fits. Leave generated GitHub statistics to the build.

```json
{
  "title": "Example tool",
  "github_url": "https://github.com/owner/project",
  "homepage": null,
  "description": "Describe the task the tool helps someone complete.",
  "category": "Document Conversion & Processing"
}
```

## Write an article

[Create a Markdown file](https://github.com/Open-Source-Legal/opensource.legal-content/new/main/content/articles) in `content/articles/`. A filename such as `read-a-redline.md` creates the permanent path `/articles/read-a-redline`. Keep the filename when updating an article so existing links continue to work. Use lowercase letters, numbers and hyphens. The filename `index.md` is reserved. Start the file with all four fields, followed by the article body.

```markdown
---
title: Read a redline in Word
summary: Review a change in a sample agreement and check the resulting text.
date: 2026-11-24
author: Your name
---

## Try it

Describe the inputs, the steps you tested and the expected result.
```

Use Markdown headings, lists, links and fenced code blocks. The template supplies the main heading from the title. Quote YAML values containing a colon followed by a space. The date determines newest-first ordering, with filename breaking ties. Merging publishes the article immediately, including articles with a future date. Every article gets a page, an archive listing, full-text search and a sitemap entry. The homepage lists the three newest articles and blog posts together.

## Write the first Assembly Line court-form walkthrough

Have you turned a blank court form into a guided interview? We welcome a short how-to from a legal-aid practitioner or court-form developer using Suffolk LIT Lab’s Document Assembly Line. Pick one small task, such as carrying a party’s name from an interview question into the caption of a completed form. [Assembly Line authoring documentation](https://suffolklitlab.org/docassemble-AssemblyLine-documentation/)

Name the jurisdiction and form version, link the issuing court’s blank form, and use invented answers. Show the question, the field it fills and what a reader should see in the generated document. A reader should be able to repeat the example and spot a mapping error. Use the article format above and submit the draft as a pull request. [Start a Markdown article](https://github.com/Open-Source-Legal/opensource.legal-content/new/main/content/articles)

## Review and preview

Open a pull request against `main` from your fork. The build check also attaches an archive screenshot for reviewers. Read [the contributor agreement](CLA.md) and sign using the instruction on the pull request. Each contributor signs for their own work. A maintainer reviews the submission and the automated check validates the directory and renders the articles.

To build a preview with Node 22 or newer, run `npm ci` and `npm run check`. The rendered archive and posts are under `dist/articles.html`, `dist/articles/`, `dist/blog.html` and `dist/blog/`. The normal build refreshes GitHub metadata. Merging to `main` publishes the static output through GitHub Pages. The website serves it at opensource.legal after the CDN cache refreshes.

Original articles and directory descriptions are available under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Credit the author, link the license and identify changes when reusing the material. Linked projects and third-party assets retain their respective licenses. Identify any third-party material and its source in your submission.
