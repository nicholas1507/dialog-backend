const { Op } = require('sequelize');
const {decryptPwd} = require('../utils/bcrypt');
const {User,Role} = require('../models')
class UserController{

    static async getAllUsers(req,res){
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = (req.query.search || "").trim();
            const offset = (page - 1) * limit;
            const users = await User.findAll({
                attributes: ['id', 'name', 'email'],
                include: [
                    {model: Role, as: 'roles', attributes: ['id', 'name']},
                ],
                where: search ? {name : { [Op.iLike]: `%${search}%` }} : {},
                offset,
                limit
            });
            const total = await User.count({
                where: search ? {name : { [Op.iLike]: `%${search}%` }} : {}
            });
            res.status(200).json({
                data: users,
                pagination : {
                    page,
                    limit,
                    totalData: total,
                    totalPage: Math.ceil(total/limit)
                }
            });
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async getMyUser(req,res){
        try{
            const userId = req.user.id;
            if(!userId) return res.status(403).json({error: `UserId isn't available!`})
            const userData = await User.findOne({where: {id: userId}});
            if(!userData) return res.status(404).json({error: `User not found!`});
            res.status(200).json({
                id: userData.id,
                name: userData.name,
                email: userData.email,
            });
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async createUser(req,res){
        try{
            const {name,email,password,confirmationPassword,roleIds} = req.body;
            const checkEmail = await User.findOne({where: {email: email}});
            if(checkEmail){
                return res.status(400).json({error: `Email already used,try another email!`});
            }
            if(password !== confirmationPassword){
                return res.status(400).json({error: `Password and confirmation password do not match!`});
            }
            const role = await Role.findAll({where: {id: roleIds}});
            if(!role) return res.status(404).json({error: `Role not found!`});
            const user = await User.create({name,email,password});
            await user.setRoles([roleIds]);
            res.status(201).json(user);
        }catch(error){
            res.status(500).json({
                error: error.message
            })
        }
    }

    static async getUserById(req,res){
        try{
            const id = req.params.id;
            const user = await User.findByPk(id,{
                attributes: ['id', 'name', 'email'],
                include: [{model: Role, as: 'roles', attributes: ['id', 'name']}]
            });
            if(!user) return res.status(404).json({error: `User id ${id} is not avalaible`});
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async updateUser(req,res){
        try{
            const id = req.params.id;
            const {name, email, password,confirmationPassword, roleIds} = req.body;
            const data = {};
            if(name) data.name = name;
            if(email) data.email = email;
            if(password) {
                if (password !== confirmationPassword) {
                    return res.status(400).json({ message: "Passwords do not match" });
                }
                data.password = password
            }
            const user = await User.findByPk(id);
            if(!user) return res.status(404).json({error: `User not found`});
            await user.update(data);
            if(Array.isArray(roleIds) && roleIds.length){
                await user.setRoles(roleIds);
            }
            res.status(200).json(user)
        }catch(error){
            console.error("ERROR : ",error);
            res.status(500).json({
                error: error.message
            });
        }
    }

    static async updateMyUser(req,res){
        try{
            const userId = req.user.id;
            const {name, password,confirmPassword,prevPassword} = req.body;
            const user = await User.findOne({where: {id: userId}});
            if(!user) return res.status(404).json({error: `user not found!`});
            if(name !== undefined) user.name = name;
            if(password !== confirmPassword) return res.status(400).json({error: `Password and confirm password do not match!`});
            if(prevPassword !== undefined){
                const validation = decryptPwd(prevPassword,user.password);
                if(!validation) return res.status(400).json({error: `Previous password is incorrect`});
            }
            if(password !== undefined){
                user.password = password;
            };
            await user.save();
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async deleteUser(req,res){
        try{
            const id = req.params.id;
            const user = await User.findByPk(id);
            if(!user) return res.status(404).json({error: `User not found`});
            const roles = await user.countRoles();
            if(roles.length > 0){
                return res.status(400).json({error: `Cant delete user that already has roles!`});
            }
            await user.destroy();
            res.status(200).json({message: `User with id ${id} has been successfully deleted!`});
        }catch(err){
            res.status(500).json(err);
        }
    }

}

module.exports = UserController;