import type {
  Delegate,
  DelegateQuestionsWithMaxPage,
  PublicDelegateQuestion,
} from "@/types";

/** EXPO_PUBLIC_MOCK_QUESTIONS=true swaps the questions list/detail queries for
    the local fixtures below, so the UI can be checked without hitting the API.
    only EXPO_PUBLIC_-prefixed vars are inlined into the client bundle */
export const MOCK_QUESTIONS = process.env.EXPO_PUBLIC_MOCK_QUESTIONS === "true";

export const MOCK_DELEGATE: Delegate = {
  id: -1,
  name: "Maria Musterfrau",
  party: "ÖVP",
  current_party: "ÖVP",
  image_url: null,
  image_copyright: null,
  constituency: "Wien",
  council: "NR",
  seat_row: null,
  seat_col: null,
  gender: "f",
  is_active: true,
  birthdate: "1980-04-12",
  active_since: "2019-10-23T00:00:00Z",
  divisions: null,
  mandates_at_time: null,
  active_mandates: null,
  mandates: null,
  active_gps: null,
  active_nr_gps: null,
  active_gov_gps: null,
};

// negative ids can never collide with real questions, and let the detail
// screen tell a mock id apart from a real one
export const MOCK_QUESTION_LIST: PublicDelegateQuestion[] = [
  {
    id: -1,
    delegate_id: MOCK_DELEGATE.id,
    subject: "Wie steht es um den Ausbau der Öffis im ländlichen Raum?",
    body: "Sehr geehrte Frau Musterfrau, in meiner Gemeinde fährt der letzte Bus um 18 Uhr. Welche konkreten Maßnahmen plant Ihre Fraktion, um die Anbindung ländlicher Regionen an den öffentlichen Verkehr in dieser Gesetzgebungsperiode zu verbessern?",
    created_at: "2026-09-10T09:14:00Z",
    created_at_date: "2026-09-10",
    topics: [
      { id: "1", topic: "Verkehr" },
      { id: "2", topic: "Regionalpolitik" },
    ],
    answers: [
      {
        body: "Vielen Dank für Ihre Frage. Wir setzen uns im Verkehrsausschuss für eine Taktverdichtung im Regionalbusverkehr ein und haben dazu einen Entschließungsantrag eingebracht. Zusätzlich sollen Rufbus-Modelle in Gemeinden unter 5.000 Einwohner:innen gefördert werden.",
        received_at: "2026-09-18T15:42:00Z",
      },
    ],
  },
  {
    id: -2,
    delegate_id: MOCK_DELEGATE.id,
    subject: "Leistbares Wohnen für junge Menschen",
    body: "Wie wollen Sie sicherstellen, dass junge Menschen sich trotz steigender Mieten eine eigene Wohnung leisten können?",
    created_at: "2026-09-20T11:03:00Z",
    created_at_date: "2026-09-20",
    topics: [{ id: "3", topic: "Wohnen" }],
    answers: [],
  },
];

export const MOCK_QUESTIONS_PAGE: DelegateQuestionsWithMaxPage = {
  delegate_questions: MOCK_QUESTION_LIST,
  entry_count: MOCK_QUESTION_LIST.length,
  max_page: 1,
  updated_at: "2026-09-20T11:03:00Z",
};

export function mockQuestionById(id: number): PublicDelegateQuestion {
  const question = MOCK_QUESTION_LIST.find((candidate) => candidate.id === id);
  if (!question) throw new Error(`no mock question with id ${id}`);
  return question;
}
