const { Op } = require('sequelize');
const {User,Role,ProjectCandidate, Project, Translator, sequelize} = require('../models');
const createError = require('../utils/createError');

class ProjectCandidateController{
    static async getOpenProject(projectId,transaction){
        const project = await Project.findByPk(projectId,{transaction});
        if(!project){
            throw createError("Project not found!",404);
        }
        if(project.status !== "OPEN"){
            throw createError("Project is not Open!",400);
        }
        return project;
    }
    static async createApplication(req,res,next){
        try{
            const result = await sequelize.transaction(async(t)=>{
                const userId = req.user.id;
                const {projectId} = req.params;
                const project = await ProjectCandidateController.getOpenProject(projectId,t);
                const translator = await Translator.findOne({
                    where: {userId},
                    transaction: t
                });
                if(!translator){
                    throw createError("User is not a translator!",400);
                }
                const existingApplication = await ProjectCandidate.findOne({
                    where: {projectId,translatorId: translator.id},
                    transaction: t
                });
                if(existingApplication){
                    throw createError("You already a candidate for this project!",400);
                }
                const application = await ProjectCandidate.create({
                    projectId,
                    translatorId: translator.id,
                    type: "APPLICATION",
                    status: "PENDING"
                },{transaction: t});
                return application;
            });
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }
    static async createInvitation(req,res,next){
        try{
            const result = await sequelize.transaction(async(t) => {
                const userId = req.user.id;
                const {translatorId} = req.params;
                const {message,projectId} = req.body;
                const project = await ProjectCandidateController.getOpenProject(projectId,t);
                if(project.clientId !== userId){
                    throw createError("The project is not yours!",400);
                }
                const translator = await Translator.findByPk(translatorId,{transaction: t});
                if(!translator){
                    throw createError("Translator not found!",404);
                }
                if(project.translatorId){
                    throw createError("Project already have translator!",400)
                }
                const existingCandidate = await ProjectCandidate.findOne({
                    where: {projectId,translatorId},
                    transaction: t
                });
                if(existingCandidate){
                    throw createError("Translator is already a candidate!",400);
                }
                const invitation = await ProjectCandidate.create({
                    projectId,
                    translatorId,
                    type: "INVITATION",
                    status: "PENDING",
                    message
                },{transaction: t});
                return invitation
            });
            res.status(201).json(result);
        }catch(error){
            next(error)
        }
    }
    static async getMyProjectCandidate(req,res,next){
        try{
            const userId = req.user.id;
            const {projectId} = req.params;
            const project = await Project.findByPk(projectId);
            if(!project) return res.status(404).json({error: "Project not found!"});
            if(project.clientId !== userId){
                return res.status(400).json({error: "Not your project!"});
            }
            const projectCandidate = await ProjectCandidate.findAll({
                include: [
                    {
                        model: Translator, 
                        as: "translator", 
                        include: [
                            { model: User, as: "user", attributes: ["id", "name"] }
                        ]
                    }
                ],
                where: {
                    projectId,
                    [Op.or]: [
                        { type: 'APPLICATION', status: 'PENDING' },
                        { type: 'INVITATION', status: 'ACCEPTED' }
                    ]
                }
            });
            res.status(200).json(projectCandidate);
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