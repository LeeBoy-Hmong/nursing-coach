export interface Question {
    question: string;
    answer: string;
    reveal: boolean;
}

const API_URL = "http://localhost:8000"

export async function fetchQuiz(nurseTopic: string): Promise<Question[]> {
    const response = await fetch(`${API_URL}/claude-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: nurseTopic }),
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);  // Throw a status error if issue with fetching from the API.
    const data = await response.json();
    return data["claude's reply"];
}