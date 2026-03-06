import { Schema, model } from 'mongoose';

const companySchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true }, // The company's main account
    industry: { type: String, required: true },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201+'] },
    website: String,
    logo: String,
    
    // Recruitment Specifics
    hrContact: {
        name: String,
        phone: String,
        email: String
    },
    
    // Revenue Logic
    preferredPricing: { 
        type: String, 
        enum: ['Percentage', 'Fixed'], 
        default: 'Fixed' 
    },
    commissionRate: { type: Number }, // e.g., 15 (for 15%)
    
    // Security
    isApproved: { type: Boolean, default: false }, // Admin must approve company
}, { timestamps: true  , toJSON: { virtuals: true }  , toObject: { virtuals: true } }
);
companySchema.virtual("jobs",{
    ref:"Job",
    localField:"_id",
    foreignField:"companyId",
})

export const Company = model('Company', companySchema);



// so the flow will be like: 
//     1- the first admin of the company logs in and creates his personal account as an employer
//     2- this first employer will be asked if his company is already in hireBridge application:
//                                                                                             a- let say no -> then the employer will be asked to fill the company details and submit it for approval
//                                                                                             b-let say yes -> then this employer will search for his company and request the admin to approve his account to be able to post jobs and manage the company profile