// Interface's have to match out read models -- it is telling what to output.

export interface Question {
    id: string;  // In place of uuid
    question: string;
    answer: string;
    position: number;  // number is used for integers.
};

export interface SavedQuiz {
    id: string;
    type: string;
    title: string;
    topic: string | null;
    created_at: string;
    questions: Question[];
};

export interface MedCards {
    generic_name: string;
    brand_name: string | null;
    drug_class: string | null;
    dose: string | null;
    route: string | null;
    frequency: string | null;
    mechanism_of_action: string | null; 
    contraindications: string | null;
    adverse_effects: string | null;
    nursing_considerations: string | null;
    patient_teaching: string | null;
    labs_to_monitor: string | null;
    rxcui: string | null;
    external_verified_at: string | null;
    indication: string | null;
};

export interface SavedMedCards {
    id: string;
    title: string;
    topic: string | null;
    created_at: string;
    medical_card: MedCards | null;
};

export interface SavedMedCardsLists {
    id: string;
    title: string;
    topic: string | null;
    created_at: string;
}

const API_URL = "http://localhost:8000"

export async function fetchQuiz(nurseQuestion: string, nurseTopic: string): Promise<Question[]> {
    const response = await fetch(`${API_URL}/claude-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ question: nurseQuestion, topic: nurseTopic }),
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return data["claude's reply"];    
};

export async function fetchQuizById(quiz_id: string): Promise<SavedQuiz> {
    const response = await fetch(`${API_URL}/quizzes/${quiz_id}`);

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return data;
};

export async function fetchQuizList(): Promise<SavedMedCardsLists[]> {
    const response = await fetch(`${API_URL}/quizzes`, {
        method: "GET",
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);  // Throw a status error if issue with fetching from the API.
    const data = await response.json();
    return data;
};
// Create three fetch functions for Med card -- ensure the are async.
// fetchMedCard(), fetchMedCardList(), and fetchMedCardId()

export async function fetchMedCard(drugName: string, drug_topic: string): Promise<SavedMedCards> {
    const response = await fetch(`${API_URL}/med-cards`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({ drug_name: drugName, medical_topic: drug_topic }),  // We are telling this what to send, so the Body's key has to match you BaseModel of the POST function.
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        return data;
};

export async function fetchMedCardList(): Promise<SavedMedCardsLists[]> {
    const response = await fetch(`${API_URL}/med-cards`, {
        method: "GET"
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return data;
};

export async function fetchMedCardID(card_id: string): Promise<SavedMedCards> {
    const response = await fetch(`${API_URL}/med-cards/${card_id}`, {
        method: "GET"
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return data;
};