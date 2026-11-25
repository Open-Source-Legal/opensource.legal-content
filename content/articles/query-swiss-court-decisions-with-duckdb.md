---
title: Query Swiss court decisions with DuckDB
summary: Find three Aargau Commercial Court decisions in a small Parquet download and follow a docket back to the cantonal register.
date: 2026-11-25
author: Open Source Legal
---

Which decisions did Aargau’s Commercial Court issue in October 2026? OpenCaseLaw Switzerland publishes a Parquet file for each court. This exercise uses a 3.2 MiB snapshot, so you can answer that question on a laptop with Python and DuckDB.

## Download one court

Save the following file as `ag_handelsgericht.parquet` in an empty working folder. The link pins the dataset revision so that the results below are reproducible as the collection grows. [Download the court file](https://huggingface.co/datasets/voilaj/swiss-caselaw/resolve/7d3da0086540911a4008f4f65fa27d514edb9627/data/ag_handelsgericht.parquet)

From that folder, install DuckDB in a Python environment you use for this exercise.

```sh
python -m pip install duckdb==2.0.1
```

## Filter by court and decision date

Save this as `find_cases.py` alongside the download and run `python find_cases.py`. The query uses the date the court decided the case. Publication and collection dates answer different questions.

```python
import duckdb

rows = duckdb.sql("""
    SELECT docket_number, decision_date, source_url
    FROM read_parquet('ag_handelsgericht.parquet')
    WHERE court = 'ag_handelsgericht'
      AND CAST(decision_date AS DATE) BETWEEN DATE '2026-10-01' AND DATE '2026-10-31'
    ORDER BY decision_date DESC, docket_number
    LIMIT 3
""").fetchall()

for docket, date, url in rows:
    print(docket, date, url)
```

The first row should be `HSU.2026.49`, dated October 21. The next two are `HOR.2026.22` and `HSU.2026.53`, both dated October 20. Sorting by docket breaks the tie.

## Check the register

Open the first row’s source URL and compare its docket and decision date with your output. Keep the docket and that link when citing the record. To see every matching record in the file, remove `LIMIT 3`. That gives you a countable set of records from this snapshot. The court may have issued other decisions outside the collection. [Cantonal register entry](https://gesetzessammlungen.ag.ch/app/de/decrees/13706)

OpenCaseLaw dedicates its compilation and added metadata to CC0. The dataset card documents the originating courts and separate terms for European Court of Human Rights material available elsewhere in the service. [OpenCaseLaw dataset card](https://huggingface.co/datasets/voilaj/swiss-caselaw/blob/7d3da0086540911a4008f4f65fa27d514edb9627/README.md)
