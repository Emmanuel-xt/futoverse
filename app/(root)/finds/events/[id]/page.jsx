import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchEventById } from "@lib/actions/events.prisma";
import EventDetailsLoading from "@components/events/event-details-loading";
import EventDetailsClient from "@components/events/event-details";

export default async function EventPage({ params }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<EventDetailsLoading />}>
        <EventContent eventId={params.id} />
      </Suspense>
    </div>
  );
}

async function EventContent({ eventId }) {
  const event = await fetchEventById(eventId);

  if (!event) {
    notFound();
  }

  return <EventDetailsClient event={event} />;
}
