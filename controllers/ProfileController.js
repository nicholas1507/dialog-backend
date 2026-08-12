require('dotenv').config();
const {Profile, User} = require('../models');
const {cloudinary} = require('../middleware/upload');

class ProfileController{
    static async getProfiles(req,res){
        try{
            const profiles = await Profile.findAll({
                include: [{model: User, as: "user", attributes: ['id','name','email']}]
            })
            res.status(200).json(profiles);
        }catch(err){
            res.status(500).json(err);
        }
    }
    static async getProfileById(req,res){
        try{
            const id = req.params.id;
            const profile = await Profile.findByPk(id,{
                include: [{model: User, as: "user", attributes: ['id','name','email']}]
            });
            if(!profile) return res.status(404).json({error: `Profile not found!`});
            res.status(200).json(profile);
        }catch(err){
            res.status(500).json({
                error: `Internal server error!`
            });
        }
    }
    static async createProfile(req,res){
        try{
            const userId = req.user.id;
            const existing = await Profile.findOne({where: {userId}});
            if(existing) return res.status(400).json({error: `Profile already exists!`});
            const filename = req.file ? req.file.filename : null;
            const url = req.file ? req.file.path : null;
            if(!req.file) return res.status(400).json({message: 'No file uploaded'});
            const {address, bio,phone,city,country} = req.body;
            const profil = await Profile.create({
                userId: userId,
                address: address,
                bio: bio,
                phone,
                city,
                country,
                imagePublicId: filename,
                imageURL: url
            });
            res.status(201).json(profil);
        }catch(err){
            console.error(err);
            res.status(500).json({error: "Failed to upload",err});
        }
    }
    static async getMyProfile(req,res){
        try{
            const userId = req.user.id;
            const myProfil = await Profile.findOne({where: {userId}});
            if(!myProfil) return res.sendStatus(204);
            res.status(200).json({
                id: myProfil.id,
                phone: myProfil.phone,
                bio: myProfil.bio,
                city: myProfil.city,
                country: myProfil.country,
                imagePublicId: myProfil.imagePublicId,
                imageURL: myProfil.imageURL
            });
        }catch(err){
            res.status(500).json({
                error: `Internal server error!`
            });
        }
    }
    static async updateProfileByAdmin(req,res){
        try{
            const id = req.params.id;
            const {address, bio,phone,city,country} = req.body;
            const profil = await Profile.findByPk(id);
            if(!profil) return res.status(404).json({error: `Profile not found!`});
            const oldImage = profil.imagePublicId;
            if(req.file){
                profil.imagePublicId = req.file.filename;
                profil.imageURL = req.file.path;
            }
            if(address !== undefined) profil.address = address;
            if(bio !== undefined) profil.bio = bio;
            if(phone !== undefined) profil.phone = phone;
            if(city !== undefined) profil.city = city;
            if(country !== undefined) profil.country = country
            await profil.save();
            if(req.file && oldImage){
                await cloudinary.uploader.destroy(oldImage);
            }
            res.status(200).json(profil);
        }catch(err){
            res.status(500).json({
                error: `Internal server error!`
            });
        }
    }
    static async updateMyProfil(req,res){
        try{
            const userId = req.user.id;
            const {address, bio,phone,city,country} = req.body;
            const profil = await Profile.findOne({where: {userId}});
            if(!profil) return res.status(403).json({error: `Profil not found, create your profile first!`});
            const oldImage = profil.imagePublicId;
            if(req.file){
                profil.imagePublicId = req.file.filename;
                profil.imageURL = req.file.path;
            }
            if(address !== undefined) profil.address = address;
            if(bio !== undefined) profil.bio = bio;
            if(phone !== undefined) profil.phone = phone;
            if(city !== undefined) profil.city = city;
            if(country !== undefined) profil.country = country
            await profil.save();
            if(req.file && oldImage){
                await cloudinary.uploader.destroy(oldImage);
            }
            res.status(200).json(profil);
        }catch(err){
            res.status(500).json({
                error: `Internal server error!`
            });
        }
    }

    static async deleteProfile(req,res){
        try{
            const id = req.params.id;
            const profil = await Profile.findByPk(id);
            if(!profil) return res.status(404).json({error: `Profil not found!`});
            const oldImage = profil.imagePublicId;
            await profil.destroy();
            if(oldImage){
                await cloudinary.uploader.destroy(oldImage);
            }
            res.status(200).json(profil);
        }catch(err){
            res.status(500).json({
                error: `Internal server error!`
            });
        }
    }

}

module.exports = ProfileController;