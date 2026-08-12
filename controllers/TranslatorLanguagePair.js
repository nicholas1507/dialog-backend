const {TranslatorLanguagePair, Translator, Language} = require('../models');

class TranslatorLanguagePairController{
    static async getTranslatorLanguagePair(req,res){
        try{
            const pairs = await TranslatorLanguagePair.findAll({
                include:[
                    {
                        model: Translator,
                        as:'translator'
                    },
                    {
                        model: Language,
                        as:'sourceLanguage',
                        attributes:['id','name']
                    },
                    {
                        model: Language,
                        as:'targetLanguage',
                        attributes:['id','name']
                    }
                ]
            });
            res.status(200).json(pairs);
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async createTranslatorLanguagePair(req,res){
        try{
            const userId = req.user.id;
            const {sourceLanguageId,targetLanguageId} = req.body;

            const translator = await Translator.findOne({
                where:{userId}
            });
            if(!translator){
                return res.status(404).json({error: `Translator profile not found!`});
            }
            const checkPair = await TranslatorLanguagePair.findOne({
                where:{
                    translatorId: translator.id,
                    sourceLanguageId,
                    targetLanguageId
                }
            });
            if(checkPair){
                return res.status(400).json({error: `Language pair already exists!`});
            }
            const pair = await TranslatorLanguagePair.create({
                translatorId: translator.id,
                sourceLanguageId,
                targetLanguageId
            });
            res.status(201).json(pair);
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async getTranslatorLanguagePairById(req,res){
        try{
            const {id} = req.params;

            const pair = await TranslatorLanguagePair.findByPk(id,{
                include:[
                    {
                        model: Language,
                        as:'sourceLanguage',
                        attributes:['id','name']
                    },
                    {
                        model: Language,
                        as:'targetLanguage',
                        attributes:['id','name']
                    }
                ]
            });

            if(!pair) return res.status(404).json({error:`Language pair not found!`});

            res.status(200).json(pair);
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async deleteTranslatorLanguagePair(req,res){
        try{
            const userId = req.user.id;
            const {id} = req.params;

            const translator = await Translator.findOne({
                where:{userId}
            });

            if(!translator){
                return res.status(404).json({error:`Translator profile not found!`});
            }

            const pair = await TranslatorLanguagePair.findOne({
                where:{
                    id,
                    translatorId: translator.id
                }
            });

            if(!pair){
                return res.status(404).json({error:`Language pair not found!`});
            }

            await pair.destroy();

            res.status(200).json({
                message:`Language pair id ${id} successfully deleted!`
            });

        }catch(error){
            res.status(500).json(error);
        }
    }
}

module.exports = TranslatorLanguagePairController;