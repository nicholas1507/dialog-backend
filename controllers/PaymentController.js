const {Payment, Project, User, sequelize} = require('../models');
const createError = require('../utils/createError');
const PaymentService = require('../service/paymentService');
const projectService = new PaymentService({Payment,Project,User,sequelize});
class PaymentController{
    static async getPayments(req,res,next){
        try{
            const {page,limit,search} = req.query;
            const result = await projectService.getPayments({page,limit,search})
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getPaymentById(req,res,next){
        try{
            const {id} = req.params;
            const payment = await Payment.findByPk(id,{
                include:[
                    {model:Project,as:'project'},
                    {model:User,as:'verifier',attributes:['id','name','email']}
                ]
            });
            if(!payment) return res.status(404).json({error:`Payment not found!`});
            res.status(200).json(payment);
        }catch(error){
            next(error);
        }
    }
    static async createPayment(req,res,next){
        try{
            const {projectId} = req.params;
            const project = await Project.findByPk(projectId);
            if(!project){
                return res.status(404).json({error:`Project not found!`});
            }
            if(project.status !== "WAITING_PAYMENT"){
                return res.status(400).json({error:`Project is not waiting for payment!`});
            }
            const amount = Number(project.budget);
            if(!req.file){
                return res.status(400).json({error:`Payment proof is required!`});
            }
            const payment = await Payment.create({
                projectId,
                amount,
                proofURL:req.file.path,
                status:"PENDING"
            });
            res.status(201).json(payment);
        }catch(error){
            next(error);
        }
    }
    static async verifyPayment(req,res,next){
        try{
            const result = await sequelize.transaction(async(t)=>{
                const {id} = req.params;
                const adminId = req.user.id;
                const payment = await Payment.findByPk(id,{
                    transaction:t
                });
                if(!payment){
                    throw createError("Payment not found!",404);
                }
                if(payment.status !== "PENDING"){
                    throw createError("Payment already verified!",400);
                }
                const project = await Project.findByPk(payment.projectId,{
                    transaction:t
                });
                if(!project){
                    throw new Error("Project not found!",404);
                }
                payment.status = "VERIFIED";
                payment.verifiedBy = adminId;
                await payment.save({transaction:t});
                project.status = "OPEN";
                await project.save({transaction:t});
                return {
                    payment,
                    project
                };
            });
            res.status(200).json(result);

        }catch(error){
            next(error);
        }
    }
    static async releasePayment(projectId,t){
        const project = await Project.findByPk(projectId,{
            include: [{model: Payment, as: "payment"}],
            transaction: t
        });
        if(!project){
            throw createError("Project not found!",404);
        }
        if (!project.payment) {
            throw createError("Payment not linked to this project!",400);
        }
        const payment = project.payment;
        if(!payment){
            throw createError("Payment not found!",404);
        }
        if(payment.status !== "VERIFIED"){
            throw createError("Payment not yet paid!",400);
        }
        payment.status = "RELEASED";
        await payment.save({transaction: t});
    }
    static async deletePayment(req,res,next){
        try{
            const {id} = req.params;

            const payment = await Payment.findByPk(id);

            if(!payment){
                return res.status(404).json({error:`Payment not found!`});
            }

            await payment.destroy();

            res.status(200).json({
                message:`Payment id ${id} successfully deleted!`
            });

        }catch(error){
            next(error);
        }
    }
}

module.exports = PaymentController;