/** @deprecated Используйте `@/scenarios/assistantFlows`. Оставлено для совместимости. */
export {
  ASSISTANT_THINK_MS as IC_CHAT_THINK_MS,
  matchAssistantEntry,
  matchesAny,
} from '@/scenarios/assistantFlows';

import { ASSISTANT_FLOWS, matchAssistantEntry } from '@/scenarios/assistantFlows';

export function isInnovacapitalChatEntry(query: string): boolean {
  return matchAssistantEntry(query) === 'innovacapital';
}

export const IC_CHAT_TURNS = ASSISTANT_FLOWS.innovacapital.turns;
