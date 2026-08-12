const {Language} = require('../models');

class LanguageController{
    static async getLanguages(req,res){
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const offset = (page - 1) * limit;
            const languages = await Language.findAll({
                where: search ? {name: { [Op.iLike]: `%${search}%` }} : {},
                limit,
                offset
            });
            const total = await Language.count({
                where: search ? {name: { [Op.iLike]: `%${search}%` }} : {}
            });
            res.status(200).json({
                data: languages,
                pagination: {
                    page,
                    limit,
                    totalData: total,
                    totalPage: Math.ceil(total/limit)
                }
            });
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async createLanguage(req,res){
        try{
            const {name,code} = req.body;
            const language = await Language.create({name,code});
            res.status(201).json(language);
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async getLanguageById(req,res){
        try{
            const {id} = req.params;
            const language = await Language.findByPk(id);
            if(!language) return res.status(400).json({error: "Language not found!"});
            res.status(200).json(language);
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async updateLanguage(req,res){
        try{
            const {id} = req.params;
            const {name} = req.body;
            const language = await Language.update({name},{where: {id}});
            if(!language) return res.status(400).json({error: `Failed to update language!`});
            res.status(200).json(language);
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async deleteLanguage(req,res){
        try{
            const {id} = req.params;
            const language = await Language.findByPk(id);
            if(!language) return res.status(404).json({error: `Language not found!`});
            const translatorSource = await language.countSourceProjects();
            const translatorTarget = await language.countTargetProjects();
            if(translatorSource > 0 || translatorTarget > 0){
                return res.status(400).json({error: `Language already used by translator!`});
            }
            await language.destroy();
            res.status(200).json({message: `Language id ${id} successfully deleted!`});
        }catch(error){
            res.status(500).json(error);
        }
    }
}

module.exports = LanguageController;