# RRB ALP PDF OCR extraction

The two attached PDFs have been rendered locally and processed with Windows OCR. The output keeps the OCR text beside the original PDF text layer so missing text can be compared against what the PDF already exposes.

## Scope

- Maths: PDF pages 2-42, 314 question labels found in the embedded text layer.
- GK&GS Physics: PDF pages 2-13, 106 question labels.
- GK&GS Chemistry: PDF pages 14-24, 102 question labels.
- GK&GS Biology: PDF pages 25-33, 91 question labels.
- GK&GS Current Affairs: excluded.

Question-label counts come from the PDF text layer and serve as a coverage cross-check; they are not counts of separately parsed question records.

## Files

- `math-pages.jsonl` and `science-pages.jsonl`: one JSON object per page, with `source`, `scope`, `page`, `embedded_text`, and `ocr_text` fields.
- `math-pages.txt` and `science-pages.txt`: readable page-by-page versions of the same extraction.

## Review notes

The OCR output was spot-checked against rendered pages. Text is generally recovered, but superscripts, fractions, symbols, rupee signs, and some digits can be misread. The last Maths question continues from page 41 to page 42, and a Chemistry question continues from page 23 to page 24. Check those page pairs together before using the text as answer choices on the website.
