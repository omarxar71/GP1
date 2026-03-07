import User from '../../database/User/user.model.js';
export const updateCandidateProfileDetailsAfterLogIn = async(req , res , next)=>{
    const {candidateProfile:
    {
        specialization , experienceLevel ,expectedSalary ,workType ,cvUrl,skills ,status 
    } }=req.body;
    const user = await User.findByIdAndUpdate(req.user.id , {
        candidateProfile:{
            specialization , experienceLevel ,expectedSalary ,workType ,cvUrl,skills ,status 
        }
    } , {new:true})
    if(!user || user.role !== "candidate"){
        return res.status(404).json({message:"user not found or user is not a candidate"});
    }
    return res.status(200).json({message:"user profile details updated successfully" , user});
}


export const updateEmployerProfile = async(req , res , next)=>{
    const {
        employerProfile:{
            companyName,
            companySize,
            industry,
            budgetRange,
            // hiringHistory
        }
    }= req.body;
    const user = await User.findByIdAndUpdate(req.user.id , {employerProfile:{
        companyName,
        companySize,
        industry,
        budgetRange,
        // hiringHistory
    }
    }, {
        new:true
    })
    if(!user || user.role !=="employer"){
        return res.status(404).json({message :  " user not found or user is not and employer"})
    }
        return res.status(200).json({message : "user found and the user is employer" , user })
}