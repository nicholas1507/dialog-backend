const {Project, ProjectDocument,User, Language, Specialization, Translator, ProjectCandidate,sequelize} = require('../models');
const PaymentController = require('../controllers/PaymentController');
const { Op, where } = require('sequelize');
const {addDays} = require('../utils/date');
const {cloudinary} = require('../middleware/upload');
const createError = require('../utils/createError');

class ProjectController{
    static async fetchProjects(req, clientId = null,translatorId = null){
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const offset = (page - 1) * limit;

        const whereCondition = {}
        if(search){
            whereCondition.title = { [Op.iLike]: `%${search}%` }
        }
        if(clientId !== null){
            whereCondition.clientId = clientId
        }
        if(translatorId !== null){
            whereCondition.translatorId = translatorId
        }
        const projects = await Project.findAll({
            where: whereCondition,
            include:[
                {model: User, as:'client', attributes:['id','name','email']},
                {model: Translator, as:'translator'},
                {model: Language, as:'sourceLanguage', attributes:['id','name']},
                {model: Language, as:'targetLanguage', attributes:['id','name']},
                {model: Specialization, as:'specialization', attributes:['id','name']},
                {model: ProjectDocument, as: "projectDocument"}
            ],
            limit,
            offset
        });

        const total = await Project.count({
            where: whereCondition
        });

        return {
            data: projects,
            pagination: {
                page,
                limit,
                totalData: total,
                totalPage: Math.ceil(total/limit)
            }
        };
    }
    static async getProject(req,res,next){
        try{
            const result = await ProjectController.fetchProjects(req);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getAvailableProjects(req,res,next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const offset = (page - 1) * limit;
            const whereCondition = {
                status: "OPEN",
                translatorId: null
            };

            if (search) {
                whereCondition.title = { [Op.iLike]: `%${search}%` };
            }

            const projects = await Project.findAll({
                where: whereCondition,
                include: [
                    { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
                    { model: Language, as: 'sourceLanguage', attributes: ['id', 'name'] },
                    { model: Language, as: 'targetLanguage', attributes: ['id', 'name'] },
                    { model: Specialization, as: 'specialization', attributes: ['id', 'name'] }
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            const total = await Project.count({
                where: whereCondition
            });

            res.status(200).json({
                data: projects,
                pagination: {
                    page,
                    limit,
                    totalData: total,
                    totalPage: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }
    static async getMyProjects(req,res,next){
        try{
            const clientId = req.user.id;
            const result = await ProjectController.fetchProjects(req, clientId);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getTranslatorProjects(req,res,next){
        try{
            const userId = req.user.id;
            const translator = await Translator.findOne({where: {userId}});
            if(!translator) return res.status(404).json({error: "Translator not found!"});
            const result = await ProjectController.fetchProjects(req,null,translator.id);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }

    static async createProject(req,res,next){
        try{
            const result = await sequelize.transaction(async(t) => {
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
                    if(sourceLanguageId === targetLanguageId){
                        throw createError("Source and target language cannot be the same!",400);
                    }
                    const languages = await Language.findAll({where: {id: [sourceLanguageId,targetLanguageId]},transaction:t});
                    if(languages.length !== 2){
                        throw createError("Source or target language not found",404);
                    }
                    const specialization = await Specialization.findByPk(specializationId,{transaction: t});
                    if(!specialization){
                        throw createError("Specialization not found!",404)
                    }
                    if(!req.file){
                        throw createError("No File uploaded",400);
                    }
                    const filePublicId = req.file.filename || req.file.public_id;
                    const fileURL = req.file.path;
                    const project = await Project.create({
                        clientId,
                        title,
                        description,
                        sourceLanguageId,
                        targetLanguageId,
                        wordCount,
                        specializationId,
                        budget,
                        durationDays,
                        status:'WAITING_PAYMENT'
                    },{transaction: t});

                    const projectDocument = await ProjectDocument.create({
                        projectId: project.id,
                        uploadedBy: clientId,
                        type: "SOURCE",
                        filePublicId: filePublicId,
                        fileURL: fileURL,
                        notes: notes
                    },{transaction: t});
                return {
                    project,
                    projectDocument
                };
            });
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }
    static async approveCandidate(req,res,next){
    try{
        const result = await sequelize.transaction(async(t)=>{
            const clientId = req.user.id;
            const {projectId,candidateId} = req.params
            const project = await Project.findByPk(projectId,{ transaction:t , lock: t.LOCK.UPDATE});
            if(!project){
                throw createError("Project not found!",404);
            }
            if(project.clientId !== clientId){
                throw createError("Unauthorized!",401);
            }
            if(project.status !== "OPEN"){
                throw createError("Project is not open!",400);
            }
            const candidate = await ProjectCandidate.findByPk(candidateId,{ transaction:t });
            if(!candidate){
                throw createError("Project Candidate not found!",404);
            }
            if(candidate.projectId !== Number(projectId)){
                throw createError("Invalid Project Candidate!",400);
            }
            if(candidate.status !== "PENDING" && candidate.status !== "ACCEPTED"){
                throw createError("Candidate already processed!",400);
            }
            if(candidate.type === "APPLICATION"){
                await ProjectCandidate.update({status: "DECLINED"},
                    {
                        where: {projectId,id: {[Op.ne]:candidate.id},type:"APPLICATION",status: "PENDING"},
                        transaction: t
                    }
                )
            }else if(candidate.type === "INVITATION"){
                await ProjectCandidate.update({status: "EXPIRED"},
                    {
                        where: {projectId,id: {[Op.ne]: candidate.id},type:"INVITATION",status: "PENDING"},
                        transaction: t
                    }
                )
                await ProjectCandidate.update({status: "DECLINED"},
                    {
                        where: {projectId,id: {[Op.ne]:candidate.id},type:"INVITATION",status: "ACCEPTED"},
                        transaction: t
                    }
                )
            }
            candidate.status = "CONFIRMED";
            await candidate.save({ transaction:t });
            const completionDeadline = addDays(new Date(),project.durationDays)
            project.completionDeadline = completionDeadline;
            project.status = "IN_PROGRESS";
            project.translatorId = candidate.translatorId;
            await project.save({ transaction:t });
            return { project, candidate };
        });
        res.status(200).json(result);
    }catch(error){
        next(error);
    }
    }
    static async approveProject(req,res,next){
        try{
            const result = await sequelize.transaction(async(t) => {
                const userId = req.user.id;
                const {projectId} = req.params;
                const project = await Project.findByPk(projectId,{transaction: t});
                if(!project){
                    throw createError("Project not found!",404);
                }
                if(project.status !== "WAITING_REVIEW"){
                    throw createError("Project cant be approved!",400);
                }
                project.status = "COMPLETED";
                await project.save({transaction: t});

                await PaymentController.releasePayment(project.id,t);
                return {message: "Project Approved & Payment released!"}
            });
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }

    static async getProjectById(req,res,next){
        try{
            const {id} = req.params;
            const project = await Project.findByPk(id,{
                include:[
                    {model: User, as:'client', attributes:['id','name','email']},
                    {model: Translator, as:'translator', include: [
                        {model: User, as: "user", attributes: ["id","name"]}
                    ]},
                    {model: Language, as:'sourceLanguage', attributes:['id','name']},
                    {model: Language, as:'targetLanguage', attributes:['id','name']},
                    {model: Specialization, as:'specialization', attributes:['id','name']},
                    {model: ProjectDocument, as: "projectDocument"}
                ]
            });
            if(!project) return res.status(404).json({error:`Project not found!`});
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
    static async deleteProject(req,res,next){
        try{
            const {id} = req.params;
            const project = await Project.findByPk(id);
            if(!project) return res.status(404).json({error:`Project not found!`});
            await project.destroy();
            res.status(200).json({
                message:`Project id ${id} successfully deleted!`
            });

        }catch(error){
            next(error);
        }
    }
}

module.exports = ProjectController;