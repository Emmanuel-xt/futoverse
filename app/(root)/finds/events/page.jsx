import { Suspense } from "react";

import { fetchAllEvents } from "@lib/actions/events.prisma";
import EventsLoading from "@components/events/events-loading";
import EventsClient from "@components/events/events-clients";

export default async function EventsPage({ searchParams }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl pb-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600 mt-2">Discover upcoming FUTO events</p>
      </div>

      <Suspense fallback={<EventsLoading />}>
        <EventsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function EventsContent({ searchParams }) {
  const events = await fetchAllEvents();

  return (
    <EventsClient initialEvents={events} initialSearchParams={searchParams} />
  );
}
