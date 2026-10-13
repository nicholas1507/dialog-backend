const { Op } = require("sequelize");
const createError = require('../utils/createError');
class LanguangeService{
    constructor(Language){
        this.Language = Language;
    }
    async getLanguages({page,limit,search}){
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const languages = await this.Language.findAll({
            where: search ? {name : {[Op.iLike]: `%${search}%`}} : {},
            limit: limitNum,
            offset
        });
        const total = await this.Language.count({
            where: search ? {name: {[Op.iLike]: `%%${search}`}} : {}
        });
        return {
            data: languages,
            pagination: {
                pageNum,
                limitNum,
                totalData: total,
                totalPage: Math.ceil(total/limitNum)
            }
        }
    }
    async createLanguage({name,code}){
        const language = await this.Language.create({name,code});
        return language;
    }
    async getLanguageById(id){
        const language = await this.Language.findByPk(id);
        if(!language){
            throw createError("Language not found!",404);
        }
        return language;
    }
    async updateLanguage({id,name,code}){
        const language = await this.Language.findByPk(id);
        if(!language){
            throw createError("Language not found!",404);
        }
        if(name) language.name = name;
        if(code) language.code = code;
        await language.save();
        return language;
    }
    async deleteLanguage(id){
        const language = await this.Language.findByPk(id);
        if(!language){
            throw createError("Language not found!",404);
        }
        const translatorSource = await language.countSourcePairs();
        const translatorTarget = await language.countTargetPairs();
        if(translatorSource > 0 || translatorTarget > 0){
            throw createError("Language already used by Translator!",400);
        }
        const projectSource = await language.countSourceProjects();
        const projectTarget = await language.countTargetProjects();
        if(projectSource > 0 || projectTarget > 0){
            throw createError("Language already used in projects",400);
        }
        await language.destroy();
        return {message: "Language successfully deleted!"}
    }
}
module.exports = LanguangeService;