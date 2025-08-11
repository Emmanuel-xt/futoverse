import { Suspense } from "react";
import { notFound } from "next/navigation";
import EditEventLoading from "@components/events/edit-event-loading";
import EditEventClient from "@components/events/edit-event-client";
import { fetchEventById } from "@lib/actions/events.prisma";

export default async function EditEventPage({ params }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<EditEventLoading />}>
          <EditEventContent eventId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}

async function EditEventContent({ eventId }) {
  const event = await fetchEventById(eventId);

  if (!event) {
    notFound();
  }

  return <EditEventClient event={event} />;
}
