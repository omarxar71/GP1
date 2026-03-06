import jwt from 'jsonwebtoken';


export const generateToken=({plainText , secretKey =process.env.TokenSecretekey})=>{
    return jwt.sign(plainText , secretKey)
}

export const verifyToken = ({token , secretKey = process.env.TokenSecretekey})=>{
    return jwt.verify(token , secretKey)
}