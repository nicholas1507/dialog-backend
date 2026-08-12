const bcrypt = require('bcrypt');
const saltRound = Number(process.env.SALT_ROUND) || 10;

const encryptPwd = (data) => {
    return bcrypt.hashSync(data, saltRound);
}
const decryptPwd = (data, hashPwd) => {
    return bcrypt.compareSync(data, hashPwd);
}

module.exports = {
    encryptPwd, decryptPwd
}