// function twoSum(nums,target){
//     let seen = new Map()
//     for (let i = 0; i < nums.length; i++) {
//         const sisa = target - nums[i];
//         if(seen.has(sisa)){
//             return [seen.get(sisa), i]
//         }
//         seen.set(nums[i],i);
//     }
//     return [];
// }

// let nums = [2,9,8,15];
// const target = 9;

// console.log(twoSum(nums,target));

// function checkDuplicate(nums){
//     const seen = new Map();
//     let hasil;
//     for (let i = 0; i < nums.length; i++) {
//         let num = nums[i];
//         if(seen.has(num)){
//             return true;
//         }
//         seen.set(num,i);
//     }
//     return false;
// }
// let nums = [2,9,8,15,2];

// console.log(checkDuplicate(nums));
    // static async createProject(req,res){
    //     try{
    //         const clientId = req.user.id;

    //         const {
    //             title,
    //             description,
    //             sourceLanguageId,
    //             targetLanguageId,
    //             wordCount,
    //             specializationId,
    //             budget,
    //             deadline
    //         } = req.body;

            // const project = await Project.create({
            //     clientId,
            //     title,
            //     description,
            //     sourceLanguageId,
            //     targetLanguageId,
            //     wordCount,
            //     specializationId,
            //     budget,
            //     deadline,
            //     status:'WAITING_PAYMENT'
            // });

    //         res.status(201).json(project);
    //     }catch(error){
    //         res.status(500).json(error);
    //     }
    // }

// const days = 10;
// const date = new Date();

// function addDays(date,days){
//     const result = new Date(date);
//     result.setDate(result.getDate() + days);
//     return result
// }
// console.log(addDays(date,days));
// console.log(new Date(new Date()));
// let decimal = 3.1415
// decimal.toFixed(2)
// console.log(float(decimal)[2]);
let kata = "CODING";
let index = 0;

while(kata){ // No 10

 if(index === kata.length){
  break;
 } else{
  console.log(kata[index]);
 } // No 12

 index = index + 1; // No 11
}