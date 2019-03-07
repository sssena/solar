/* @author. sena@soompay.net
 * @comment. check string format is matched with address format.
 * */
function isAddress( address ) {
    // check if it has the basic requirements of an address
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return false;
        // If it's ALL lowercase or ALL upppercase
    } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
        return true;
        // Otherwise check each case
    }
    return false;
}

const utils = {
    isAddress
}

export default utils;
