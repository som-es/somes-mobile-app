import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import '@/test/i18n';
import { QuestionCard } from '@/components/cards/question-card';
import { somes } from '@/lib/somes';
import type { Delegate, PublicDelegateQuestion } from '@/types';

jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  somes: {
    delegates: { byId: jest.fn() },
    delegateImageUrl: (id: number) => `https://example.test/${id}.jpg`,
  },
  delegateAvatarUrl: (_country: string, id: number) => `https://example.test/${id}.jpg`,
  getCountry: () => 'at',
  subscribeToCountry: () => () => {},
}));

const delegate = { id: 7, name: 'Erika Beispiel', party: 'SPÖ', image_url: null } as Delegate;

const baseQuestion: PublicDelegateQuestion = {
  id: 1,
  delegate_id: 7,
  subject: 'Subject',
  body: 'Body',
  created_at: '2026-09-10T09:14:00Z',
  created_at_date: '2026-09-10',
  topics: [],
  answers: [],
};

function renderCard(question: PublicDelegateQuestion) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <QuestionCard question={question} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (somes.delegates.byId as jest.Mock).mockResolvedValue(delegate);
});

describe('QuestionCard recipient', () => {
  it('shows the asked MP on an unanswered question', async () => {
    await renderCard(baseQuestion);

    expect(await screen.findByText('Erika Beispiel · SPÖ')).toBeTruthy();
    expect(somes.delegates.byId).toHaveBeenCalledWith(7);
  });

  it('shows the asked MP on an answered question', async () => {
    await renderCard({
      ...baseQuestion,
      answers: [{ body: 'Thanks for asking', received_at: '2026-09-18T15:42:00Z' }],
    });

    expect(await screen.findByText('Erika Beispiel · SPÖ')).toBeTruthy();
    expect(screen.getByText('Thanks for asking')).toBeTruthy();
  });
});
