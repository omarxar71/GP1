import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true}, 
  role: { type: String, enum: ['candidate', 'employer', 'admin'], required: true },
  
  firstName: String,
  lastName: String,
  phoneNumber: String,


  reputationScore: { type: Number, default: 100 },
  isVerified: { type: Boolean, default: false },

  candidateProfile: {
    specialization: { type: String, enum: ['Sales', 'Engineering', 'Marketing', 'HR', 'Accounting', 'IT', 'Customer Service'] },
    experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead'] },
    expectedSalary: Number,
    workType: { type: String, enum: ['Remote', 'On-site', 'Hybrid'] },
    cvUrl: String,
    skills: [String],
    probationPerformance: { type: Number, min: 0, max: 100 }, // For the AI performance prediction
    status: { type: String, enum: ['Available', 'Interviewing', 'Hired'], default: 'Available' }
  },

  employerProfile: {
    companyName: String,
    companySize: { type: String, enum: ['Small', 'Medium', 'Large'] },
    industry: String,
    budgetRange: { min: Number, max: Number },
    hiringHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
  },

  createdAt: { type: Date, default: Date.now }
  
}, { timestamps: true });


userSchema.index({ "candidateProfile.specialization": 1, "candidateProfile.experienceLevel": 1 });
userSchema.index({ "candidateProfile.skills": "text" });

const User = mongoose.model("User" , userSchema);

export default User;