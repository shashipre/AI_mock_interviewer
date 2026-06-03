// File left empty intentionally for the user to write their own implementation.
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Experience {
    company: string;
    role: string;
    duration: string;
    summary: string;
}

export interface Project {
    name: string;
    tech_stack: string[];
    summary: string;
}

export interface Question {
    question: string;
    topic: string;
    based_on : string;
}

export interface CandidateInfo {
    candidate_name: string;
    target_role: string;
    interviewer_summary: string
}

export interface ResumeAnalysis {
    candidate_info: CandidateInfo;
    skills: string[];
    experience: Experience[];
    projects: Project[];
    question_bank: Question[];
}

export interface ResumeUploadResponse{
    message: string;
    analysis: ResumeAnalysis;
}

export interface QuestionResponse{
    session_id: string;
    question: string;
    question_type: string;
    question_number: number;
    is_complete:boolean;
}

export interface EvaluationResponse{
    session_id: string;
    feedback: string;
    score?: number;
    [key: string]: any;
}

export const api = {

    uploadResume: async (file: File):
Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ResumeUploadResponse>('/resume/upload',formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
},

    startSession: async (resumeAnalysis: ResumeAnalysis):
Promise<QuestionResponse> => {
    const response = await apiClient.post<QuestionResponse>
('/session/start',{
    resume_analysis:resumeAnalysis,
});
    return response.data;
},

    submitAnswer: async (sessionId: string, answerText:string): 
Promise<QuestionResponse> => {
    const response = await apiClient.post<QuestionResponse> 
    ('/interview/answer',{
        session_id: sessionId,
        answer: answerText,
    });
    return response.data;
},

    endSession: async (sessionId: string): 
Promise<{message: string}> => {
    const response = await apiClient.post<{
        message: string
    }>(
        `/session/end? session_id=${encodeURIComponent(sessionId)}`
    );
    return response.data;
},

    getEvalutio: async (sessionId: string):
Promise<EvaluationResponse> => {
    const response = await apiClient.get<EvaluationResponse>
    (`/evaluation/${sessionId}`);
    return response.data;
},
};

export default api;