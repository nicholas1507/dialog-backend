require('dotenv').config();
const {User,Role} = require('../models');
const {encryptPwd,decryptPwd} = require('../utils/bcrypt');
const {generateToken} = require('../utils/jsonwebtoken');

class AuthController{
    static async register(req,res){
        try{
            const {name,email,password,roleIds} = req.body;
            if(!name || !email || !password){
                return res.status(404).json({error: "REQUIRED FORM CANNOT BE EMPTY!"});
            }
            if(!Array.isArray(roleIds) || roleIds.length === 0){
                return res.status(400).json({error: "roleIds must be a non-empty array!"});
            }
            const existing = await User.findOne({where: {email: email}});
            if(existing) return res.status(400).json({error: "Email already used,try another!"});
            const user = await User.create({name,email,password});
            const roles = await Role.findAll({where: {id: roleIds}});
            if(roles.length === 0 || roles.length !== roleIds.length ) return res.status(404).json({error: `Role EROR!`});
            if(roles.some(role => role.name === "Admin")){
                return res.status(400).json({error: `Admin cannot be registered!`})
            }
            await user.setRoles(roleIds);
            res.status(200).json({id: user.id,name:user.name});
        }catch(error){
            console.error(error);
            res.status(500).json(error);
        }
    }
    static async login(req,res){
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(404).json({error: `Email & Password cant be empty`});
        }
        const user = await User.findOne({
            where:{email},
            include:[
                {
                    model:Role,
                    as:'roles',
                    attributes:['id','name']
                }
            ]
        });
        if(!user) return res.status(404).json({error: `Email not found!`});
        const validation = await decryptPwd(password,user.password);
        if(!validation) return res.status(400).json({error: `Password incorrect!`});
        const roles = user.roles.map(role => role.name);
        const userData = {id: user.id,roles: roles}
        const token = await generateToken(user.dataValues);
        // console.log(user.roles[0].dataValues);
        res.status(200).json({token,userData});
    }catch(error){
        console.error(error);
        res.status(500).json({
            message: error
        });
    }
    }
}
module.exports = AuthController;