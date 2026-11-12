import { Avatar, Button, Icon, Text } from 'ic-kit';
import { CURRENT_USER } from '@/lib/currentUser';

/** Блок профиля на рабочем столе. */
export function DashboardProfile() {
  return (
    <section
      className="kb-section glass-panel kb-widget kb-dash-profile"
      aria-labelledby="kb-dash-profile-title"
    >
      <Text as="h2" id="kb-dash-profile-title" variant="subtitle-md-bold">
        Профиль
      </Text>
      <div className="kb-dash-profile__body">
        <Avatar
          size="md"
          src={CURRENT_USER.avatarSrc}
          alt={CURRENT_USER.fullName}
          className="kb-dash-profile__avatar"
        />
        <Text as="p" variant="subtitle-sm-bold" className="kb-dash-profile__name">
          {CURRENT_USER.fullName}
        </Text>
        <Text as="p" variant="body-sm" color="secondary" className="kb-dash-profile__email">
          {CURRENT_USER.email}
        </Text>
        <Button
          size="sm"
          variant="text"
          color="primary"
          className="kb-dash-profile__edit"
          startIcon={<Icon path="Design/PencilSimple" size={16} weight="regular" />}
          onClick={() => window.alert('Мок: редактирование профиля')}
        >
          Редактировать
        </Button>
      </div>
    </section>
  );
}
