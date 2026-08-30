const { Op } = require('sequelize');
const {Specialization} = require('../models');

class SpecializationController{
    static async getSpecialization(req,res,next){
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const offset = (page - 1) * limit;
            const specializations = await Specialization.findAll({
                where: search ? {name: { [Op.iLike]: `%${search}%` }} : {},
                limit,
                offset
            });
            const total = await Specialization.count({
                where: search ? {name: { [Op.iLike]: `%${search}%` }} : {}
            });
            res.status(200).json({
                data: specializations,
                pagination: {
                    page,
                    limit,
                    totalData: total,
                    totalPage: Math.ceil(total/limit)
                }
            });
        }catch(error){
            next(error);
        }
    }
    static async createSpecialization(req,res,next){
        try{
            const {name} = req.body;
            const specialization = await Specialization.create({name});
            res.status(201).json(specialization);
        }catch(error){
            next(error);
        }
    }
    static async getSpecializationById(req,res,next){
        try{
            const {id} = req.params;
            const specialization = await Specialization.findByPk(id);
            if(!specialization) return res.status(404).json({error: "Specialization not found!"});
            res.status(200).json(specialization);
        }catch(error){
            next(error);
        }
    }
    static async updateSpecialization(req,res,next){
        try{
            const {id} = req.params;
            const {name} = req.body;
            const specialization = await Specialization.update({name},{where: {id}});
            if(specialization[0] === 0) return res.status(400).json({error: `Failed to update specialization!`});
            res.status(200).json({message: "Specialization updated successfully!"});
        }catch(error){
            next(error);
        }
    }
    static async deleteSpecialization(req,res,next){
        try{
            const {id} = req.params;
            const specialization = await Specialization.findByPk(id);
            if(!specialization) return res.status(404).json({error: `Specialization not found!`});
            const projects = await specialization.countProjects();
            if(projects > 0){
                return res.status(400).json({error: `Specialization already used by project!`});
            }
            await specialization.destroy();
            res.status(200).json({message: `Specialization id ${id} successfully deleted!`});
        }catch(error){
            next(error);
        }
    }
}

module.exports = SpecializationController;