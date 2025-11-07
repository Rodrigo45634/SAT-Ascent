
import { GoogleGenAI, Type } from '@google/genai';
import type { Question, Subject, Difficulty } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getTopicForSubject = (subject: Subject): string => {
    const topics = {
        Math: ["Heart of Algebra", "Problem Solving and Data Analysis", "Passport to Advanced Math", "Geometry and Trigonometry"],
        Reading: ["Information and Ideas", "Rhetoric", "Synthesis", "Vocabulary in Context"],
        Writing: ["Expression of Ideas", "Standard English Conventions", "Punctuation", "Sentence Structure"]
    };
    const subjectTopics = topics[subject];
    return subjectTopics[Math.floor(Math.random() * subjectTopics.length)];
}

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        topic: { type: Type.STRING },
        options: {
            type: Type.OBJECT,
            properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
            },
            required: ["A", "B", "C", "D"]
        },
        correctAnswer: { type: Type.STRING },
        explanation: { type: Type.STRING },
    },
    required: ["question", "topic", "options", "correctAnswer", "explanation"],
};

export const generateSatQuestion = async (
  subject: Subject,
  difficulty: Difficulty
): Promise<Question> => {
  try {
    const topic = getTopicForSubject(subject);
    const prompt = `Generate a multiple-choice SAT ${subject} question about "${topic}" with ${difficulty} difficulty. Provide the question, 4 options (A, B, C, D), the correct answer key (A, B, C, or D), and a brief, clear explanation for the correct answer.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: questionSchema,
            temperature: 1.2,
        },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    // Validate the response structure
    if (typeof parsed.question !== 'string' || typeof parsed.options !== 'object' || !parsed.options.A) {
        throw new Error("Invalid question format received from API");
    }

    return { ...parsed, subject };
  } catch (error) {
    console.error('Error generating SAT question:', error);
    throw new Error('Failed to communicate with the AI model. Please check your connection or API key.');
  }
};


export const getTutorFeedback = async (
    answerStatus: 'correct' | 'incorrect',
    question: Question
): Promise<string> => {
    try {
        const prompt = `I am an SAT student. I just answered a question on the topic of "${question.topic}". My answer was ${answerStatus}. Give me a very short (1-2 sentences), encouraging, coach-like feedback message. If my answer was incorrect, offer a brief, positive tip related to the topic without revealing the answer again.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              temperature: 0.8,
              maxOutputTokens: 50,
            }
        });

        return response.text.trim().replace(/"/g, ''); // Clean up response
    } catch (error) {
        console.error('Error getting tutor feedback:', error);
        return answerStatus === 'correct' ? "Excellent work!" : "Don't worry, every attempt is a step forward!";
    }
}
