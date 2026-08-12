const { Op } = require('sequelize');
const {Translator, Project,Specialization,User, Profile, TranslatorLanguagePair, ProjectCandidate,Language, sequelize} = require('../models');

class TranslatorController{
    static async getTranslators(req,res){
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = (req.query.search || "").trim();
            const offset = (page-1) * limit;
            const whereCondition = {};
            if(search){
                whereCondition.name = {[Op.iLike]: `%${search}%`}
            }
            const translators = await Translator.findAll({
                include: [
                    {model: User, as: 'user', attributes:['id','name','email'], where:whereCondition, include: [
                        {model:Profile, as:"profile"}
                    ]},
                    {model: Specialization, as: "specializations"},
                    {model: TranslatorLanguagePair, as: "languagePairs", include: [
                        {model: Language, as: "sourceLanguage"},
                        {model: Language, as: "targetLanguage"}
                    ]}
                ],
                limit,
                offset
            });
            const total = await Translator.count({
                include: [
                    {model: User, as:"user", attributes: ["id","name"], where: whereCondition}
                ]
            });
            res.status(200).json({
                data: translators,
                pagination: {
                    page,
                    limit,
                    totalData: total,
                    totalPage: Math.ceil(total/limit)
                }
            });
        }catch(error){
            console.error(error);
            res.status(500).json(error);
        }
    }
    static async createTranslator(req,res){
        try{
            const result = await sequelize.transaction(async(t) => {
                const userId = req.user.id;
                const {experience,ratePerProject,cvURL,languagePairs,specializationIds} = req.body;
                const checkTranslator = await Translator.findOne({where: {userId},transaction: t});
                if(checkTranslator){
                    throw new Error("Data translator has already been filled!");
                }
                const specializations = await Specialization.findAll({where: {id: specializationIds}, transaction: t});
                if(specializations.length !== specializationIds.length){
                    throw new Error("Invalid Specialization")
                }
                const translator = await Translator.create({
                    userId,
                    experience,
                    ratePerProject,
                    cvURL
                },{transaction: t});
                await translator.setSpecializations(specializationIds,{transaction: t});
                let translatorPairs = []
                if(!Array.isArray(languagePairs) || languagePairs.length === 0){
                    throw new Error("language pairs not found!");
                }
                languagePairs.forEach(pair => {
                    translatorPairs.push({
                        translatorId: translator.id,
                        sourceLanguageId: pair.sourceLanguageId,
                        targetLanguageId: pair.targetLanguageId
                    });
                })
                const translatorLanguange = await TranslatorLanguagePair.bulkCreate(translatorPairs,{transaction: t});
                return {translator,translatorLanguange}
            })
            res.status(201).json(result);
        }catch(error){
            console.error(error);
            res.status(500).json(error);
        }
    }
    static async getTranslatorById(req,res){
        try{
            const {id} = req.params;
            const translator = await Translator.findByPk(id,{
                include: [
                    {model: User, as: 'user', attributes:['id','name'],include:[
                        {model:Profile, as:"profile"}
                    ]},
                    {model: Specialization, as: "specializations"},
                    {model: TranslatorLanguagePair, as: "languagePairs", include: [
                        {model: Language, as: "sourceLanguage"},
                        {model: Language, as: "targetLanguage"}
                    ]}
                ],
            });
            if(!translator) return res.status(404).json({error: `Translator not found!`});
            res.status(200).json(translator);
        }catch(error){
            res.status(500).json(error);
        }
    }
    static async updateMyTranslator(req, res) {
        try {
            const result = await sequelize.transaction(async (t) => {
                const userId = req.user.id;
                const { experience, ratePerProject, cvURL, languagePairs, specializationIds } = req.body;

                const translator = await Translator.findOne({ where: { userId }, transaction: t });
                if (!translator) {
                    throw new Error("NOT_FOUND");
                }

                await translator.update({ experience, ratePerProject, cvURL }, { transaction: t });

                if (specializationIds) {
                    await translator.setSpecializations(specializationIds, { transaction: t });
                }

                if (languagePairs) {
                    const existing = await TranslatorLanguagePair.findAll({
                        where: { translatorId: translator.id },
                        transaction: t
                    });

                    const pairsToAdd = [];
                    for (let pair of languagePairs) {
                        const isExist = existing.some(e => e.sourceLanguageId === pair.sourceLanguageId && e.targetLanguageId === pair.targetLanguageId);
                        if (!isExist) {
                            pairsToAdd.push({
                                translatorId: translator.id,
                                sourceLanguageId: pair.sourceLanguageId,
                                targetLanguageId: pair.targetLanguageId
                            });
                        }
                    }

                    const idsToRemove = [];
                    for (let oldPair of existing) {
                        const isStillExist = languagePairs.some(n => n.sourceLanguageId === oldPair.sourceLanguageId && n.targetLanguageId === oldPair.targetLanguageId);
                        if (!isStillExist) {
                            idsToRemove.push(oldPair.id);
                        }
                    }

                    if (pairsToAdd.length > 0) {
                        await TranslatorLanguagePair.bulkCreate(pairsToAdd, { transaction: t });
                    }
                    if (idsToRemove.length > 0) {
                        await TranslatorLanguagePair.destroy({ where: { id: idsToRemove }, transaction: t });
                    }
                }

                return translator;
            });

            return res.status(200).json({ message: "Translator updated successfully", data: result });
        } catch (error) {
            if (error.message === "NOT_FOUND") {
                return res.status(404).json({ message: "Translator not found!" });
            }
            return res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    static async getMyTranslator(req,res){
        try{
            const userId = req.user.id;
            const translator = await Translator.findOne({
                include: [
                    {model: TranslatorLanguagePair, as: "languagePairs",include: [
                        {model: Language, as: "sourceLanguage"},
                        {model: Language, as: "targetLanguage"},
                    ]},
                    {model:Specialization, as: "specializations"},
                    {model: Project, as:"projects"},
                    {model:ProjectCandidate, as:"projectCandidates"}
                ],
                where: {userId}
            });
            if(!translator) return res.status(404).json({error: "Translator not found!"});
            res.status(200).json(translator);
        }catch(error){
            console.error(error)
            res.status(500).json(error);
        }
    }
    static async deleteTranslator(req,res){
    try{
        const {id} = req.params;
        const translator = await Translator.findByPk(id);
        if(!translator) return res.status(404).json({error: "Translator not found!"});
        const project = await Project.findOne({where: {translatorId: id}});
        if(project) return res.status(400).json({error: "Translator has project history!"});
        const candidate = await ProjectCandidate.findOne({where: {translatorId: id}});
        if(candidate) return res.status(400).json({error: "Translator has candidate history!"});
        const activeProject = await Project.findOne({
            where: {
                translatorId: id,
                status: ["ASSIGNED","IN_PROGRESS","WAITING_REVIEW"]
            }
        });
        if(activeProject) return res.status(400).json({error: "Translator has an active project!"});
        await translator.destroy();
        res.status(200).json({message: `Translator id ${id} successfully deleted!`});
    }catch(error){
        res.status(500).json(error);
    }
}
}

module.exports = TranslatorController;