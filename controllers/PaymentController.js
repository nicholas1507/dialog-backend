const {Payment, Project, User, sequelize} = require('../models');

class PaymentController{
    static async getPayments(req,res){
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = (req.query.search || "").trim();
            const offset = (page-1) * limit;
            const whereCondition = {};
            if(search){
                whereCondition.status = {[Op.iLike]: `%${search}%`}
            }
            const payments = await Payment.findAll({
                include:[
                    {model:Project,as:'project',where: search ? {title:{[Op.iLike]: `%${search}%`}} : undefined},
                    {model:User,as:'verifier',attributes:['id','name','email']}
                ],
                limit,
                offset
            });
            const total = await Payment.count({
                include:[
                    {model:Project,as:'project',where: search ? {title:{[Op.iLike]: `%${search}%`}} : undefined}
                ]
            });
            res.status(200).json({
                data: payments,
                pagination:{
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
    static async getPaymentById(req,res){
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
            res.status(500).json(error);
        }
    }
    static async createPayment(req,res){
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
            console.error(error);
            res.status(500).json(error);
        }
    }
    static async verifyPayment(req,res){
        try{
            const result = await sequelize.transaction(async(t)=>{
                const {id} = req.params;
                const adminId = req.user.id;
                const payment = await Payment.findByPk(id,{
                    transaction:t
                });
                if(!payment){
                    throw new Error("Payment not found!");
                }
                if(payment.status !== "PENDING"){
                    throw new Error("Payment already verified!");
                }
                const project = await Project.findByPk(payment.projectId,{
                    transaction:t
                });
                if(!project){
                    throw new Error("Project not found!");
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
            console.error(error);
            res.status(500).json({
                error:error.message
            });
        }
    }
    static async releasePayment(projectId,t){
        const project = await Project.findByPk(projectId,{
            include: [{model: Payment, as: "payment"}],
            transaction: t
        });
        if(!project){
            throw new Error("Project not found!");
        }
        if (!project.payment) {
            throw new Error("Payment not linked to this project!");
        }
        const payment = project.payment;
        if(!payment){
            throw new Error("Payment not found!");
        }
        if(payment.status !== "VERIFIED"){
            throw new Error("Payment not yet paid!");
        }
        payment.status = "RELEASED";
        await payment.save({transaction: t});
    }
    static async deletePayment(req,res){
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
            res.status(500).json(error);
        }
    }
}

module.exports = PaymentController;