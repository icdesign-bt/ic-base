import type { RoleId } from '@/types/knowledge';

export type RoleOption = {
  id: RoleId;
  label: string;
  description: string;
};

export const ROLES: RoleOption[] = [
  {
    id: 'apparatus',
    label: 'Аппарат руководителя',
    description: 'Видит чувствительные материалы аппарата',
  },
  {
    id: 'hr',
    label: 'HR',
    description: 'Видит кадровые документы',
  },
  {
    id: 'employee',
    label: 'Сотрудник отдела',
    description: 'Общий контур без закрытых папок',
  },
];

export const DEFAULT_ROLE: RoleId = 'apparatus';
