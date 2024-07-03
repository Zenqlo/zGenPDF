////////////////////////////////////////////////////////////////////////
//Generate PNGs (rasterized) from SVGs
function genPNG(modifiedSvgText) {
    return new Promise((resolve) => {
        try {
            console.log(' ......\n');
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(modifiedSvgText, "image/svg+xml");
            const svgElement = svgDoc.documentElement;

            const canvas = document.createElement('canvas');
            canvas.width = svgElement.viewBox.animVal.width * 2;
            canvas.height = svgElement.viewBox.animVal.height * 2;
            canvas.getContext('2d').pixelRatio = 2;
            const ctx = canvas.getContext('2d');

            const img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                let pngData = canvas.toDataURL('image/png');
                resolve(pngData.split(',')[1]);
            };
            img.src = 'data:image/svg+xml,' + encodeURIComponent(modifiedSvgText);
        } catch (error) {
            console.error;
        }
    });
}

////////////////////////////////////////////////////////////////////////
//Generate a single PDF from PNGs (rasterized)
//keys[i] for array of unique keys for naming png (Can be removed, see zip.file below)
//svgArray[i] for array of modified png buffer without heading eg: let pngData = canvas.toDataURL('image/png'); resolve(pngData.split(',')[1]);
//imagePerPage for number of png in a page of PDF
async function pngPDF(keys, pngImages, imagePerPage) {
    var PNGzip = new JSZip();
    const pdfRaster = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        Title: 'PDF-Output-Rasterized',
        Author: 'Accountant XXX of ABC Company',
        Producer: 'zGenPDF',
        Creator: 'zGenPDF',
        margin: 0
    });
    const stream = pdfRaster.pipe(blobStream());
    console.log('\nCreating制作Rasterized-PDF新页面Page');

    //Some code for fitting multiple png into 1 A4 page
    pngImages.forEach((img, i) => {
        if (i !== 0 && i % imagePerPage === 0) {
            console.log('\nCreating制作Rasterized-PDF新页面Page');
            pdfRaster.addPage({
                size: 'A4',
                layout: 'portrait'
            });
        }
        PNGzip.file(fileName + '-' + keys[i] + '.png', img, { base64: true }); //Save PNGs into zip
        const fitA4PageHeight = 841.89 / imagePerPage;
        let y = (i % imagePerPage) * (fitA4PageHeight);
        console.log('制作PDF... Add添加PNG:', i + 1, '- ' + keys[i]);
        let pngBuffer = buffer.Buffer.from(img.replace(/^data:image\/png;base64,/, ''), 'base64'); //Code to turn it into buffer
        pdfRaster.image(pngBuffer, 0, y, { width: (558) });//Add PNG, with minor offset of width
        pdfRaster.moveTo(0, y,)
            .lineTo(588, y)
            .dash(5, { space: 10 })
            .stroke();
    });

    pdfRaster.end();

    stream.on('finish', function () {
        console.log('\nExporting 输出中...');
        console.log('\nWait for a while 请稍等...');
        console.log('\nMaybe more than 1 minute 可能多于一分钟...\n......\n\n\n');
        const blob = stream.toBlob(pdfRaster, 'application/pdf');
        var fileNamePDF = fileName + '-' + 'Rasterized.pdf';
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob, { type: 'application/pdf' });
        link.download = fileNamePDF;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    })

    //Generate PNG zips//
    await PNGzip.generateAsync({ type: "blob" }).then(function (content) {
        console.log('\nCreating 制作PNGzip\n');
        var url = URL.createObjectURL(content);
        var link = document.createElement("a");
        link.href = url;
        link.download = fileName + "__PNG.zip";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        pngPromises = [];
    });

}
