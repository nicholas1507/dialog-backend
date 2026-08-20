const { Op } = require('sequelize');
const {User,Role,ProjectCandidate, Project, Translator, sequelize} = require('../models');

class ProjectCandidateController{
    static async getOpenProject(projectId,transaction){
        const project = await Project.findByPk(projectId,{transaction});
        if(!project){
            throw new Error("Project not found!");
        }
        if(project.status !== "OPEN"){
            throw new Error("Project is not Open!");
        }
        return project;
    }
    static async createApplication(req,res){
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
                    throw new Error("User is not a translator!");
                }
                const existingApplication = await ProjectCandidate.findOne({
                    where: {projectId,translatorId: translator.id},
                    transaction: t
                });
                if(existingApplication){
                    throw new Error("You already a candidate for this project!");
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
            console.error(error);
            res.status(500).json({ error:error.message });
        }
    }
    static async createInvitation(req,res){
        try{
            const result = await sequelize.transaction(async(t) => {
                const userId = req.user.id;
                const {translatorId} = req.params;
                const {message,projectId} = req.body;
                const project = await ProjectCandidateController.getOpenProject(projectId,t);
                if(project.clientId !== userId){
                    throw new Error("The project is not yours!");
                }
                const translator = await Translator.findByPk(translatorId,{transaction: t});
                if(!translator){
                    throw new Error("Translator not found!");
                }
                if(project.translatorId){
                    throw new Error("Project already have translator!")
                }
                const existingCandidate = await ProjectCandidate.findOne({
                    where: {projectId,translatorId},
                    transaction: t
                });
                if(existingCandidate){
                    throw new Error("Translator is already a candidate!");
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
            console.error(error);
            res.status(500).json({
                error: error.message
            })
        }
    }
    static async getMyProjectCandidate(req,res){
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
            console.error(error);
            res.status(500).json(error);
        }
    }
    static async getMyInvitations(req,res){
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
            res.status(500).json({
                error: error.message
            })
        }

    }
    static async handleInvitation(req,action){
            const userId = req.user.id;
            const {projectId} = req.params;
            const translator = await Translator.findOne({where: {userId}});
            if(!translator){
                throw new Error("Translator not found!");
            }
            const projectCandidate = await ProjectCandidate.findOne({
                include:[
                    {model: Project, as: "project"}
                ],
                where: {projectId,translatorId: translator.id,type: "INVITATION"}
            });
            if(!projectCandidate){
                throw new Error("Invitation not found!")
            }
            if(projectCandidate.status !== "PENDING"){
                throw new Error("Invitation is no longer available!");
            }
            projectCandidate.status = action;
            await projectCandidate.save();
            return projectCandidate;
    }
    static async acceptInvitation(req,res){
        try{
            const result = await ProjectCandidateController.handleInvitation(req,"ACCEPTED");
            res.status(200).json(result);
        }catch(error){
            console.error(error);
            res.status(500).json(error);
        }
    }
    static async declineInvitation(req,res){
        try{
            const result = await ProjectCandidateController.handleInvitation(req,"DECLINED");
            res.status(200).json(result);
        }catch(error){
            res.status(500).json(error);
        }
    }
}

module.exports = ProjectCandidateController;