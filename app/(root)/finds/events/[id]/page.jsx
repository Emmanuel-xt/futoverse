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

export async function generateMetadata({ params }) {
  const event = await fetchEventById(params.id);

  if (!event) {
    return {
      title: "Event Not Found",
      description: "The requested event could not be found.",
    };
  }

  // Format date for display
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create a clean description (first 160 characters)
  const cleanDescription =
    event.description
      .replace(/\n/g, " ")
      .replace(/[^\w\s.,!?-]/g, "")
      .substring(0, 160)
      .trim() + (event.description.length > 160 ? "..." : "");

  const title = `${event.title} | Events`;
  const description = `${cleanDescription} Join us on ${eventDate} at ${event.location}. ${event.price > 0 ? `Tickets from ₦${event.price.toLocaleString()}` : "Free event"}.`;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type: "website",
      url: `/finds/events/${params.id}`,
      images: [
        {
          url: event.image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      siteName: "Events Platform",
      locale: "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [event.image],
      creator: "@eventsplatform",
    },

    other: {
      "event:start_time": event.date,
      "event:end_time": event.endDate,
      "event:location": event.location,
      "event:organizer": event.organizer,
      "event:price": event.price.toString(),
    },
  };
}

async function EventContent({ eventId }) {
  const event = await fetchEventById(eventId);

  if (!event) {
    notFound();
  }

  return <EventDetailsClient event={event} />;
}
