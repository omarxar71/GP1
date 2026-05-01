import User from "../../database/User/user.model.js"
import { Interview } from "../../database/interview/interview.model.js"
import axios from 'axios';
import { CanvasFactory } from 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
// get the candidate profile
export const getCandidateProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id).select("-password")
    if (!user)
        return res.status(404).json({ message: "user not found" })
    return res.status(200).json({ message: "user profile", user })

}
export const uploadCandidateCV = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Make sure a file was actually provided
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a CV file" });
        }

        // req.file.path contains the secure Cloudinary URL
        const cvUrl = req.file.path;

        // Update the user's candidate profile in the database
        const user = await User.findByIdAndUpdate(
            userId,
            { "candidateProfile.cvUrl": cvUrl },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "CV uploaded successfully",
            cvUrl: cvUrl,
            user
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const checkMyCvFraud = async (req, res, next) => {
    try {
        // 1. Identify the logged-in candidate
        const candidateId = req.user.id;

        const candidate = await User.findById(candidateId);
        if (!candidate || !candidate.candidateProfile.cvUrl) {
            return res.status(400).json({ message: "Please upload a CV first before running the check." });
        }

        // 2. Fetch the PDF from Cloudinary into memory (RAM)
        const response = await axios.get(candidate.candidateProfile.cvUrl, {
            responseType: 'arraybuffer'
        });

        // 3. Extract the text using the new v2 API
        const parser = new PDFParse({ 
            data: Buffer.from(response.data), 
            CanvasFactory 
        });
        const pdfData = await parser.getText();
        const cvText = pdfData.text;

        // 4. The AI Prompt
        const prompt = `
            You are an expert HR AI verification system. Analyze the following CV text for inconsistencies, timeline overlaps, exaggerated titles, or logical impossibilities. 
            
            Return ONLY a valid JSON object with this exact structure, no markdown formatting, no extra text:
            {
              "fraudScore": <Number 0-100, where 100 is highly suspicious>,
              "status": <String: "clear", "flagged", or "highly_suspicious">,
              "redFlags": [<Array of Strings detailing exact inconsistencies, keep them professional>]
            }

            CV Text to analyze:
            ${cvText}
        `;

        // 5. Run the Gemini analysis
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const aiResponse = await model.generateContent(prompt);
        const responseText = aiResponse.response.text();

        // 6. Clean and parse the JSON response
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const fraudAnalysis = JSON.parse(cleanJson);

        // 7. Save to the database
        candidate.candidateProfile.fraudCheck = {
            status: fraudAnalysis.status,
            score: fraudAnalysis.fraudScore,
            reason: fraudAnalysis.redFlags.join(" | "),
            checkedAt: Date.now()
        };
        await candidate.save();

        // 8. Return the results to the candidate
        return res.status(200).json({
            message: "CV verification complete",
            results: {
                score: fraudAnalysis.fraudScore,
                status: fraudAnalysis.status,
                details: fraudAnalysis.redFlags
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getCandidateInterviews = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === "superAdmin" || req.user.role === "systemAdmin"
        const candidateId = req.params.candidateId || req.user.id
        const candidate = await User.findById(candidateId)
        if (!candidate)
            return res.status(404).json({ message: "candidate not found" })
        if (candidate.role !== "candidate" && !isAdmin)
            return res.status(403).json({ message: "you are not a candidate" })
        if (!isAdmin && req.user.id !== candidateId)
            return res.status(403).json({ message: "you are not authorized to view these interviews" })

        const interviews = await Interview.find({ candidate: candidateId })
            .populate("job")
            .populate("company")
        if (!interviews || interviews.length === 0)
            return res.status(200).json({ message: "no interviews found", interviews: [] })

        return res.status(200).json({ message: "interviews found", total: interviews.length, interviews })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}
