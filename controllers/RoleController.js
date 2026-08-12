const {Role, User} = require('../models');

class RoleController{

    static async getAllRoles(req,res){
        try{
            const roles = await Role.findAll({
                include: [{model: User, as: 'users', attributes:['id','name','email']}],
                order: [['id', "ASC"]]
            });
            res.status(200).json(roles);
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async getRoleById(req,res){
        try{
            const id = req.params.id;
            const role = await Role.findByPk(id,{
                include:[{model: User, attributes:['id','name','email']}]
            });
            if(!role) return res.status(404).json({error: `Role not found!`});
            res.status(200).json(role)
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async createRole(req,res){
        try{
            const {name,description} = req.body;
            if(!name) return res.status(400).json({error: `Role name is required!   `})
            const role = await Role.create({name,description})
            res.status(200).json(role);
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async updateRole(req,res){
        try{
            const id = req.params.id;
            const {name,description} = req.body;
            if(!name) return res.status(400).json({error: `Role name required!`})
            const role = await Role.findByPk(id)
            if(!role) return res.status(404).json({error: `Role is not found`})
            role.name = name;
            role.description = description;
            await role.save();
            res.status(200).json(role);
        }catch(err){
            res.status(500).json(err);
        }
    }

    static async deleteRole(req,res){
        try{
            const id = req.params.id;
            const role = await Role.findByPk(id);
            if(!role) return res.status(404).json({error: `Role is not found!`})

            const CORE_ROLES = ['Super Admin', 'Admin'];
            if(CORE_ROLES.includes(role.name)){
                return res.status(403).json({message: `Core role can't be deleted!`})
            }
            const users = await role.countUsers();
            if(users.length > 0 ) {
                return res.status(403).json({message: `Role still assigned to users!`});
            }
            await role.destroy();
            res.status(200).json({message: `Role with id ${id} has been deleted!`});
        }catch(err){
            res.status(500).json(err);
        }
    }

}

module.exports = RoleController;