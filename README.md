## API

## Scripts

```bash
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string
npx sequelize-cli model:generate --name Role --attributes name:string,description:string
npx sequelize-cli model:generate --name UserRole --attributes userId:integer,roleId:integer
npx sequelize-cli model:generate --name Profile --attributes userId:integer,phone:string,city:string,country:string,bio:string,imageURL:string,imagePublicId:string
npx sequelize-cli model:generate --name Translator --attributes userId:integer,experience:text,ratePerProject:decimal,cvURL:string
npx sequelize-cli model:generate --name Language --attributes name:string
npx sequelize-cli model:generate --name TranslatorLanguagePair --attributes translatorId:integer,sourceLanguageId:integer,targetLanguageId:integer
npx sequelize-cli model:generate --name Specialization --attributes name:string
npx sequelize-cli model:generate --name Project --attributes clientId:integer,translatorId:integer,title:string,description:text,sourceLanguageId:integer,targetLanguageId:integer,wordCount:integer,specializationId:integer,budget:decimal,deadline:date,status:string
npx sequelize-cli model:generate --name ProjectDocument --attributes projectId:integer,uploadedBy:integer,type:string,filePublicId:string,fileURL:string,notes:string
npx sequelize-cli model:generate --name ProjectApplication --attributes projectId:integer,translatorId:integer,proposedPrice:decimal,estimatedDays:integer,status:string
npx sequelize-cli model:generate --name Payment --attributes projectId:integer,amount:decimal,proofURL:string,status:string,verifiedBy:integer
npx sequelize-cli model:generate --name Review --attributes projectId:integer,reviewerId:integer,rating:integer,comment:string
npx sequelize-cli model:generate --name TranslatorSpecialization --attributes translatorId:integer,specializationId:integer   
npx sequelize-cli model:generate --name ProjectInvitation --attributes projectId:integer,translatorId:integer,clientId:integer,status:string,message:string     
npx sequelize-cli model:generate --name ProjectCandidate --attributes projectId:integer,translatorId:integer,type:string,status:string,message:string               
```

