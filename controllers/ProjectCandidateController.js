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
            const projectInvitation = await projectCandidateService.getMyInvitations(userId);
            res.status(200).json(projectInvitation);
        }catch(error){
            next(error);
        }
    }
    static async handleInvitation(req,res,next,action){
        try{
            const userId = req.user.id;
            const projectId = Number(req.params.projectId);
            const projectCandidate = await projectCandidateService.handleInvitatioService({userId,projectId,action});
            res.status(200).json(projectCandidate);
        }catch(error){
            next(error);
        }
    }
    static async acceptInvitation(req,res,next){
        return ProjectCandidateController.handleInvitation(req,res,next,"ACCEPTED");
    }
    static async declineInvitation(req,res,next){
        return ProjectCandidateController.handleInvitation(req,res,next,"DECLINED");
    }
}

module.exports = ProjectCandidateController;