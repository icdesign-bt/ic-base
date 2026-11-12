import { useMemo, useState } from 'react';
import { Text } from 'ic-kit';
import { DayDocs } from '@/components/meetings/DayDocs';
import { DayPriorContext } from '@/components/meetings/DayPriorContext';
import { DaySchedule } from '@/components/meetings/DaySchedule';
import { DayStrip } from '@/components/meetings/DayStrip';
import { MeetingDetailModal } from '@/components/meetings/MeetingDetailModal';
import { DEMO_TODAY, formatSelectedDayDate } from '@/lib/demoTime';
import { listMeetingsForRole } from '@/lib/corpus';
import {
  daysWithMeetings,
  docsForDay,
  meetingsOnDay,
  priorContextForDay,
} from '@/lib/meetingsBriefing';
import { useApp } from '@/state/AppContext';

export function MeetingsPage() {
  const { role } = useApp();
  const meetings = listMeetingsForRole(role);
  const [selectedDay, setSelectedDay] = useState(DEMO_TODAY);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const eventDays = useMemo(() => daysWithMeetings(meetings), [meetings]);
  const dayMeetings = useMemo(
    () => meetingsOnDay(meetings, selectedDay),
    [meetings, selectedDay],
  );

  const openMeeting =
    selectedMeetingId != null
      ? meetings.find((m) => m.id === selectedMeetingId) ?? null
      : null;

  const focusId =
    openMeeting && dayMeetings.some((m) => m.id === openMeeting.id) ? openMeeting.id : null;

  const docs = useMemo(
    () => docsForDay(dayMeetings, role, focusId),
    [dayMeetings, role, focusId],
  );
  const prior = useMemo(
    () => priorContextForDay(meetings, dayMeetings, selectedDay, focusId),
    [meetings, dayMeetings, selectedDay, focusId],
  );

  const onSelectDay = (dayKey: string) => {
    setSelectedDay(dayKey);
    setSelectedMeetingId(null);
  };

  return (
    <div className="kb-page kb-page--meetings">
      <div className="kb-meetings-day">
        <header className="kb-meetings-day__head">
          <Text as="h1" variant="heading-h4" className="kb-page__title">
            Встречи
          </Text>
          <div className="kb-meetings-day__lead">
            {selectedDay === DEMO_TODAY ? (
              <span>{`Сегодня · ${formatSelectedDayDate(selectedDay)}`}</span>
            ) : (
              <a
                href="#today"
                className="kb-meetings-day__today-link"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectDay(DEMO_TODAY);
                }}
              >
                Вернуться на сегодня
              </a>
            )}
          </div>
        </header>

        <DayStrip
          selectedDay={selectedDay}
          daysWithEvents={eventDays}
          onSelectDay={onSelectDay}
        />

        <div className="kb-meetings-day__layout">
          <DaySchedule
            meetings={dayMeetings}
            selectedMeetingId={focusId}
            onSelectMeeting={setSelectedMeetingId}
          />
          <DayDocs docs={docs} focusMeetingId={focusId} />
          <DayPriorContext items={prior} />
        </div>
      </div>

      {openMeeting ? (
        <MeetingDetailModal
          meeting={openMeeting}
          allMeetings={meetings}
          onClose={() => setSelectedMeetingId(null)}
        />
      ) : null}
    </div>
  );
}
