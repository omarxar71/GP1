import User from "../../database/User/user.model.js"

export const postJob= async (req ,res ,next)=>{
try{
    const user= await User.findById(req.user.id)
}catch{

}
}