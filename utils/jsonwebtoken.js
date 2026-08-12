const jwt = require('jsonwebtoken');
const secretCode = process.env.JWT_SECRET_TOKEN

const generateToken = (data) => {
    const {id, name} = data;
    const roles = data.roles.map(role => role.name);
    // console.log(id);
    return jwt.sign({id, name,roles}, secretCode, {expiresIn: '1h'});
}
const verifyToken = (token) => {
    return jwt.verify(token, secretCode);
}

module.exports = {
    generateToken, verifyToken
}