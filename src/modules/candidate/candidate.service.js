import User from "../../database/User/user.model.js"
// get the candidate profile
export const getCandidateProfile = async(req, res, next)=>{
    const user = await User.findById(req.user.id).select("-password")
    if(!user)
        return res.status(404).json({message : "user not found"})
    return res.status(200).json({message :"user profile" , user})

}