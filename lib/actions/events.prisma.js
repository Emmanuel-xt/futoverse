"use server";

import prisma from "@prisma/prisma";

export const createNewEvent = async (form) => {
  const {
    id,
    title,
    description,
    date,
    endDate,
    location,
    image,
    category,
    organizer,
    attendees,
    maxAttendees,
    price,
    isOnline,
    tags,
  } = form;

  try {
    console.log("Creating event with data:", form);
    await prisma.event.create({
      data: {
        id: id,
        title: title,
        description: description,
        date: new Date(date),
        endDate: new Date(endDate),
        location: location,
        image: image,
        category: category,
        organizer: organizer,
        attendees: attendees,
        maxAttendees: maxAttendees,
        price: price,
        isOnline: isOnline,
        tags: tags, // Prisma handles string[]
      },
    });

    console.log("Event created successfully");

    return true;
  } catch (error) {
    console.error("Error creating event", error);
    return false;
  }
};

export async function fetchAllEvents() {
  try {
    console.log("Fetching all events");
    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
    });

    console.log(`Found ${events.length} events`);
    return events.map((event) => ({
      ...event,
      date: event.date.toISOString(),
      endDate: event.endDate.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching events", error);
    return [];
  }
}

export async function fetchEventById(eventId) {
  try {
    console.log("Fetching event by ID:", eventId);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return null;
    }
    // console.log("Event found:", event);
    return {
      ...event,
      date: event.date.toISOString(),
      endDate: event.endDate.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return null;
  }
}

export async function updateEvent(form, userId) {
  const {
    id,
    title,
    description,
    date,
    endDate,
    location,
    image,
    category,
    organizer,
    attendees,
    maxAttendees,
    price,
    isOnline,
    tags,
  } = form;

  try {
    // Verify event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: id },
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    // TODO: Add proper authorization once Event model has creatorId field
    // For now, require userId to be passed (will be validated when schema is updated)
    if (!userId) {
      return { success: false, error: "Unauthorized - user ID required" };
    }

    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: {
        title: title,
        description: description,
        date: new Date(date),
        endDate: new Date(endDate),
        location: location,
        image: image,
        category: category,
        organizer: organizer,
        attendees: attendees,
        maxAttendees: maxAttendees,
        price: price,
        isOnline: isOnline,
        tags: tags,
      },
    });

    return { success: true, event: updatedEvent };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function getUpcomingEvents() {
  try {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        // date: {
        //   gte: now, // only future events
        // },
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        date: true,
        endDate: true,
        location: true,
        image: true,
        category: true,
        isOnline: true,
        attendees: true,
        maxAttendees: true,
        price: true,
      },
    });

    return { data: events, error: null };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { data: null, error: "Failed to fetch events" };
  }
}
