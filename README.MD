# zGenPDF | A Template of easy 'Batch PDF Generation' & 'Mass produce PNG/SVG', with draw.io

### Use Draw.io to easily create a template svg with sophisticated design, use it to generate PNG/ SVG files, and turn into both vector and raster PDF.

This template utilize **Draw.io, sheetjs, pdfkit and jszip** together.

**'svg-to-svgpdf.js'** is for batch Raster PDF creation, and also put PNG into zip.

**'svg-to-pngpdf.js'** is for batch Vector PDF creation, and also put SVG into zip.

**'pdfDataReplace.js'** is for logic processing and replacing '@XXXX' fields in templates (svg from draw.io).

**'processor.js'** is for handling other process for Excel, SVG template, PDF.

You may read, copy and edit upon this template to quickly create other PDF Mass generation tools, or Mass produce PNG/SVG.

### How to run zGenPDF to batch produce PDF from EXCEL?:

#### Follow detailed instructions in zGenPDF-TutorialTutorial.pdf:

1. Install the fonts inside the 'src' folder, then close all browser.
2. Run **zGenPDF.bat**，**or host './src' folder** and run index.html yourself.
3. Click ‘Choose File' , select the 'SMALL-SAMPLE-EXCEL.xlsx' file , Click 'Submit
4. Wait for 'Completed'
5. Download PDF and zip (Auto-downloaded if browser allow)<br />

### This zGenPDF template proofs and combines following concepts:

1. **Draw.io** to draw the template, and leaves '@XXXX' field with correct lcoation and font size.
2. **SVG** template is created by Draw.io Advanced Export, with correct size and human readable (Can be Formatted in VSCode).
3. **Mongoose** as (./src/zserver.exe) to host local server. Used to prevent blocked by CORS policy: Cross origin.
4. **sheetjs** to read Excel sheet data and mass produce edited SVG
5. **processor.js** to find and replace '@XXXX' fields with the data and export.
6. **canvas** to generate PNG from SVG
7. **PDFKIT** to generate Rasterized PDFs with custom font embed
8. **PDFKIT** to generate Vectorized PDFs with custom font embed
9. **jszip** to pack SVGs and PNGs into ZIP

### Known limitation:

1. Do not support wrapping long text in text box yet, need heavy modification to svg-to-pdfkit to implement. Suggest adding auto break line function in processor.js or in Excel data source.
2. Draw.io cannot use 'Formatted Text' option and 'Word Wrap' option, as this will create a 'foreignObject' which is only available in SVG 1.1, and not supported by svg-to-pdfkit.
3. Client do not need font to read generated Vectorized PDF, Rasterized PDF and PNG, but SVG is still editable and not have font embed. (Read tutorial page 2 for details).
4. Do not use 'embed font' in draw.io's normal SVG export, as it will make the final Vector PDF massive. Use register font in PDFkit instead, like in this template.
