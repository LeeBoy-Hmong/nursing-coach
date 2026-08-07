export interface Question {
    id: string;  // In place of uuid
    question: string;
    answer: string;
    position: number;  // number is used for integers.
}

export interface SavedQuiz {
    id: string;
    type: string;
    title: string;
    topic: string | null;
    created_at: string;
    questions: Question[];
}

const API_URL = "http://localhost:8000"

export async function fetchQuizList(id: string): Promise<SavedQuiz[]> {
    const response = await fetch(`${API_URL}/quizzes`, {
        method: "GET",
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);  // Throw a status error if issue with fetching from the API.
    const data = await response.json();
    return data;
}