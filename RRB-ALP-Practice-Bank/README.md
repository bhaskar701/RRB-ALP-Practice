# RRB ALP CBT-1 Practice Bank

A responsive, static practice website styled after the supplied RRB JE reference. It includes Mathematics chapter-wise questions and the Physics, Chemistry, and Biology sections from the GK&GS PDF. Reasoning and Current Affairs are not included.

## Open the website

Open `index.html` in a browser. The bundled `data/questions.js` makes the site work without a local server. `data/questions.json` is the editable source dataset.

## Features

- Mathematics chapters and Science subject filters
- Search across question text and answer choices
- Topic buttons and topic dropdown
- Clickable choices with correct-answer feedback
- Progressive loading, responsive layout, and dark mode
- Source PDF page references on question cards

## Source and OCR notes

This build contains 314 Maths questions and 299 Science questions (106 Physics, 102 Chemistry, 91 Biology), for 613 total. The PDF pages were OCR-checked and question labels and answer keys were cross-referenced against the PDF text layer. Formula-heavy items and 111 cards with incomplete OCR choices are marked `Check scan` in the site.

The page-level OCR extracts are in `data/ocr/`. Check `data/ocr/README.md` for page ranges, split-page questions, and review notes. Some extracted digits, symbols, and formulas still need visual review before publication.
