const {Specialization} = require('../models');
const SpecializationService = require('../service/specializationService');
const specializationService = new SpecializationService(Specialization);
class SpecializationController{
    static async getSpecialization(req,res,next){
        try{
            const {page,limit,search} = req.query;
            const result = await specializationService.getSpecializations({page,limit,search})
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async createSpecialization(req,res,next){
        try{
            const {name} = req.body;
            const result = await specializationService.createSpecialization(name);
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getSpecializationById(req,res,next){
        try{
            const id = Number(req.params.id);
            const result = await specializationService.getSpecializationById(id);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async updateSpecialization(req,res,next){
        try{
            const id = Number(req.params.id);
            const {name} = req.body;
            const result = await specializationService.updateSpecialization(id,name);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async deleteSpecialization(req,res,next){
        try{
            const id = Number(req.params.id);
            const result = await specializationService.deleteSpecialization(id);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
}

module.exports = SpecializationController;