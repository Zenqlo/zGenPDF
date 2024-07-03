//blob-stream@0.1.3   //For PDFKit blob-stream
//bootstrap@5.3.3     //For UI
//buffer@6.0.3        //For buffer in Browser-Only
//jszip@3.10.1        //For zip file
//pdfkit@0.15.0       //For PDF Generation
//sheetjs@0.20.2      //For Reading Excel rows
//svg-to-pdfkit@0.1.8 //For PDFKit to load SVG

var fileName = '';
var svgRow = 1;
const imagePerPage = 3; //Edit here to fit multiple image per page
////////////////////////////////////////////////////////////////////////
//converts a column name (e.g., "A", "B", etc.) to its corresponding numerical index in the array
function colNameToIndex(colName) {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters.indexOf(colName.toUpperCase());
}
///////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
//Logic for processing differnt voucher from xlsx data.
async function processData(data) {
    const voucherYYYY = data[0][colNameToIndex('A')]; // VoucherYYYY from A1
    console.log('\nYear 年份:', voucherYYYY);
    console.log('\nLoading 运行中......');

    // Load SVGs before the loop
    let [Rresponse, Presponse, Tresponse] = await Promise.all([
        fetch('./RVoucher.EDIT.drawio.svg'),
        fetch('./PVoucher.EDIT.drawio.svg'),
        fetch('./TVoucher.EDIT.drawio.svg')
    ]);

    //extracts svg text content into variables RsvgText, PsvgText, and TsvgText
    let [RsvgText, PsvgText, TsvgText] = await Promise.all([
        Rresponse.text(),
        Presponse.text(),
        Tresponse.text()
    ]);


    let keys = []; // To store unique keys
    let pngPromises = []; // To store pngs
    let svgArray = []; // To store svgs
    let lastKey = null;  // To know the end of one Voucher and save the last key
    let lastSvgText = null; // To know the end array of SVGs and save the last SVG
    let newSvgText = null;
    let lastVoucherType = null;

    for (var i = 2; i < data.length; i++) { // Start from 3rd row (index 2) of Excel
        let key = data[i][colNameToIndex('B')];
        let svgText;
        let VoucherType = lastVoucherType;
        let nextKey = (i + 1 < data.length) ? data[i + 1][colNameToIndex('B')] : null;
        let isLastRow = false;
        if (nextKey !== key) {
            isLastRow = true;
        }

        //Seperating differnt voucher from xlsx data to generate different svg.
        if (key) {
            if (key.includes("收") || key.includes("付") || key.includes("转")) {

                if (key !== lastKey) {
                    if (lastSvgText !== null) {
                        modifiedSvgText = lastSvgText.replace(/>[^<>]*@[^<>]*</g, '><')//.replace(/&quot;/g, "");
                        //modifiedSvgText = TmodifiedSvgText.replace(/&quot;/g, "");;
                        await keys.push(lastKey);
                        await svgArray.push(await modifiedSvgText);
                        await pngPromises.push(await genPNG(modifiedSvgText));
                    }
                    svgRow = 1;
                    totalALL = 0;
                    totalALLD = 0;
                    totalALLC = 0;
                    if (key.includes("收")) {
                        VoucherType = 'R';
                        newSvgText = RsvgText;
                    } else if (key.includes("付")) {
                        VoucherType = 'P';
                        newSvgText = PsvgText;
                    } else if (key.includes("转")) {
                        VoucherType = 'T';
                        newSvgText = TsvgText;
                    }
                    console.log('\nProcessing 正在处理凭证:', key);
                    svgText = await NewVoucher(key, data[i], voucherYYYY, newSvgText, VoucherType, isLastRow);

                } else if (key === lastKey) {
                    if (key.includes("收")) {
                        VoucherType = 'R';
                    } else if (key.includes("付")) {
                        VoucherType = 'P';
                    } else if (key.includes("转")) {
                        VoucherType = 'T';
                    }
                    svgText = await editVoucher(key, data[i], lastSvgText, VoucherType, isLastRow);
                }

                console.log('Row:', i + 1, data[i]);
                lastKey = key;
                lastSvgText = await svgText;
                lastVoucherType = VoucherType;
            } else {
                console.log('\nRow:', i + 1, '其他资料' + key);
            }
        } else if (!key && i > 2 && !data[i - 1][colNameToIndex('B')]) {
            console.log('\nRow:', i + 1, '空行');
            console.log('\n最后一行:', i - 1, '\n\n');
            break;
        } else {
            console.log('\nRow:', i + 1, '空行');
        }
    }
    if (lastSvgText !== null) {
        console.log('\nExporting 输出中...');
        console.log('\nWait for a while 请稍等...');
        console.log('\nMaybe more than 1 minute 可能多于一分钟...');
        modifiedSvgText = lastSvgText.replace(/>[^<>]*@[^<>]*</g, '><')//.replace(/&quot;/g, "");
        //modifiedSvgText = TmodifiedSvgText.replace(/&quot;/g, "");;
        await svgArray.push(await modifiedSvgText);
        await keys.push(lastKey);
        await pngPromises.push(await genPNG(modifiedSvgText));

    }
    /////////////
    
    let pngImages = await Promise.all(pngPromises);

    await pngPDF(keys, pngImages, imagePerPage); //Generate a single PDF from PNGs (rasterized)    

    await svgPDF(keys, svgArray, imagePerPage); //Generate a single PDF from SVGs (vectorized) 
 
    await console.log('\nCompleted 完成\n');

}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

async function NewVoucher(key, row, voucherYYYY, svgText, VoucherType, isLastRow) {

    let getcommonSvgText = await commonStart(row, voucherYYYY, svgText, key, isLastRow);

    if (VoucherType === 'R') {
        svgText = await RVoucherReplacements(row, getcommonSvgText, key, isLastRow);
        return svgText;
    } else if (VoucherType === 'P') {
        svgText = await PVoucherReplacements(row, getcommonSvgText, key, isLastRow);
        return svgText;
    } else if (VoucherType === 'T') {
        svgText = await TVoucherReplacements(row, getcommonSvgText, key, isLastRow);
        return svgText;
    }


}

async function editVoucher(key, row, svgText, VoucherType, isLastRow) {

    let NewsvgText;

    if (VoucherType === 'R') {
        NewsvgText = await RVoucherReplacements(row, svgText, key, isLastRow);
        return NewsvgText
    } else if (VoucherType === 'P') {
        NewsvgText = await PVoucherReplacements(row, svgText, key, isLastRow);
        return NewsvgText
    } else if (VoucherType === 'T') {
        NewsvgText = await TVoucherReplacements(row, svgText, key, isLastRow);
        return NewsvgText
    }

}
////////////////////////////////////////////////////////////////////////