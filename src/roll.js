const roll = function (text = '6') {

    let number = parseInt(text);

    if (isNaN(number)) {
        number = 6;
    }
    let rolled;
    if (number > 0) {
        rolled = Math.round((number - 1) * Math.random() + 1);
    }
    else if (number === 0) {
        rolled = 'Inf';
    }
    else {
        const rollWeird = (n) => Math.round((2 * n * Math.random() - n) * 1000) / 1000;
        let imag = rollWeird(number);
        if (imag >= 0) {
            imag = '+' + imag;
        }
        rolled = `${rollWeird(number)}${imag}i`;
    }

    return {number, rolled};

    /*
    // Convert to string
    n = n + '';

    // Apply regexp, e.g. 1.308e100
    let tokens = /(([+-]?)\d+(\.\d+)?)([eE](([+-]?)\d+))?/.exec(n);

    let sign_base, base, sign_power, power;
    if (tokens === null) {
        sign_base = 1;
        base = 6;
        sign_power = 1;
        power = 1;
    }
    else {
        sign_base = tokens[2];
        base = parseFloat(tokens[1]);
        sign_power = tokens[6];
        power = parseInt(tokens[5]);
    }

    // Normalize base


    return {sign_base, base, sign_power, power, tokens};

    const powerroll = function(base, power){
        if(Math.abs(power) <== 15){

        }
        else{

        }

        return {base, power};
    };

    return n;
    */
};

module.exports = roll;