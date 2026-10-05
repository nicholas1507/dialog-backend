const {Project, ProjectDocument,User, Language, Specialization, Translator, ProjectCandidate,sequelize} = require('../models');
const { Op } = require('sequelize');
const {cloudinary} = require('../middleware/upload');
const createError = require('../utils/createError');
const ProjectService = require('../service/projectService');
const projectService = new ProjectService({Project, ProjectDocument,User, Language, Specialization, Translator, ProjectCandidate,sequelize})
class ProjectController{
    static async getProject(req,res,next){
        try{
            const {page,limit,search} = req.query;
            const result = await projectService.fetchProjects({page,limit,search})
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getAvailableProjects(req,res,next) {
        try {
            const {page,limit,search} = req.query;
            const result = await projectService.availableProjects({page,limit,search});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    static async getMyProjects(req,res,next){
        try{
            const clientId = req.user.id;
            const {page,limit,search} = req.query;
            const result = await projectService.fetchProjects({clientId,page,limit,search});
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getTranslatorProjects(req,res,next){
        try{
            const userId = req.user.id;
            const {page,limit,search} = req.query;
            const translator = await Translator.findOne({where: {userId}});
            if(!translator) return res.status(404).json({error: "Translator not found!"});
            const result = await projectService.fetchProjects({translatorId: translator.id,page,limit,search});
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async createProject(req,res,next){
        try{
            const clientId = req.user.id;
            const {
                title,
                description,
                sourceLanguageId,
                targetLanguageId,
                wordCount,
                specializationId,
                budget,
                durationDays,
                notes
            } = req.body;
            const fileData = req.file ?{
                filePublicId: req.file.filename,
                fileURL: req.file.path
            } : null;
            const project = await projectService.createProject({clientId,title,description,sourceLanguageId,targetLanguageId,wordCount,specializationId,budget,durationDays,notes,fileData});
            res.status(201).json(project);
        }catch(error){
            next(error);
        }
    }
    static async approveCandidate(req,res,next){
        try{
            const clientId = req.user.id;
            const projectId = Number(req.params.projectId);
            const candidateId = Number(req.params.candidateId);
            const result = await projectService.approveCandidate({clientId,projectId,candidateId});
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async approveProject(req,res,next){
        try{
            const clientId = req.user.id;
            const projectId = Number(req.params.projectId);
            const result = await projectService.approveProject({projectId,clientId});
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }

    static async getProjectById(req,res,next){
        try{
            const id = Number(req.params.id);
            const project = await projectService.getProjectById(id);
            res.status(200).json(project);
        }catch(error){
            next(error);
        }
    }
    static async editProject(req,res,next){
        try{
            const result = await sequelize.transaction(async(t) => {
                const {projectId} = req.params;
                const {notes} = req.body;
                const userId = req.user.id
                const allowedFields = ["title","description","sourceLanguageId","targetLanguageId","wordCount","specializationId","budget","durationDays"];
                const updateData = {};
                allowedFields.forEach(field => {
                    if(req.body[field] !== undefined){
                        updateData[field] = req.body[field]
                    }
                });
                const project = await Project.findByPk(projectId,{transaction: t, lock: t.LOCK.UPDATE});
                if(!project){
                    throw createError("Project not found!",404);
                }
                if(project.status !== "WAITING_PAYMENT"){
                    throw createError("Project can only be updated before payment!",400);
                }
                if(project.clientId !== userId){
                    throw createError("The project belongs to another client!",400);
                }
                if(updateData.specializationId){
                    const specialization = await Specialization.findByPk(updateData.specializationId,{transaction: t});
                    if(!specialization){
                        throw createError("Specialization not found!",404)
                    }
                }
                if(updateData.sourceLanguageId !== undefined || updateData.targetLanguageId !== undefined){
                    const finalSource = updateData.sourceLanguageId ?? project.sourceLanguageId;
                    const finalTarget = updateData.targetLanguageId ?? project.targetLanguageId;
                    if(finalSource === finalTarget){
                        throw createError("Source and target language cannot be the same!",400);
                    }
                    const languages = await Language.findAll({where: {id: [finalSource,finalTarget]},transaction:t});
                    if(languages.length !== 2){
                        throw createError("Source or target language not found",404);
                    }
                }
                const projectDocument =await ProjectDocument.findOne({
                    where: {projectId,type: "SOURCE"},
                    transaction: t
                });
                if(!projectDocument){
                    throw createError("Project Document not found!",404);
                }
                const oldImage = projectDocument.filePublicId
                let uploadedNewFile = false;
                if(req.file){
                    uploadedNewFile = true
                    projectDocument.filePublicId = req.file.filename;
                    projectDocument.fileURL = req.file.path
                }
                if(notes !== undefined) projectDocument.notes = notes;
                await project.update(updateData,{transaction: t});
                await projectDocument.save({transaction: t});
                return {project,projectDocument,oldImage,uploadedNewFile}
            });
            if(result.oldImage && result.uploadedNewFile){
                await cloudinary.uploader.destroy(result.oldImage);
            }
            res.status(200).json(result)
        }catch(error){
            next(error);
        }
    }
    static async cancelProject(req,res,next){
        try{
            const id = Number(req.params.id);
            const result = await projectService.cancelProject(id);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
}

module.exports = ProjectController;