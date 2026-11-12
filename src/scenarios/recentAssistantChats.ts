import {
  ASSISTANT_FLOWS,
  getAssistantTurn,
  type AssistantScenarioId,
} from '@/scenarios/assistantFlows';

export type RecentAssistantChat = {
  id: string;
  scenarioId: AssistantScenarioId;
  entryQuery: string;
  /** Ход сценария от входа до текущего шага (любая глубина ≥ 1). */
  turnPath: string[];
  /** ISO-время последнего обновления (для группировки списка). */
  updatedAt: string;
};

export type ChatListGroupId = 'today' | 'yesterday' | 'week' | 'older';

export type ChatListGroup = {
  id: ChatListGroupId;
  label: string;
  items: RecentAssistantChat[];
};

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Группы как в примере: Сегодня / Вчера / Последние 7 дней / Ранее. */
export function groupChatsByRecency(chats: RecentAssistantChat[]): ChatListGroup[] {
  const now = new Date();
  const today = startOfLocalDay(now);
  const yesterday = today - 24 * 60 * 60 * 1000;
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

  const buckets: Record<ChatListGroupId, RecentAssistantChat[]> = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };

  for (const chat of chats) {
    const t = new Date(chat.updatedAt).getTime();
    const day = Number.isFinite(t) ? startOfLocalDay(new Date(t)) : today;
    if (day >= today) buckets.today.push(chat);
    else if (day >= yesterday) buckets.yesterday.push(chat);
    else if (day >= weekAgo) buckets.week.push(chat);
    else buckets.older.push(chat);
  }

  const labels: Record<ChatListGroupId, string> = {
    today: 'Сегодня',
    yesterday: 'Вчера',
    week: 'Последние 7 дней',
    older: 'Ранее',
  };

  return (['today', 'yesterday', 'week', 'older'] as ChatListGroupId[])
    .filter((id) => buckets[id].length > 0)
    .map((id) => ({ id, label: labels[id], items: buckets[id] }));
}

export type AssistantThreadMessage = {
  role: 'user' | 'assistant';
  text: string;
  turnId: string;
};

/** Канонические пути демо до 3-го шага (справочно / для resume). */
export const ASSISTANT_DEMO_PATHS: Record<AssistantScenarioId, string[]> = {
  innovacapital: ['all_years', 'upcoming_2027', 'ideas_excel'],
  start_initiative: ['rnd_pack', 'templates', 'backlog'],
  acl_sensitive: ['apparatus_pack', 'closed_only', 'apparatus_index'],
  meeting_knowledge: ['meet_pack', 'standup_card', 'howto'],
};

function userPhraseForTurn(
  scenarioId: AssistantScenarioId,
  turnId: string,
  entryQuery: string,
  isFirst: boolean,
): string {
  if (isFirst) return entryQuery;
  const turn = getAssistantTurn(scenarioId, turnId);
  return turn.matchPhrases?.[0] ?? turn.followUpHints?.[0] ?? entryQuery;
}

function assistantTextForTurn(scenarioId: AssistantScenarioId, turnId: string): string {
  const turn = getAssistantTurn(scenarioId, turnId);
  return turn.answer;
}

/** Собирает тред user/assistant по пути шагов. */
export function buildAssistantThread(
  scenarioId: AssistantScenarioId,
  entryQuery: string,
  turnPath: string[],
): AssistantThreadMessage[] {
  const flow = ASSISTANT_FLOWS[scenarioId];
  if (!flow || turnPath.length === 0) return [];

  const messages: AssistantThreadMessage[] = [];
  for (let i = 0; i < turnPath.length; i += 1) {
    const turnId = turnPath[i]!;
    messages.push({
      role: 'user',
      text: userPhraseForTurn(scenarioId, turnId, entryQuery, i === 0),
      turnId,
    });
    messages.push({
      role: 'assistant',
      text: assistantTextForTurn(scenarioId, turnId),
      turnId,
    });
  }
  return messages;
}

export function chatIdForScenario(scenarioId: AssistantScenarioId): string {
  return `assistant-chat-${scenarioId}`;
}
