import { Schema, model } from 'mongoose';

const companySchema = new Schema({
    employees: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            role: { 
                type: String, 
                enum: ['admin', 'hr', 'viewer'],
                default: 'viewer'
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            joinedAt: { type: Date, default: Date.now }
        }
    ],
    name: { type: String, required: true, trim: true },
    CompanyEmail: { type: String, required: true, unique: true },
    industry: { type: String, required: true },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201+'] },
    website: String,
    logo: String,
    admin: {
        adminEmail: String,
        id:{ type: Schema.Types.ObjectId, ref: 'User' }
    },
    preferredPricing: { 
        type: String, 
        enum: ['Percentage', 'Fixed'], 
        default: 'Fixed' 
    },
    commissionRate: { type: Number },
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId",
});

export const Company = model('Company', companySchema);