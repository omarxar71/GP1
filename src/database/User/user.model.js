import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true}, 
  role: { type: String, enum: ['candidate', 'CompanyEmployer', 'systemAdmin','superAdmin']},
  
  firstName: String,
  lastName: String,
  phoneNumber: String,

  reputationScore: { type: Number, default: 100 },
  isVerified: { type: Boolean, default: false },

 candidateProfile: {
  cvUrl: { type: String },
  specialization: { type: String, enum: ['Sales', 'Engineering', 'Marketing', 'HR', 'Accounting', 'IT', 'Customer Service'] },
  experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead'] },
  expectedSalary: {
    min: { type: Number },
    max: { type: Number }
  },
    workType: { type: String, enum: ['fullTime', 'partTime', 'contract', 'remote']},
  skills: [String],
  fraudCheck: {
    status: { 
      type: String, 
      enum: ['pending', 'clear', 'flagged', 'highly_suspicious'],
      default: 'pending' 
    },
    score: { 
      type: Number, 
      min: 0, 
      max: 100 
    },
    reason: { type: String },
    checkedAt: { type: Date }
  }
},

  employerProfile: {
    EmployerCompanyName: String,
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