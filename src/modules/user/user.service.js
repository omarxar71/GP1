import User from '../../database/User/user.model.js';
export const updateCandidateProfileDetailsAfterLogIn = async(req , res , next)=>{
   try {
    const {candidateProfile:
        {
            specialization , experienceLevel ,expectedSalary ,workType ,skills ,status 
        } }=req.body;
        const user = await User.findByIdAndUpdate(req.user.id , {
            candidateProfile:{
                specialization , experienceLevel ,expectedSalary ,workType ,skills ,status
            }
        } , {new:true})
        user.role = "candidate";
        await user.save();
        return res.status(200).json({message:"user profile details updated successfully" , user});
   } catch (error) {
    return res.status(500).json({message : "internal server error" , error : error.message})
    
   }
}


