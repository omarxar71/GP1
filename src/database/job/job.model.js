import mongoose from "mongoose"
const JobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    employerId: { type: Types.ObjectId, ref: 'User'},
    category: { 
        type: String, 
        enum: ['Sales', 'Engineering', 'Marketing', 'HR', 'Accounting', 'IT', 'Customer Service'], 
        required: true 
    },
    description: { type: String, required: true },
    // Requirements for Matching
    skillsRequired: [{ type: String }],
    experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Expert'] },
    minExperience: { type: Number, default: 0 },
    
    // Budget & Headcount
    budget: {
        min: { type: Number },
        max: { type: Number, required: true }
    },
    headcount: { type: Number, default: 1 },
    workType: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
    
    // Metadata
    status: { type: String, enum: ['Draft', 'Active', 'Filled', 'Cancelled'], default: 'Active' },
    appliedCandidates: [{ type: Types.ObjectId, ref: 'User' }], // Track interested users
    shortlistedCandidates: [{ type: Types.ObjectId, ref: 'User' }] // Track filtered users
}, { timestamps: true }
)



const Job = mongoose.model("Job" , JobSchema)