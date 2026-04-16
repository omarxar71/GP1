import mongoose from "mongoose"
import {Types } from 'mongoose'; // Add Types here
const JobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    employerId: { type: Types.ObjectId, ref: 'User'},
    category:{type:String,required:true},
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
    shortlistedCandidates: [{ type: Types.ObjectId, ref: 'User' }], // Track filtered users
    acceptedCandidates: [{
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
        acceptedAt: { type: Date, default: Date.now }
    }],
    rejectedCandidates: [{
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
        rejectedAt: { type: Date, default: Date.now },
        reason: { type: String }   // optional rejection reason
    }]

}, { timestamps: true }
)



export const Job = mongoose.model("Job" , JobSchema)