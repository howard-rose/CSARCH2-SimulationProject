/*
error checking exp -398 to 369
make base 16 digits
get msd and convert e' to binary 10 bits DONE
e'= e + 398 DONE
sign bit 0 or 1 DONE
get cf DONE
    - check msb if 0-7 or 8-9
    - if 0-7 e' first 2 msb, msd last 3 bits
    - if 8-9 11 then e' first 2 msb, msd last bit
last 8 of e'
densely packed bcd of rest of base
convert to hex
*/

function convertToDecimal64() {
    let inpType = document.getElementById("binType").checked ? "binary" : "decimal";
    let dec = 0
    let exp = 0
    let errmsg = ""
    
    if (inpType === "binary") {
        let bin = document.getElementById("decimalInput").value
        console.log("binary " + bin)
        dec = parseInt(bin, 2)
        console.log("decimal ver " + dec)
        bin = document.getElementById("exponent").value
        console.log("exp bin " + bin)
        exp = parseInt(bin, 2)
        console.log("exp dec-ver " + exp)
    } else {
        let decimalInput = document.getElementById("decimalInput").value;
        if (/^[01]+$/.test(decimalInput)) {
            console.log("error: invalid input");
            errmsg = "Invalid input. You must enter a decimal number."
            document.getElementById("err-msg").innerText = errmsg
            return;
        }
        dec = Math.round(document.getElementById("decimalInput").value)
        exp = document.getElementById("exponent").value
        console.log(dec)
        console.log(exp)
    }

    console.log(inpType)

    if (dec > 9999999999999999) {
        console.log("error")
    }

    let strDec = dec.toString();
    let msd = ''

    if(dec < 0) {
        sbit = 1
        msd = strDec.charAt(1)
    }
    else {
        sbit = 0
        msd = strDec.charAt(0)
    }

    console.log(sbit)
    console.log(msd)
    let eprime = parseInt(exp) + 398
    console.log(eprime)

    function decimalToBinary(decimalNumber) { 
        let binaryString = decimalNumber.toString(2);
        let leadingZeros = 4 - binaryString.length;

    // Pad the binary string with leading zeros
        let paddedBinaryString = '0'.repeat(leadingZeros) + binaryString;

        return paddedBinaryString;
    }

    function epToBinary(decimalNumber) { 
        let binaryString = decimalNumber.toString(2);
        let leadingZeros = 10 - binaryString.length;
        let paddedBinaryString = '0'.repeat(leadingZeros) + binaryString;

        return paddedBinaryString;
    } 
    binMsd = decimalToBinary(parseInt(msd))
    console.log(binMsd)
    binEp = epToBinary(eprime)
    console.log(binEp)

    let cf = ''

    if (parseInt(msd) < 8) {
        cf = binEp.substring(0,2) + binMsd.slice(-3)
    }
    else {
        cf = "11" + binEp.substring(0,2) + binMsd.slice(-1)
    }
    console.log(cf)

    expfield = binEp.slice(-8)
    console.log(expfield)

    function decimalTo3digitbin(decimalNumber) {
        let binaryString = '';
    
        // Convert each digit to binary and pad to 4 bits
        for (let i = 0; i < 3; i++) {
            let digit = (decimalNumber % 10).toString(2).padStart(4, '0');
            binaryString = digit + binaryString; // prepend the binary representation
            decimalNumber = Math.floor(decimalNumber / 10); // move to the next digit
        }
        
        return binaryString;
    }

    function decimalToDenselyPackedBCD(number) {
        // if negative, convert to positive
        number *= (number < 0) ? -1 : 1;
        return convertToDenselyPacked(decimalTo3digitbin(number).split(''));
    }
    
    function convertToDenselyPacked(packed) {
        const keys = [packed[0], packed[4], packed[8]]; // iea
    
        if (keys.every((val, index) => val === ['0', '0', '0'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                packed[5], packed[6], packed[7], // fgh
                '0', packed[9], packed[10], packed[11] // 0jkm
            ].join('');
        } else if (keys.every((val, index) => val === ['0', '0', '1'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                packed[5], packed[6], packed[7], // fgh
                '1', '0', '0', packed[11] // 100m
            ].join('');
        } else if (keys.every((val, index) => val === ['0', '1', '0'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                packed[9], packed[10], packed[7], // jkh
                '1', '0', '1', packed[11] // 100m
            ].join('');
        } else if (keys.every((val, index) => val === ['0', '1', '1'][index])) {
            return [
                packed[1], packed[2], packed[3], // bcd
                '1', '0', packed[7], // 10h
                '1', '1', '1', packed[11] // 111m
            ].join('');
        } else if (keys.every((val, index) => val === ['1', '0', '0'][index])) {
            return [
                packed[9], packed[10], packed[3], // jkd
                packed[5], packed[6], packed[7], // fgh
                '1', '1', '0', packed[11] // 110m
            ].join('');
        } else if (keys.every((val, index) => val === ['1', '0', '1'][index])) {
            return [
                packed[5], packed[6], packed[3], // fgd
                '0', '1', packed[7], // 01h
                '1', '1', '1', packed[11] // 111m
            ].join('');
        } else if (keys.every((val, index) => val === ['1', '1', '0'][index])) {
            return [
                packed[9], packed[10], packed[3], // jkd
                '0', '0', packed[7], // 00h
                '1', '1', '1', packed[11] // 111m
            ].join('');
        } else if (keys.every((val, index) => val === ['1', '1', '1'][index])) {
            return [
                '0', '0', packed[3], // 00d
                '1', '1', packed[7], // 11h
                '1', '1', '1', packed[11] // 111m
            ].join('');
        }
    
        return '';
    }

    function dec1(string) {
        // Convert the decimal to a string
        // Extract the next three digits
        let coeffcont = string.substring(1, 4);
    
        return coeffcont;
    }

    function dec2(string) {
        // Convert the decimal to a string
        // Extract the next three digits
        let coeffcont = string.substring(4, 7);
    
        return coeffcont;
    }

    function dec3(string) {
        // Convert the decimal to a string
        // Extract the next three digits
        let coeffcont = string.substring(7, 10);
    
        return coeffcont;
    }

    function dec4(string) {
        // Convert the decimal to a string
        // Extract the next three digits
        let coeffcont = string.substring(10, 13);
    
        return coeffcont;
    }

    function dec5(string) {
        // Convert the decimal to a string
        // Extract the next three digits
        let coeffcont = string.substring(13, 16);
    
        return coeffcont;
    }
    let f1 = dec1(strDec)
    console.log(f1)
    let f2 = dec2(strDec)
    console.log(f2)
    let f3 = dec3(strDec)
    console.log(f3)
    let f4 = dec4(strDec)
    console.log(f4)
    let f5 = dec5(strDec)
    console.log(f5)

    bcd1 = decimalToDenselyPackedBCD(f1)
    bcd2 = decimalToDenselyPackedBCD(f2)
    bcd3 = decimalToDenselyPackedBCD(f3)
    bcd4 = decimalToDenselyPackedBCD(f4)
    bcd5 = decimalToDenselyPackedBCD(f5)

    console.log(bcd1)
    console.log(bcd2)
    console.log(bcd3)
    console.log(bcd4)
    console.log(bcd5)

    let dec64 = sbit + cf + expfield + bcd1 + bcd2 + bcd3 + bcd4 + bcd5
    console.log(dec64)

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
    console.log(dec64hex)
    document.getElementById("sign-bit").innerText = sbit
    document.getElementById("comb-field").innerText = cf
    document.getElementById("exp-cont").innerText = expfield
    document.getElementById("coeff-cont").innerText = bcd1 + " " + bcd2 + " " + bcd3 + " " + bcd4 + " " + bcd5
    document.getElementById("decimal64Output").innerText = dec64hex
}
