const { Op } = require('sequelize');
const {User,Role,ProjectCandidate, Project, Translator, sequelize} = require('../models');
const createError = require('../utils/createError');
const ProjectCandidateService = require('../service/projectCandidateService');
const projectCandidateService = new ProjectCandidateService({User,ProjectCandidate, Project, Translator, sequelize});
class ProjectCandidateController{
    static async createApplication(req,res,next){
        try{
            const userId = req.user.id;
            const projectId = Number(req.params.projectId);
            const {message} = req.body;
            const result = await projectCandidateService.createApplication({userId,projectId,message});
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }
    static async createInvitation(req,res,next){
        try{
            const userId = req.user.id;
            const translatorId = Number(req.params.translatorId);
            const {message,projectId} = req.body;
            const result = await projectCandidateService.createInvitation({userId,translatorId,message,projectId});
            res.status(201).json(result);
        }catch(error){
            next(error)
        }
    }
    static async getMyProjectCandidate(req,res,next){
        try{
            const userId = req.user.id;
            const projectId = Number(req.params.projectId);
            const result = await projectCandidateService.getMyProjectCandidate({userId,projectId})
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getMyInvitations(req,res,next){
        try{
            const userId = req.user.id;
            const translator = await Translator.findOne({
                where: {userId}
            });
            if(!translator) return res.status(404).json({error: "Translator not found!"});
            const projectInvitation = await ProjectCandidate.findAll({
                include: [
                    {model: Project, as: "project",include: [
                        {
                            model: User,
                            as: "client", 
                            attributes: ["id", "name", "email"]
                        }
                    ]},
                    
                ],
                where: {translatorId: translator.id, type: "INVITATION", status:"PENDING"}
            });
            res.status(200).json(projectInvitation);
        }catch(error){
            next(error);
        }

    }
    static async handleInvitation(req,action){
            const userId = req.user.id;
            const {projectId} = req.params;
            const translator = await Translator.findOne({where: {userId}});
            if(!translator){
                throw createError("Translator not found!",404);
            }
            const projectCandidate = await ProjectCandidate.findOne({
                include:[
                    {model: Project, as: "project"}
                ],
                where: {projectId,translatorId: translator.id,type: "INVITATION"}
            });
            if(!projectCandidate){
                throw createError("Invitation not found!",404)
            }
            if(projectCandidate.status !== "PENDING"){
                throw createError("Invitation is no longer available!",400);
            }
            projectCandidate.status = action;
            await projectCandidate.save();
            return projectCandidate;
    }
    static async acceptInvitation(req,res,next){
        try{
            const result = await ProjectCandidateController.handleInvitation(req,"ACCEPTED");
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async declineInvitation(req,res,next){
        try{
            const result = await ProjectCandidateController.handleInvitation(req,"DECLINED");
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
}

module.exports = ProjectCandidateController;