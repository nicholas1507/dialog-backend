const {Language} = require('../models');
const LanguageService = require('../service/languageService');
const languageService = new LanguageService(Language)
class LanguageController{
    static async getLanguages(req,res,next){
        try{
            const {page,limit,search} = req.query;
            const result = await languageService.getLanguages({page,limit,search})
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async createLanguage(req,res,next){
        try{
            const {name,code} = req.body;
            const result = await languageService.createLanguage({name,code})
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getLanguageById(req,res,next){
        try{
            const id = Number(req.params.id);
            const result = await languageService.getLanguageById(id);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async updateLanguage(req,res,next){
        try{
            const id = Number(req.params.id);
            const {name,code} = req.body;
            const result = await languageService.updateLanguage({id,name,code});
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async deleteLanguage(req,res,next){
        try{
            const id = Number(req.params.id);
            const result = await languageService.deleteLanguage(id);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
}

module.exports = LanguageController;