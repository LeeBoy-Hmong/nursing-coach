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

export async function fetchQuiz(nurseTopic: string): Promise<Question[]> {
    const response = await fetch(`${API_URL}/claude-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ notes: nurseTopic}),
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return data["claude's reply"];    
}

export async function fetchQuizById(quiz_id: string): Promise<SavedQuiz> {
    const response = await fetch(`${API_URL}/quizzes/${quiz_id}`);

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return data;
}

export async function fetchQuizList(): Promise<SavedQuiz[]> {
    const response = await fetch(`${API_URL}/quizzes`, {
        method: "GET",
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);  // Throw a status error if issue with fetching from the API.
    const data = await response.json();
    return data;
}