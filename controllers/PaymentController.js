const {Payment, Project, User ,sequelize} = require('../models');
const createError = require('../utils/createError');
const PaymentService = require('../service/paymentService');
const paymentService = new PaymentService({Payment,Project,User,sequelize});
class PaymentController{
    static async getPayments(req,res,next){
        try{
            const {page,limit,search} = req.query;
            const result = await paymentService.getPayments({page,limit,search})
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async getPaymentById(req,res,next){
        try{
            const {id} = req.params;
            const result = await paymentService.getPaymentById(id);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
    static async createPayment(req,res,next){
        try{
            const clientId = req.user.id;
            const {projectId} = req.params;
            const fileData = req.file ? req.file.path : null;
            const result = await paymentService.createPayment({projectId,fileData,clientId});
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }
    static async verifyPayment(req,res,next){
        try{
            const id = Number(req.params.id);
            const adminId = req.user.id;
            const result = await paymentService.verifyPayment({id,adminId});
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
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