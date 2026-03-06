import bcrypt from 'bcrypt';
export const hashing = ({plainText , saltRounds = 10})=>{
    return bcrypt.hashSync(plainText, saltRounds);
}

export const compareHash=({plainText , hashedText})=>{
    return bcrypt.compareSync(plainText, hashedText);
}