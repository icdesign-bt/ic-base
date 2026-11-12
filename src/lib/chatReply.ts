import { canView } from '@/lib/acl';
import { getDocument, getFolder } from '@/lib/corpus';
import { matchIntent } from '@/scenarios/intents';
import type { RoleId } from '@/types/knowledge';

export type ChatMsg = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  citations?: string[];
};

function isDocVisible(docId: string, role: RoleId): boolean {
  const doc = getDocument(docId);
  if (!doc) return false;
  const folder = getFolder(doc.folderId);
  return canView(doc.acl, role) && canView(folder?.acl ?? [], role);
}

export function buildChatReply(q: string, role: RoleId): ChatMsg {
  const intent = matchIntent(q);

  if (intent?.chat) {
    const all = intent.chat.citations;
    const visibleCitations = all.filter((c) => isDocVisible(c.documentId, role));
    const hidden = all.length - visibleCitations.length;
    let text = intent.chat.answer;
    if (hidden > 0 && visibleCitations.length > 0) {
      text += `\n\nЧасть источников (${hidden}) недоступна вашей роли.`;
    } else if (hidden > 0 && visibleCitations.length === 0) {
      text =
        'По этому вопросу есть материалы, но все источники скрыты ACL для вашей роли. Переключите роль, чтобы увидеть цитаты.';
    }
    return {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text,
      citations: visibleCitations.map((c) => c.documentId),
    };
  }

  if (intent?.id === 'acl_sensitive') {
    const visible = isDocVisible('doc-app-sensitive', role);
    return {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: visible
        ? 'Нашёл служебную записку аппарата. Можно открыть превью.'
        : 'В вашей зоне видимости этого документа нет — доступы Базы знаний 2.0 это скрывают. Смените роль на «Аппарат руководителя».',
      citations: visible ? ['doc-app-sensitive'] : undefined,
    };
  }

  return {
    id: `a-${Date.now()}`,
    role: 'assistant',
    text: 'Пока отвечаю по заготовленным сценариям демо. Попробуйте чип ниже или «как завести инициативу».',
  };
}
