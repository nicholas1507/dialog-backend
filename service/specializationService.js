const { Op } = require("sequelize");
const createError = require('../utils/createError');
class SpecializationService{
    constructor(Specialization){
        this.Specialization = Specialization;
    }
    async getSpecializations({page,limit,search}){
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const specializations = await this.Specialization.findAll({
            where: search ? {name: {[Op.iLike]: `%${search}%`}} : {},
            limit: limitNum,
            offset
        });
        const total = await this.Specialization.count({
            where: search ? {name: {[Op.iLike]: `%${search}%`}} : {}
        });
        return{
            data: specializations,
            pagination: {
                pageNum,
                limitNum,
                totalData: total,
                totalPage: Math.ceil(total/limit)
            }
        }
    }
    async createSpecialization(name){
        const specialization = await this.Specialization.create({name});
        return specialization;
    }
    async getSpecializationById(id){
        const specialization = await this.Specialization.findByPk(id);
        if(!specialization){
            throw createError("Specialization is not found!",404);
        }
        return specialization;
    }
    async updateSpecialization(id,name){
        const specialization = await this.Specialization.findByPk(id);
        if(!specialization){
            throw createError("Specialization is not found!",404);
        }
        await specialization.update({name});
        return specialization;
    }
    async deleteSpecialization(id){
        const specialization = await this.Specialization.findByPk(id);
        if(!specialization){
            throw createError("Specialization is not found!",404);
        }
        const countProjects = specialization.countProjects();
        if(countProjects > 0){
            throw createError("Specialization already used by projects!",400);
        }
        await specialization.destroy();
        return{message: "Specialization successfully deleted!"}
    }
}
module.exports = SpecializationService