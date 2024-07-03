// 下面是会计凭证生成的一些逻辑 // Below is some logic for accounting voucher generation
// 设计为以示例 Excel 格式运行，请参阅 ./Sample-Excel-Fake-Data/*.xlsx // Designed to run with Sample Excel format, see ./Sample-Excel-Fake-Data/*.xlsx

// 共用的列表， 阿拉伯数字，到中文字的列表 //Shared list, Arabic numerals, to Chinese character list
let numToChinese = { '1': '壹', '2': '贰', '3': '叁', '4': '肆', '5': '伍', '6': '陆', '7': '柒', '8': '捌', '9': '玖', '0': '零', '': '' };
function intToChineseArray(num) {
    //if (num < 10) return [String(num)].concat(...intToArray(0));
    var str = String(num).split('').reverse();
    let result = [];
    for (let i = 0; i < str.length; i++) {
        result.push(numToChinese[str[i]]);
    }
    while (result.length < 9) {
        result.push('**');
    }
    while (result.length > 9) {
        result[8] = result.splice(9).reverse().join('') + result[8]
    }
    return result;
}


//计算单张Voucher的总金额成totalALL //Calculate total amount of money in a single Voucher as totalALL, totalALLD, totalALLC
let totalALL = 0; //共用留存totalALL, 注意在js的其他部分中，变更key后totalALL会重设0 //Shared totalALL, note that in other parts of js, totalALL will be reset to 0 after changing the key
let totalALLD = 0; //共用留存totalALLD，转账凭证用，DEBIT，注意在js的其他部分中，变更key后totalALLD会重设0 //Shared totalALLD, used for GENERAL VOUCHER, DEBIT. Note that in other parts of js, totalALLD will be reset to 0 after changing the key.
let totalALLC = 0; //共用留存totalALLC，转账凭证用，CREDIT，注意在js的其他部分中，变更key后totalALLC会重设0 //Shared totalALLC, used for GENERAL VOUCHER, CREDIT. Note that in other parts of js, totalALLC will be reset to 0 after changing the key.


////////////////////////////////////////////////////////////////////////////////
// 此function，只执行一次，于开新凭证，所有类型凭证都执行，进行一样的修改 // This function is only executed once. When a new voucher is opened, no matter which types of vouchers, must be executed and the same modifications are made.
function commonStart(row, voucherYYYY, svgText, key, isLastRow) {
    let month = row[colNameToIndex('A')].toString().trim().padStart(2, '0'); // 获得月份，变成文字，消除空格和透明值，并在个位数前面补零（保证为2数） // Get the month, turn it into text, eliminate spaces and transparent values, and add zeros in front of the single digit (guaranteed that is 2 digit)
    let lastDay = new Date(voucherYYYY, month, 0).getDate(); // 获取该月份的最后一天 // Get the last day of the month

    svgText = svgText;
    svgText = svgText //打开SVG为文本并进行下面修改 //Open SVG as text and make the following modifications
        .replace('@YYYY', voucherYYYY) // 替换年份 //replace year
        .replace('@M', month) // 替换月份 //replace month
        .replace('@D', lastDay)  // 替换日期 // replace date
        .replace('@Key', key.match(/\d+/)[0]);  // 只取key中的数值，替换@Key, // Only take the value in key and replace @Key,

    return svgText; // 提交替换后的SVG文本    //Submit the replaced SVG text
}
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// 此function，收款凭证 执行修改 //This function performs modification on the RECEIVING VOUCHER
function RVoucherReplacements(row, svgText, key, isLastRow) {

    let colI = row[colNameToIndex('I')] ? parseFloat(row[colNameToIndex('I')].toString().trim()) : null; // 获取并处理I列的数据 // Get and process the data in column I
    let colJ = row[colNameToIndex('J')] ? parseFloat(row[colNameToIndex('J')].toString().trim()) : null; // 获取并处理J列的数据 // Get and process the data in column J

    // 当I列是有效数字，且不为0，且J列为空，且G列非空时，进行以下操作 // When column I is a valid number and is not 0, column J is empty, and column G is not empty, perform the following operations
    if (colI     // 检查 I 为有效数字 // Check that I is a valid number
        && colI !== 0   // 检查 I 不等于零 // Check that I is not equal to zero
        && !row[colNameToIndex('J')]   // 检查 J 为空 // Check if J is empty
        && row[colNameToIndex('G')]) { // 检查 G 不为空  // 检查 J 为空
        svgText = svgText.replace('@DebitAcc', row[colNameToIndex('G')]); // 将G列的值替换到svgText的@DebitAcc //Replace the value of column G to @DebitAcc of svgText
    }

    // 承接之前的svgText, 当J列是有效数字，且不为0，且I列为空，且G列非空时，进行以下操作 // Use previous svgText, when column J is a valid number and is not 0, column I is empty, and column G is not empty, perform the following operations
    if (colJ
        && colJ !== 0
        && !row[colNameToIndex('I')]
        && row[colNameToIndex('G')]) {
        let colG = row[colNameToIndex('G')]; //Read the value of column G
        let bracketContent = colG.match(/(\((.*?)\))|（(.*?)）/); // 若数值有括号内容，检查中文或英文括号 // If the value has bracket content, check the Chinese or English brackets
        if (bracketContent) {
            colG = colG.replace(bracketContent[0], ''); // 剔除括号内容 //Remove bracket content
            let parts = colG.split('-');
            if (parts.length === 1) { // 检查有没有 '-' // Check if there is '-'
                colG = parts[0] + '-' + (bracketContent[2] || bracketContent[3]); // 添加内容到 '-' 后面 //Add content after '-'
            }
        }
        totalALL = totalALL + colJ; //添加J数值到totalALL //Add J value to totalALL        

        // 对svgText进行多次替换操作 // Perform multiple replacement operations on svgText
        svgText = svgText
            .replace(`@R${svgRow}EX`, row[colNameToIndex('E')]) // 将E列的值替换到对应位置 // Replace the value in column E to the corresponding position
            .replace(`@R${svgRow}GE`, colG.split('-')[0]) // 将colG的值的第一部分替换到对应位置 //Replace the first part of the value of colG to the corresponding position
            .replace(`@R${svgRow}SU`, colG.split('-')[1] || `@R${svgRow}SU`) // 将colG的值的第二部分替换到对应位置，如果第二部分不存在，则不替换 //Replace the second part of the value of colG to the corresponding position. If the second part does not exist, it will not be replaced.
            .replace(`@R${svgRow}AM`, (row[colNameToIndex('J')] >= 0 ? Math.floor(row[colNameToIndex('J')]) : Math.ceil(row[colNameToIndex('J')])).toString().replace('-', '—').replace(/(\d)/g, '$1 ')) // 将J列的值的整数部分替换到对应位置，并在所有数字字符之间添加空格,增加￥在开头 //Replace the integer part of the value in column J to the corresponding position, add spaces between all numeric characters, and add ￥ at the beginning
            .replace(`@R${svgRow}D`, (row[colNameToIndex('J')] % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 ')) // 将J列的值的小数部分替换到对应位置，并在所有数字字符之间添加空格 //Replace the decimal part of the value in column J to the corresponding position and add spaces between all numeric characters

        svgRow += 1; //svgRow行数增加1 (注意在js的其他部分中，变更key后svgRow会重设0) //The number of svgRow rows increases by 1 (note that in other parts of js, svgRow will be reset to 0 after changing the key)
    }


    // 承接之前的svgText, 当isLastRow 为 true (下一行Excel是不同的key)，运行以下操作 // Use previous svgText, when isLastRow is true (the next row of Excel has a different key), run the following operations
    if (isLastRow !== false) {
        svgText = svgText // 对svgText进行多次替换操作
            .replace('@TAM', '￥' + (totalALL >= 0 ? Math.floor(totalALL) : Math.ceil(totalALL)).toString().replace('-', '—').replace(/(\d)/g, '$1 ')) // 取得totalALL的整数部分替换到@TAM，并在所有数字字符之间添加空格,增加￥在开头
            .replace('@TD', (totalALL % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 ')) // 取得totalALL的整小数部分替换到@TD，并在所有数字字符之间添加空格

        let CNT = [];
        if (typeof totalALL !== "undefined") {
            if (totalALL >= 0) {
                CNT = intToChineseArray(Math.floor(totalALL));
            } else {
                CNT = intToChineseArray(Math.ceil(totalALL));
            }
            let CNTD = intToChineseArray((totalALL % 1).toFixed(2));
            svgText = svgText
                .replace('@0', typeof CNT !== 'undefined' ? CNT[0] : '')
                .replace('@1', typeof CNT !== 'undefined' ? CNT[1] : '')
                .replace('@2', typeof CNT !== 'undefined' ? CNT[2] : '')
                .replace('@3', typeof CNT !== 'undefined' ? CNT[3] : '')
                .replace('@4', typeof CNT !== 'undefined' ? CNT[4] : '')
                .replace('@5', typeof CNT !== 'undefined' ? CNT[5] : '')
                .replace('@6', typeof CNT !== 'undefined' ? CNT[6] : '')
                .replace('@7', typeof CNT !== 'undefined' ? CNT[7] : '')
                .replace('@8', typeof CNT !== 'undefined' ? CNT[8] : '')
                .replace('@Z', CNTD[0])
                .replace('@X', CNTD[1])
        }
    }
    return svgText; // 提交替换后的文本 //Submit the replaced text
}
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// 此function，付款凭证 执行修改 //This function performs modifications to the PAYMENT VOUCHER
function PVoucherReplacements(row, svgText, key, isLastRow) {

    let colI = row[colNameToIndex('I')] ? parseFloat(row[colNameToIndex('I')].toString().trim()) : null; // 获取并处理I列的数据 // Get and process the data in column I
    let colJ = row[colNameToIndex('J')] ? parseFloat(row[colNameToIndex('J')].toString().trim()) : null; // 获取并处理J列的数据 // Get and process the data in column J

    if (colJ     // 检查 J 为有效数字 // Check that J is a valid number
        && colJ !== 0   // 检查 J 不等于零 // Check that J is not equal to zero
        && !row[colNameToIndex('I')]   // 检查 I 为空 // Check if I is empty
        && row[colNameToIndex('G')]) { // 检查 G 不为空  // Check that G is not empty
        svgText = svgText.replace('@CredAcc', row[colNameToIndex('G')]); // 将G列的值替换到svgText的@DebitAcc //Replace the value of column G to @DebitAcc of svgText
    }

    // 承接之前的svgText, 当I列是有效数字，且不为0，且J列为空，且G列非空时，进行以下操作 // Use the previous svgText, when column I is a valid number and is not 0, column J is empty, and column G is not empty, perform the following operations
    if (colI
        && colI !== 0
        && !row[colNameToIndex('J')]
        && row[colNameToIndex('G')]) {
        let colG = row[colNameToIndex('G')]; // 读取G列数值 //Read the value of column G
        let bracketContent = colG.match(/(\((.*?)\))|（(.*?)）/); // 数值有括号内容，检查中文或英文括号 // The value has bracket content, check Chinese or English brackets
        if (bracketContent) {
            colG = colG.replace(bracketContent[0], ''); // 剔除括号内容 //Remove bracket content
            let parts = colG.split('-');
            if (parts.length === 1) { // 检查有没有 '-' // Check if there is '-'
                colG = parts[0] + '-' + (bracketContent[2] || bracketContent[3]); // 添加内容到 '-' 后面 //Add content after '-'
            }
        }
        totalALL = totalALL + colI; //添加J数值到totalALL //Add J value to totalALL

        // 对svgText进行多次替换操作 // Perform multiple replacement operations on svgText
        svgText = svgText
            .replace(`@R${svgRow}EX`, row[colNameToIndex('E')]) // 将E列的值替换到对应位置 // Replace the value in column E to the corresponding position
            .replace(`@R${svgRow}GE`, colG.split('-')[0]) // 将colG的值的第一部分替换到对应位置 //Replace the first part of the value of colG to the corresponding position
            .replace(`@R${svgRow}SU`, colG.split('-')[1] || `@R${svgRow}SU`) // 将colG的值的第二部分替换到对应位置，如果第二部分不存在，则不替换 // Replace the second part of the value of colG to the corresponding position. If the second part does not exist, it will not be replaced.
            .replace(`@R${svgRow}AM`, (row[colNameToIndex('I')] >= 0 ? Math.floor(row[colNameToIndex('I')]) : Math.ceil(row[colNameToIndex('I')])).toString().replace('-', '—').replace(/(\d)/g, '$1 ')) // 将I列的值的整数部分替换到对应位置，并在所有数字字符之间添加空格,增加￥在开头 //Replace the integer part of the value in column I to the corresponding position, add spaces between all numeric characters, and add ￥ at the beginning
            .replace(`@R${svgRow}D`, (row[colNameToIndex('I')] % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 ')) // 将I列的值的小数部分替换到对应位置，并在所有数字字符之间添加空格 //Replace the decimal part of the value in column I to the corresponding position and add spaces between all numeric characters

        svgRow += 1; // svgRow行数增加 (注意在js的其他部分中，变更key后svgRow会重设0) //The number of svgRow rows increases (note that in other parts of js, svgRow will be reset to 0 after changing the key)
    }

    // 承接之前的svgText, 当isLastRow 为 true (下一行Excel是不同的key)，运行以下操作 // Use previous svgText, when isLastRow is true (the next row of Excel has a different key), run the following operations
    if (isLastRow !== false) {
        svgText = svgText // Perform multiple replacement operations on svgText
            .replace('@TAM', '￥' + (totalALL >= 0 ? Math.floor(totalALL) : Math.ceil(totalALL)).toString().replace('-', '—').replace(/(\d)/g, '$1 ')) // 取得totalALL的整数部分替换到@TAM，并在所有数字字符之间添加空格,增加￥在开头 // Get the integer part of totalALL and replace it with @TAM, add spaces between all numeric characters, and add ￥ at the beginning
            .replace('@TD', (totalALL % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 ')) // 取得totalALL的整小数部分替换到@TD，并在所有数字字符之间添加空格 // Get the integer decimal part of totalALL and replace it with @TD and add spaces between all numeric characters

        let CNT = [];
        if (typeof totalALL !== "undefined") {
            if (totalALL >= 0) {
                CNT = intToChineseArray(Math.floor(totalALL));
            } else {
                CNT = intToChineseArray(Math.ceil(totalALL));
            }
            let CNTD = intToChineseArray((totalALL % 1).toFixed(2));
            svgText = svgText
                .replace('@0', typeof CNT !== 'undefined' ? CNT[0] : '')
                .replace('@1', typeof CNT !== 'undefined' ? CNT[1] : '')
                .replace('@2', typeof CNT !== 'undefined' ? CNT[2] : '')
                .replace('@3', typeof CNT !== 'undefined' ? CNT[3] : '')
                .replace('@4', typeof CNT !== 'undefined' ? CNT[4] : '')
                .replace('@5', typeof CNT !== 'undefined' ? CNT[5] : '')
                .replace('@6', typeof CNT !== 'undefined' ? CNT[6] : '')
                .replace('@7', typeof CNT !== 'undefined' ? CNT[7] : '')
                .replace('@8', typeof CNT !== 'undefined' ? CNT[8] : '')
                .replace('@Z', CNTD[0])
                .replace('@X', CNTD[1])
        }
    }
    return svgText;
}
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// 此function，转账凭证 执行修改 //This function performs modification on the GENERAL VOUCHER
function TVoucherReplacements(row, svgText, key, isLastRow) {

    let colI = row[colNameToIndex('I')] ? parseFloat(row[colNameToIndex('I')].toString().trim()) : null; // 获取并处理I列的数据 // Get and process the data in column I
    let colJ = row[colNameToIndex('J')] ? parseFloat(row[colNameToIndex('J')].toString().trim()) : null; // 获取并处理J列的数据 // Get and process the data in column J

    // 承接之前的svgText, 当I列是有效数字，且不为0，且J列为空，且G列非空时，进行以下操作 // Use previous svgText, when column I is a valid number and is not 0, column J is empty, and column G is not empty, perform the following operations
    if (colI
        && colI !== 0
        && !row[colNameToIndex('J')]
        && row[colNameToIndex('G')]) {
        let colG = row[colNameToIndex('G')]; //Read the value of column G
        let bracketContent = colG.match(/(\((.*?)\))|（(.*?)）/); // 数值有括号内容，检查中文或英文括号 // The value has bracket content, check Chinese or English brackets
        if (bracketContent) {
            colG = colG.replace(bracketContent[0], ''); // 剔除括号内容 //Remove bracket content
            let parts = colG.split('-');
            if (parts.length === 1) { // 检查有没有 '-' // Check if there is '-'
                colG = parts[0] + '-' + (bracketContent[2] || bracketContent[3]); // 添加内容到 '-' 后面 // Add content after '-'
            }
        }
        totalALLD = totalALLD + colI; //添加J数值到totalALLD //Add J value to totalALLD

        // 对svgText进行多次替换操作 // Perform multiple replacement operations on svgText
        svgText = svgText
            .replace(`@R${svgRow}EX`, row[colNameToIndex('E')]) // 将E列的值替换到对应位置 // Replace the value in column E to the corresponding position
            .replace(`@R${svgRow}GE`, colG.split('-')[0]) // 将colG的值的第一部分替换到对应位置 //Replace the first part of the value of colG to the corresponding position
            .replace(`@R${svgRow}SU`, colG.split('-')[1] || `@R${svgRow}SU`) // 将colG的值的第二部分替换到对应位置，如果第二部分不存在，则不替换 //Replace the second part of the value of colG to the corresponding position. If the second part does not exist, it will not be replaced.
            .replace(`@R${svgRow}DA`, (row[colNameToIndex('I')] >= 0 ? Math.floor(row[colNameToIndex('I')]) : Math.ceil(row[colNameToIndex('I')])).toString().replace('-', '—').replace(/(\d)/g, '$1 ')) // 将I列的值的整数部分替换到对应位置，并在所有数字字符之间添加空格,增加￥在开头
            .replace(`@R${svgRow}DD`, (row[colNameToIndex('I')] % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 ')) // 将I列的值的小数部分替换到对应位置，并在所有数字字符之间添加空格 //Replace the decimal part of the value in column I to the corresponding position and add spaces between all numeric characters

        svgRow += 1;// svgRow行数增加 (注意在js的其他部分中，变更key后svgRow会重设0) //The number of svgRow rows increases (note that in other parts of js, svgRow will be reset to 0 after changing the key)
    }

    // 承接之前的svgText, 当J列是有效数字，且不为0，且I列为空，且G列非空时，进行以下操作 // Inherit the previous svgText, when column J is a valid number and is not 0, column I is empty, and column G is not empty, perform the following operations
    if (colJ
        && colJ !== 0
        && !row[colNameToIndex('I')]
        && row[colNameToIndex('G')]) {
        let colG = row[colNameToIndex('G')]; // 读取G列数值 //Read the value of column G
        let bracketContent = colG.match(/(\((.*?)\))|（(.*?)）/); // 数值有括号内容，检查中文或英文括号 // The value has bracket content, check Chinese or English brackets
        if (bracketContent) {
            colG = colG.replace(bracketContent[0], ''); // 剔除括号内容 //Remove bracket content
            let parts = colG.split('-');
            if (parts.length === 1) { // 检查有没有 '-' // Check if there is '-'
                colG = parts[0] + '-' + (bracketContent[2] || bracketContent[3]); // 添加内容到 '-' 后面 //Add content after '-'
            }
        }
        totalALLC = totalALLC + colJ; //添加J数值到totalALL //Add J value to totalALL

        const regex = /\n/g;
        const cellValue = row[colNameToIndex('E')]
        console.log(cellValue.replace(regex, '\n'));

        // 对svgText进行多次替换操作 // Perform multiple replacement operations on svgText
        svgText = svgText
            .replace(`@R${svgRow}EX`, row[colNameToIndex('E')]) // 将E列的值替换到对应位置 // Replace the value in column E to the corresponding position
            .replace(`@R${svgRow}GE`, colG.split('-')[0]) // 将colG的值的第一部分替换到对应位置  //Replace the first part of the value of colG to the corresponding position
            .replace(`@R${svgRow}SU`, colG.split('-')[1] || `@R${svgRow}SU`) // 将colG的值的第二部分替换到对应位置，如果第二部分不存在，则不替换  //Replace the second part of the value of colG to the corresponding position. If the second part does not exist, it will not be replaced.
            .replace(`@R${svgRow}CA`, (row[colNameToIndex('J')] >= 0 ? Math.floor(row[colNameToIndex('J')]) : Math.ceil(row[colNameToIndex('J')])).toString().replace('-', '—').replace(/(\d)/g, '$1 ')) // 将J列的值的整数部分替换到对应位置，并在所有数字字符之间添加空格,增加￥在开头 //Replace the decimal part of the value in column J to the corresponding position and add spaces between all numeric characters
            .replace(`@R${svgRow}CD`, (row[colNameToIndex('J')] % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 ')) // 将J列的值的小数部分替换到对应位置，并在所有数字字符之间添加空格 //Replace the decimal part of the value in column J to the corresponding position and add spaces between all numeric characters

        svgRow += 1;// svgRow行数增加 (注意在js的其他部分中，变更key后svgRow会重设0) //The number of svgRow rows increases (note that in other parts of js, svgRow will be reset to 0 after changing the key)
    }

    ///

    // 承接之前的svgText, 当isLastRow 为 true (下一行Excel是不同的key)，运行以下操作 // Use the previous svgText, when isLastRow is true (the next row of Excel has a different key), run the following operations
    if (isLastRow !== false) {
        if (totalALLD !== 0)

            //翻译为中文
            //formats an SVG variable with totalALLD values by replacing placeholder strings with formatted amounts, including converting decimal places into Chinese characters.
            if (totalALLD !== 0) {
                svgText = svgText
                    .replace('@TDA', '￥' + (totalALLD >= 0 ? Math.floor(totalALLD) : Math.ceil(totalALLD)).toString().replace('-', '—').replace(/(\d)/g, '$1 '))
                    .replace('@TDD', (totalALLD % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 '))
                if (totalALLC === totalALLD || totalALLC === 0) { //借贷相等或其中一方为0 //Check if credit and debit not inbalanced or one of them equal 0
                    let CNT = [];
                    if (typeof totalALLD !== "undefined") {
                        if (totalALLD >= 0) {
                            CNT = intToChineseArray(Math.floor(totalALLD));
                        } else {
                            CNT = intToChineseArray(Math.ceil(totalALLD));
                        }
                        let CNTD = intToChineseArray((totalALLD % 1).toFixed(2));
                        svgText = svgText
                            .replace('@0', typeof CNT !== 'undefined' ? CNT[0] : '')
                            .replace('@1', typeof CNT !== 'undefined' ? CNT[1] : '')
                            .replace('@2', typeof CNT !== 'undefined' ? CNT[2] : '')
                            .replace('@3', typeof CNT !== 'undefined' ? CNT[3] : '')
                            .replace('@4', typeof CNT !== 'undefined' ? CNT[4] : '')
                            .replace('@5', typeof CNT !== 'undefined' ? CNT[5] : '')
                            .replace('@6', typeof CNT !== 'undefined' ? CNT[6] : '')
                            .replace('@7', typeof CNT !== 'undefined' ? CNT[7] : '')
                            .replace('@8', typeof CNT !== 'undefined' ? CNT[8] : '')
                            .replace('@Z', CNTD[0])
                            .replace('@X', CNTD[1])
                    }
                } else { //借贷不等 //credit and debit inbalanced
                    TVoucherNotBalanced()
                }
            }

        //翻译为中文
        //formats an SVG variable with totalALLC values by replacing placeholder strings with formatted amounts, including converting decimal places into Chinese characters.
        if (totalALLC !== 0) {
            svgText = svgText
                .replace('@TCA', '￥' + (totalALLC >= 0 ? Math.floor(totalALLC) : Math.ceil(totalALLC)).toString().replace('-', '—').replace(/(\d)/g, '$1 '))
                .replace('@TCD', (totalALLC % 1).toFixed(2).toString().substring(2).replace('.', '').replace(/(\d)/g, '$1 '))
            if (totalALLC === totalALLD || totalALLD === 0) { //借贷相等或其中一方为0 //Check if credit and debit not inbalanced or one of them equal 0
                let CNT = [];
                if (typeof totalALLC !== "undefined") {
                    if (totalALLC >= 0) {
                        CNT = intToChineseArray(Math.floor(totalALLC));
                    } else {
                        CNT = intToChineseArray(Math.ceil(totalALLC));
                    }
                    let CNTD = intToChineseArray((totalALLC % 1).toFixed(2));
                    svgText = svgText
                        .replace('@0', typeof CNT !== 'undefined' ? CNT[0] : '')
                        .replace('@1', typeof CNT !== 'undefined' ? CNT[1] : '')
                        .replace('@2', typeof CNT !== 'undefined' ? CNT[2] : '')
                        .replace('@3', typeof CNT !== 'undefined' ? CNT[3] : '')
                        .replace('@4', typeof CNT !== 'undefined' ? CNT[4] : '')
                        .replace('@5', typeof CNT !== 'undefined' ? CNT[5] : '')
                        .replace('@6', typeof CNT !== 'undefined' ? CNT[6] : '')
                        .replace('@7', typeof CNT !== 'undefined' ? CNT[7] : '')
                        .replace('@8', typeof CNT !== 'undefined' ? CNT[8] : '')
                        .replace('@Z', CNTD[0])
                        .replace('@X', CNTD[1])
                }
            } else { //借贷不等 //credit and debit inbalanced
                TVoucherNotBalanced()
            }
        }

        //Function for credit and debit inbalanced
        function TVoucherNotBalanced() {
            svgText = svgText
                .replace('@0', '*平')
                .replace('@1', '*未')
                .replace('@2', '***')
                .replace('@3', '***')
                .replace('@4', '***')
                .replace('@5', '***')
                .replace('@6', '***')
                .replace('@7', '***')
                .replace('@8', '***')
                .replace('@Z', '***')
                .replace('@X', '***')
        }
    }

    return svgText;
}
////////////////////////////////////



