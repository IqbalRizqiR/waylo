"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {MentorDetail, BookSessionInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Icon} from "@/components/ui/icon";
import {Chip} from "@/components/ui/chip";
import {InitialsAvatar} from "@/components/ui/avatar";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export function MentorDetailView({id}: {id: string}) {
  const t = useTranslations("learner.mentors");
  const tc = useTranslations("common");

  const query = useApiQuery<MentorDetail>(
    queryKeys.learner.mentor(id),
    `/learner/mentors/${id}`,
  );

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const bookMutation = useApiMutation({
    invalidateKeys: [queryKeys.learner.sessions, queryKeys.learner.dashboard],
    mapVariables: (body: BookSessionInput) => ({
      path: `/learner/mentors/${id}/book-session`,
      method: "POST",
      body,
    }),
    onSuccess: () => {
      setBookingSuccess(true);
    },
  });

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(mentor) => {
        // Group availability by dayOfWeek
        const availableDays = [...new Set(mentor.availability.map((a) => a.dayOfWeek))].sort();

        // Slots for selected day
        const daySlots =
          selectedDay !== null
            ? mentor.availability.filter((a) => a.dayOfWeek === selectedDay)
            : [];

        function handleBook() {
          if (selectedDay === null || !selectedTime || !topic.trim()) return;

          // Compute next occurrence of selected dayOfWeek
          const now = new Date();
          const currentDay = now.getDay();
          let daysUntil = selectedDay - currentDay;
          if (daysUntil <= 0) daysUntil += 7;

          const sessionDate = new Date(now);
          sessionDate.setDate(now.getDate() + daysUntil);
          const [hours, minutes] = selectedTime.split(":").map(Number);
          sessionDate.setHours(hours, minutes, 0, 0);

          void bookMutation.mutateAsync({
            topic: topic.trim(),
            startsAt: sessionDate.toISOString(),
            note: note.trim() || undefined,
          });
        }

        return (
          <div className="flex flex-col gap-8">
            <div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/learner/mentors">
                  <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                  {tc("back")}
                </Link>
              </Button>
            </div>

            <PageHeader title={mentor.fullName} subtitle={mentor.headline} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Mentor profile card */}
              <Card className="flex flex-col gap-5 p-6">
                <div className="flex items-center gap-4">
                  <InitialsAvatar
                    initials={mentor.avatarInitials}
                    size="lg"
                    label={mentor.fullName}
                  />
                  <div>
                    <h2 className="text-xl font-medium text-black">{mentor.fullName}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{mentor.headline}</p>
                  </div>
                </div>

                {mentor.rating !== null ? (
                  <p className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                    <Icon name="mingcute:star-fill" className="text-[#FFB206]" />
                    <span className="font-semibold text-black">{mentor.rating}</span>
                    <span className="text-[var(--muted-foreground)]">
                      ({mentor.reviewCount} ulasan)
                    </span>
                  </p>
                ) : null}

                <div className="border-t border-border pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t("skillsTitle")}
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {mentor.skills.map((skill) => (
                      <Chip key={skill} tone="skill">
                        {skill}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t("bioTitle")}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {mentor.bio}
                  </p>
                </div>
              </Card>

              {/* Booking Calendar Card */}
              <Card className="flex flex-col gap-6 p-6 lg:col-span-2 sm:p-8">
                <div>
                  <h2 className="text-xl font-medium text-black">{t("scheduleTitle")}</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {t("scheduleSubtitle")}
                  </p>
                </div>

                {bookingSuccess ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-green-100 text-3xl text-success">
                      <Icon name="mingcute:check-circle-line" />
                    </span>
                    <h3 className="text-xl font-medium text-black">{t("bookingSuccessTitle")}</h3>
                    <p className="max-w-md text-sm text-[var(--text-secondary)]">
                      {t("bookingSuccessBody")}
                    </p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href="/learner/mentors">{t("backToList")}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Step 1: Select Day */}
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-medium text-black">
                        1. {t("selectDay")}
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {availableDays.map((day) => {
                          const isSelected = selectedDay === day;
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setSelectedDay(day);
                                setSelectedTime(null);
                              }}
                              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-white shadow-sm"
                                  : "border-border bg-white text-black hover:border-primary/40"
                              }`}
                            >
                              <Icon name="mingcute:calendar-line" className="text-base" />
                              {DAY_NAMES[day]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Select Time Slot */}
                    {selectedDay !== null ? (
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-black">
                          2. {t("selectTime")} ({DAY_NAMES[selectedDay]})
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {daySlots.map((slot) => {
                            const isSelected = selectedTime === slot.startTime;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedTime(slot.startTime)}
                                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                                  isSelected
                                    ? "border-primary bg-secondary text-primary shadow-sm"
                                    : "border-border bg-white text-black hover:border-primary/40"
                                }`}
                              >
                                <Icon name="mingcute:time-line" className="text-sm" />
                                {slot.startTime} - {slot.endTime}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {/* Step 3: Session Topic & Notes */}
                    {selectedTime !== null ? (
                      <div className="flex flex-col gap-4 border-t border-border pt-4">
                        <label className="text-sm font-medium text-black">
                          3. {t("sessionDetails")}
                        </label>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="topic" className="text-xs text-[var(--muted-foreground)]">
                            {t("topicLabel")} *
                          </label>
                          <Input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t("topicPlaceholder")}
                            className="h-12"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="note" className="text-xs text-[var(--muted-foreground)]">
                            {t("noteLabel")} ({tc("optional")})
                          </label>
                          <Input
                            id="note"
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t("notePlaceholder")}
                            className="h-12"
                          />
                        </div>

                        <Button
                          onClick={handleBook}
                          disabled={!topic.trim() || bookMutation.isPending}
                          size="lg"
                          className="mt-2"
                        >
                          {bookMutation.isPending ? tc("loading") : t("confirmBooking")}
                          <Icon name="mingcute:calendar-add-line" className="ml-2 text-xl" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </Card>
            </div>
          </div>
        );
      }}
    </DataState>
  );
}
