////////////////////////////////////////////////////////////////////////
//Generate a single PDF from SVGs (vectorized)
//keys[i] for array of unique keys for naming svg (Can be removed, see zip.file below)
//svgArray[i] for array of modified svg text
//imagePerPage for number of svg in a page of PDF
async function svgPDF(keys, svgArray, imagePerPage) {
    
    var SVGzip = new JSZip(); //Create zip file to put svg in (optional)

    const pdfVector = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        Title: 'PDF-Output-Vectorized',
        Author: 'Accountant XXX of ABC Company',
        Producer: 'zGenPDF',
        Creator: 'zGenPDF',
        margin: 0
    });
    const stream = pdfVector.pipe(blobStream());
    console.log('\nCreating制作 Vectorized-PDF 新页面Page');

    ////////////////////////////////////////
    //Register fonts to PDFkit (for SVG embeding)

    async function fontNotoSansSC() {
        try {
            const response = await fetch('./NotoSansSC.otf'); //Modify to your font (Preferably non-variable font)
            const responseArrayBuffer = await response.arrayBuffer();
            const fontBuffer = await buffer.Buffer.from(responseArrayBuffer);
            return fontBuffer;
        } catch (error) {
            console.error(error);
        }
    }
    await pdfVector.registerFont('"Noto Sans SC"',
        await fontNotoSansSC()
    );


    async function fontNotoSerifSC() {
        try {
            const responseSerif = await fetch('./NotoSerifSC.otf'); //Modify to your font (Preferably non-variable font)
            const responseArrayBufferSerif = await responseSerif.arrayBuffer();
            const fontBufferSerif = await buffer.Buffer.from(responseArrayBufferSerif);
            return fontBufferSerif;
        } catch (error) {
            console.error(error);
        }
    }
    await pdfVector.registerFont('"Noto Serif SC"',
        await fontNotoSerifSC()
    );

    ////////////////////////////////////////
    //Some code for fitting multiple svg into 1 A4 page
    await svgArray.forEach((svg, i) => {
        if (i !== 0 && i % imagePerPage === 0) {
            console.log('\nCreating制作 Vectorized-PDF 新页面Page');
            pdfVector.addPage({
                size: 'A4',
                layout: 'portrait'
            });
        }
        SVGzip.file(fileName + '-' + keys[i] + '.svg', svg); //Save SVG into zip // remove keys[i] for naming here
        const fitA4PageHeight = 841.89 / imagePerPage;
        let y = (i % imagePerPage) * (fitA4PageHeight);
        console.log('制作PDF...Add添加SVG:', i + 1, '- ' + keys[i]);
        SVGtoPDF(pdfVector, svg, 0, y, {
            precision: 2
        });
        pdfVector.moveTo(0, y,)
            .lineTo(588, y)
            .dash(5, { space: 10 })
            .stroke();
    });

    pdfVector.end();

    stream.on('finish', function () {
        console.log('\nExporting 输出中...');
        console.log('\nWait for a while 请稍等...');
        console.log('\nMaybe more than 1 minute 可能多于一分钟...\n......\n\n\n');
        const blob = stream.toBlob(pdfVector, 'application/pdf');
        var fileNamePDF = fileName + '-' + 'Vectorized.pdf';
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob, { type: 'application/pdf' });
        link.download = fileNamePDF;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    })

    //Generate SVG zips//
    await SVGzip.generateAsync({ type: "blob" }).then(function (content) {
        console.log('\nCreating 制作SVGzip\n');
        var url = URL.createObjectURL(content);
        var link = document.createElement("a");
        link.href = url;
        link.download = fileName + "__SVG.zip";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        pngPromises = [];
    });

}

