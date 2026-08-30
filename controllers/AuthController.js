require('dotenv').config();
const {User,Role,sequelize} = require('../models');
const {decryptPwd} = require('../utils/bcrypt');
const {generateToken} = require('../utils/jsonwebtoken');
const createError = require('../utils/createError');
class AuthController{
static async register(req,res,next){
        try{
            const result = await sequelize.transaction(async (t) => {
                const {name,email,password,roleIds} = req.body;
                if(!name || !email || !password){
                    throw createError("REQUIRED FORM CANNOT BE EMPTY!",400);
                }
                if(!Array.isArray(roleIds) || roleIds.length === 0){
                    throw createError("roleIds must be a non-empty array!",401);
                }
                const existing = await User.findOne({where: {email: email}, transaction: t});
                if(existing) throw createError("Email already used,try another!",400);
                
                const roles = await Role.findAll({where: {id: roleIds}, transaction: t});
                if(roles.length === 0 || roles.length !== roleIds.length ) throw createError("Role EROR!",400);
                if(roles.some(role => role.name === "Admin")){
                    throw createError("Admin cannot be registered!",400);
                }

                const user = await User.create({name,email,password}, {transaction: t});
                await user.setRoles(roleIds, {transaction: t});

                return {id: user.id, name: user.name};
            });

            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async login(req,res,next){
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
        next(error);
    }
    }
}
module.exports = AuthController;