import mongoose from "mongoose"
import { Types } from "mongoose"

const interviewSchema = new mongoose.Schema({
    job: { 
        type: Types.ObjectId, 
        ref: 'Job', 
        required: true 
    },
    candidate: { 
        type: Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    company: { 
        type: Types.ObjectId, 
        ref: 'Company', 
        required: true 
    },
    scheduledBy: { 
        type: Types.ObjectId, 
        ref: 'User',
        required: true      // always the company employer
    },
    scheduledAt: { 
        type: Date, 
        required: true      // date and time company picks
    },
    type: { 
        type: String, 
        enum: ['online', 'onsite', 'phone'],
        required: true 
    },
    location: { 
        type: String        // meeting link if online, address if onsite
    },
    status: { 
        type: String, 
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled' 
    },
    outcome: { 
        type: String, 
        enum: ['passed', 'failed', 'pending'],
        default: 'pending'
    },
    notes: { type: String }

}, { timestamps: true })

export const Interview = mongoose.model("Interview", interviewSchema)