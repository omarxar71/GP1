import nodemailer from 'nodemailer';
const sendEmail= async({to , subject ,html})=>{
    // sender 
    const transporter =nodemailer.createTransport({
        host:"smtp.gmail.com",
        port : 465, 
        secure:true , 
        auth :{
            user :process.env.EMAIL,
            pass:process.env.PASSWORD
        }
    })





    //receiver
    const info = await transporter.sendMail({
        from :`"HireBridge"<${process.env.EMAIL}>`,
        to,
        subject,
        html,
    })


     return info.rejected.length == 0 ? true : false ;
}
export default sendEmail;