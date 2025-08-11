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
      orderBy: { date: "asc" },
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
    console.log("Event found:", event);
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

export async function updateEvent(form) {
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
    console.log("Updating event with ID:", form);
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
        tags: tags, // Prisma handles string[]
      },
    });

    console.log("Event updated successfully:", updatedEvent);
    return true;
  } catch (error) {
    console.error("Error updating event", error);
    return false;
  }
}
