function roundTo16(coeffStr, isNegative) {
    const method = document.getElementById('round').value
    console.log('=== ROUNDING ===')
    console.log(method)

    // split coeff into first 16 digits and the rest
    const coeffStr_whole = coeffStr.slice(0, 16)
    const coeffStr_fraction = coeffStr.slice(16)
    console.log(`coeff whole part (first 16 digits): ${coeffStr_whole}`)
    console.log(`coeff fractional part: ${coeffStr_fraction}`)
    
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
    // JS has precision issues with representing >16 digits since it uses binary-64 format 
    // for example (can test these in console), 
    // 1234123412341234.1 will be represented as 1234123412341234 (immediately rounded off)
    // 1234123412341234.9 will be represented as 1234123412341235 (immediately rounded off)
    // 1234123412341234.45 will be represented as 1234123412341234.5 (causes issues depending if ties even or ties away)
    // since we need to account for different rounding methods such as to +/-inf, 
    // we can instead round based on the first digit of the fractional part so there is no loss in precision
    const coeffNum_whole = parseInt(coeffStr_whole)
    const first_fraction_digit = coeffStr_fraction.charAt(0)
    
    // "round" based on first fraction digit (will result in either 0 or 1), and add it to whole part
    let coeffNum_fraction_rounded = null

    roundTiesAway = frac => ((frac >= '0') && (frac <= '4')) ? 0 : 1
    roundUp = frac => (frac === '0') ? 0 : 1

    switch (method) {
        case '2even':            
            // if fractional part is exactly 5 with no digits after it:
            console.log(`trimmed coeff fractional part: ${trimTrailingZeros(coeffStr_fraction)}`)
            if (trimTrailingZeros(coeffStr_fraction) === '5') {
                // check whole part: if even, add 0, else add 1
                coeffNum_fraction_rounded = coeffNum_whole % 2
            } else {
                coeffNum_fraction_rounded = roundTiesAway(first_fraction_digit)
            }
            break
        case '2notz':
            coeffNum_fraction_rounded = roundTiesAway(first_fraction_digit)
            break
        case '2zero':
            coeffNum_fraction_rounded = 0
            break
        case 'rndup':
            coeffNum_fraction_rounded = isNegative ? 0 : roundUp(first_fraction_digit) 
            break
        case 'rndown':
            coeffNum_fraction_rounded = isNegative ? roundUp(first_fraction_digit) : 0
    }

    const coeffNum_rounded = coeffNum_whole + coeffNum_fraction_rounded
    console.log(`final rounded coeff: ${coeffNum_rounded}`)
    console.log('================')
    return coeffNum_rounded.toString()
}

function trimTrailingZeros(str) {
    for (let i = str.length - 1; i >= 0; i--) {
        if (str.charAt(i) !== '0')
            return str.slice(0, i + 1)
    }
    return ''
}

function normalize(coeffInput, expInput) {
    // separate input into integer and fractional part
    const [_, minus_sign, coeff_whole, coeff_fraction] = coeffInput.match(/^(-?)([0-9]+)(?:\.([0-9]+))?$/)
    console.log('=== NORMALIZATION ===')
    console.log(`minus_sign: ${minus_sign}`)
    console.log(`coeff_whole: ${coeff_whole}`)
    console.log(`coeff_fraction: ${coeff_fraction}`)

    const sign_bit = (minus_sign === '-') ? 1 : 0
    let coeff = coeff_whole
    let exp = parseInt(expInput)

    // if there is a fractional part, adjust exponent and combine into coefficient
    if (coeff_fraction) {
        // remove trailing zeros from fraction
        coeff_fraction_trimmed = trimTrailingZeros(coeff_fraction)
        console.log(`coeff_fraction_trimmed: ${coeff_fraction_trimmed}`)

        coeff += coeff_fraction_trimmed
        console.log(`coeff: ${coeff}`)
        exp += coeff_fraction_trimmed.length
        console.log(`exp after removing decimal: ${exp}`)
    } 

    // if full coefficient has more than 16 digits, round
    if (coeff.length > 16) {
        // adjust exponent such that the decimal point is after the 16th digit
        exp -= coeff.length - 16
        console.log(`exp after rounding: ${exp}`)

        coeff = roundTo16(coeff, (minus_sign === '-'))
    }

    // if full coefficient has less than 16 digits, pad
    coeff = coeff.padStart(16, '0')

    console.log('RETURN VALUES')
    console.log(`sign bit: ${sign_bit}`)
    console.log(`coeff: ${coeff}`)
    console.log(`final exp: ${exp}`)
    console.log('=====================')
    return [sign_bit, coeff, exp]
}

function exportTxtFile(sbit, cf, expfield, bcd1, bcd2, bcd3, bcd4, bcd5, dec64hex){
    let content = `sign-bit: ${sbit}\ncombination field: ${cf}\n` +
                  `exponent field: ${expfield}\ncoefficient continuation: ${bcd1} ${bcd2} ${bcd3} ${bcd4} ${bcd5}\n` +
                  `hexadecimal: ${dec64hex}`

    let blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    let url = URL.createObjectURL(blob)
    let a = document.getElementById('convertButton')
    a.href = url
    a.download = 'convertedOutput.txt'
}

function convertToDecimal64() {
    // let dec = 0

    let exp = document.getElementById("exponent").value
    let strDec = document.getElementById("decimalInput").value

    console.log(strDec)
    console.log(exp)

    let sbit
    [sbit, strDec, exp] = normalize(strDec, exp)
    let msd = strDec.charAt(0)

    console.log(strDec)
    console.log(exp)

    //if dec input is greater than 16 digits
    // if (dec > 9999999999999999) {
    //     console.log("error")
    // }
    

    // let msd = ''

    // //checks for negative
    // if(dec < 0) {
    //     sbit = 1
    //     msd = strDec.charAt(1)
    // }
    // else {
    //     sbit = 0
    //     msd = strDec.charAt(0)
    // }

    console.log(`Sign bit: ${sbit}`)
    console.log(`MSD: ${msd}`)

    let eprime = exp + 398
    console.log(`E': ${eprime}`)

    function decimalToBinary(decimalNumber) { 
        let binaryString = decimalNumber.toString(2)
        // Pad the binary string with leading zeros
        let paddedBinaryString = binaryString.padStart(4, '0')

        return paddedBinaryString
    }

    //makes e' to binary
    function epToBinary(decimalNumber) { 
        let binaryString = decimalNumber.toString(2)
        let paddedBinaryString = binaryString.padStart(10, '0')

        return paddedBinaryString
    } 

    binMsd = decimalToBinary(parseInt(msd))
    console.log(`MSD binary: ${binMsd}`)
    binEp = epToBinary(eprime)
    console.log(`E' binary: ${binEp}`)

    let cf = ''
    //gets combi field
    // new update: added special cases
    if (exp > 369) {
        cf = "11110"
    } else if (exp < -398){
        cf = "01000"
    } else if (exp == "nan" || exp == "NaN" || exp == "NAN") {
        cf = '11111'
    } else {
        if (parseInt(msd) < 8) {
            cf = binEp.substring(0,2) + binMsd.slice(-3)
        }
        else {
            cf = "11" + binEp.substring(0,2) + binMsd.slice(-1)
        }
    }
    console.log(`Combi Field: ${cf}`)

    //exp field
    // new update: added denormalized case i.e. exp = < -398
    if (cf === "01000") {
        expfield = "01100101"
    } else {
        expfield = binEp.slice(-8)
    }
    console.log(`Exp Field: ${expfield}`)

    //makes int to packed bcd, pads 0s if less than 4 bits
    function decimalTo3digitbin(decimalNumber) {
        let binaryString = ''
    
        // Convert each digit to binary and pad to 4 bits
        for (let i = 0; i < 3; i++) {
            let digit = (decimalNumber % 10).toString(2).padStart(4, '0')
            binaryString = digit + binaryString // prepend the binary representation
            decimalNumber = Math.floor(decimalNumber / 10) // move to the next digit
        }
        
        return binaryString;
    }

    function decimalToDenselyPackedBCD(number) {
        // if negative, convert to positive
        number *= (number < 0) ? -1 : 1
        return convertToDenselyPacked(decimalTo3digitbin(number).split(''));
    }
    
    function convertToDenselyPacked(packed) {
        const keys = [packed[0], packed[4], packed[8]] // iea
    
        if (keys.every((val, index) => val === ['0', '0', '0'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                packed[5], packed[6], packed[7], // fgh
                '0', packed[9], packed[10], packed[11] // 0jkm
            ].join('')
        } else if (keys.every((val, index) => val === ['0', '0', '1'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                packed[5], packed[6], packed[7], // fgh
                '1', '0', '0', packed[11] // 100m
            ].join('')
        } else if (keys.every((val, index) => val === ['0', '1', '0'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                packed[9], packed[10], packed[7], // jkh
                '1', '0', '1', packed[11] // 100m
            ].join('')
        } else if (keys.every((val, index) => val === ['0', '1', '1'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                '1', '0', packed[7], // 10h
                '1', '1', '1', packed[11] // 111m
            ].join('')
        } else if (keys.every((val, index) => val === ['1', '0', '0'][index])) {
            return [
                packed[9], packed[10], packed[3], // jkd
                packed[5], packed[6], packed[7], // fgh
                '1', '1', '0', packed[11] // 110m
            ].join('')
        } else if (keys.every((val, index) => val === ['1', '0', '1'][index])) {
            return [
                packed[5], packed[6], packed[3], // fgd
                '0', '1', packed[7], // 01h
                '1', '1', '1', packed[11] // 111m
            ].join('')
        } else if (keys.every((val, index) => val === ['1', '1', '0'][index])) {
            return [
                packed[9], packed[10], packed[3], // jkd
                '0', '0', packed[7], // 00h
                '1', '1', '1', packed[11] // 111m
            ].join('')
        } else if (keys.every((val, index) => val === ['1', '1', '1'][index])) {
            return [
                '0', '0', packed[3], // 00d
                '1', '1', packed[7], // 11h
                '1', '1', '1', packed[11] // 111m
            ].join('')
        }
    
        return ''
    }

    //initialize coeff continuation
    let f1 = ''
    let f2 = ''
    let f3 = ''
    let f4 = ''
    let f5 = ''

    //gets coeff continuation checks if sign bit is pos or nega
    // if(sbit == 0) {
    function dec1(string) {
        let coeffcont = string.substring(1, 4)
    
        return coeffcont
    }

    function dec2(string) {
        let coeffcont = string.substring(4, 7);
    
        return coeffcont;
    }

    function dec3(string) {
        let coeffcont = string.substring(7, 10);
    
        return coeffcont;
    }

    function dec4(string) {
        let coeffcont = string.substring(10, 13);
    
        return coeffcont;
    }

    function dec5(string) {
        let coeffcont = string.substring(13, 16);
    
        return coeffcont;
    }

    // NEW UPDATE : added trailing zeros for 0/"denormalized" cases
    if (cf === "01000") {
        strDec = '0'.repeat(50)
    }

    f1 = dec1(strDec)
    f2 = dec2(strDec)
    f3 = dec3(strDec)
    f4 = dec4(strDec)
    f5 = dec5(strDec)
    // }  
    // else {
    //     function dec1(string) {
    //         let coeffcont = string.substring(2, 5)
        
    //         return coeffcont
    //     }
    
    //     function dec2(string) {
    //         let coeffcont = string.substring(5, 8);
        
    //         return coeffcont;
    //     }
    
    //     function dec3(string) {
    //         let coeffcont = string.substring(8, 11);
        
    //         return coeffcont;
    //     }
    
    //     function dec4(string) {
    //         let coeffcont = string.substring(11, 14);
        
    //         return coeffcont;
    //     }
    
    //     function dec5(string) {
    //         let coeffcont = string.substring(14, 17);
        
    //         return coeffcont;
    //     }
    //     f1 = dec1(strDec)
    //     f2 = dec2(strDec)
    //     f3 = dec3(strDec)
    //     f4 = dec4(strDec)
    //     f5 = dec5(strDec)
    // } 

    console.log('Coeff Cont. Decimal:')
    console.log(f1)
    console.log(f2)
    console.log(f3)
    console.log(f4)
    console.log(f5)

    bcd1 = decimalToDenselyPackedBCD(f1)
    bcd2 = decimalToDenselyPackedBCD(f2)
    bcd3 = decimalToDenselyPackedBCD(f3)
    bcd4 = decimalToDenselyPackedBCD(f4)
    bcd5 = decimalToDenselyPackedBCD(f5)



    console.log('Coeff Cont. BCD:')
    console.log(bcd1)
    console.log(bcd2)
    console.log(bcd3)
    console.log(bcd4)
    console.log(bcd5)

    //dec 64 fp rep in binary
    let dec64 = sbit + cf + expfield + bcd1 + bcd2 + bcd3 + bcd4 + bcd5
    console.log(`Dec-64 Binary: ${dec64}`)

    function binaryToHex(binaryString) {  
        // Convert binary string to hexadecimal
        let hexString = '';
        for (let i = 0; i < 64; i += 4) {
            let chunk = binaryString.substring(i, i + 4);
            let hexDigit = parseInt(chunk, 2).toString(16);
            hexString += hexDigit.toUpperCase();
        }
    
        return hexString;
    }
    let dec64hex = binaryToHex(dec64)
    console.log(document.getElementById("exptxt").checked)
    if (document.getElementById("exptxt").checked) {
        exportTxtFile(sbit, cf, expfield, bcd1, bcd2, bcd3, bcd4, bcd5, dec64hex)
    }
    console.log(`Dec-64 Hex: ${dec64hex}`)
    document.getElementById("sign-bit").innerText = sbit
    document.getElementById("comb-field").innerText = cf
    document.getElementById("exp-cont").innerText = expfield
    document.getElementById("coeff-cont").innerText = bcd1 + " " + bcd2 + " " + bcd3 + " " + bcd4 + " " + bcd5
    document.getElementById("decimal64Output").innerText = dec64hex
}

function checkInput () {
    let decErrFlag = false
    let expErrFlag = false

    document.getElementById("err-msg").innerText = ""

    let decimalInput = document.getElementById("decimalInput").value
    let exp = document.getElementById("exponent").value
    if (!/^-?[0-9]+(?:\.[0-9]+)?$/.test(decimalInput)) {
        console.log("error: invalid input");
        decErrFlag = true
    }
    if (!(parseInt(exp) || exp.toLowerCase() === "nan")) {
        console.log("error: invalid exponent");
        expErrFlag = true
    }

    if (decErrFlag || expErrFlag) {
        let errmsg = ""
        if (decErrFlag) {
            errmsg += "Invalid decimal. "
        }
        if (expErrFlag) {
            errmsg += "Invalid exponent. "
        }
        errmsg += "Try Again."
        document.getElementById("err-msg").innerText = errmsg
    } else {
        convertToDecimal64()
    }
}