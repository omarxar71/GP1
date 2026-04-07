import User from '../../database/User/user.model.js';
export const updateCandidateProfileDetailsAfterLogIn = async(req , res , next)=>{
    const {candidateProfile:
    {
        specialization , experienceLevel ,expectedSalary ,workType ,cvUrl,skills ,status , role 
    } }=req.body;
    const user = await User.findByIdAndUpdate(req.user.id , {
        candidateProfile:{
            specialization , experienceLevel ,expectedSalary ,workType ,cvUrl,skills ,status ,role
        }
    } , {new:true})
   
    return res.status(200).json({message:"user profile details updated successfully" , user});
}

//this is the company employer not our system employer
