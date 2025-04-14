"use client";

import React, { useState } from "react";
import ButtomNav from "@components/ButtomNav"; // Assuming you have this
import Link from "next/link";
import Image from "next/image";

const media = [
  {
    type: "image",
    src: "/images/image.png",
    title: "Navigate Your Campus in 3D",
  },
  {
    type: "image",
    src: "/images/marketplace.png",
    title: "Explore the Student Marketplace",
  },
  {
    type: "video",
    src: "/media/social.mp4",
    title: "Stay Social & Connected",
  },
];

const page = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % media.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const current = media[activeIndex];

  return (
    <div className="p-3 mb-14 home-bg">
      {/* Hero Content */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Image src={"/icons/logo.png"} width={20} height={20} alt="logo" />
          <h6 className="text-primary text-lg font-bold">FUTO-VERSE</h6>
        </div>

        <Link
          href={"/login"}
          className="bg-primary text-white  px-3 font-semibold rounded-3xl w-fit"
        >
          Login
        </Link>
      </div>
      <div className="flex flex-col gap-3 items-center justify-center mt-10">
        <h6 className="font-bold text-2xl text-center text-black">
          Reshaping the Future of FUTO Campus Navigation and Business Promotion
        </h6>
        <p className="text-slate-500 text-center">
          A 3D Experience for Campus Navigation, Student Commerce & Social
          Connection.
        </p>
        <div className="flex gap-3 mt-3">
          <button className="bg-primary text-white py-2 px-3 font-semibold rounded-3xl">
            Launch the App
          </button>
          <button className="bg-transparent text-black border border-black py-2 px-3 font-semibold rounded-3xl">
            Sign Up
          </button>
        </div>
      </div>

      {/* Media Carousel */}
      <div className="mt-5 flex flex-col items-center justify-center">
        <div className="relative  max-w-md h-96 w-72 rounded-xl overflow-hidden bg-black shadow-lg">
          {current.type === "video" ? (
            <video
              src={current.src}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={current.src}
              alt={current.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-2 left-2 bg-white/80 px-3 py-1 text-sm font-semibold rounded">
            {current.title}
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={goPrev}
            className="bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded-full font-semibold"
          >
            ◀ Prev
          </button>
          <button
            onClick={goNext}
            className="bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded-full font-semibold"
          >
            Next ▶
          </button>
        </div>
      </div>

      <div className="">
        <div className="relative  max-w-md h-60 w-full rounded-xl overflow-hidden bg-black shadow-lg mt-10">
          <video
            src={"current.src"}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-white/80 px-3 py-1 text-sm font-semibold rounded">
            Video For Navigation Feature
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <h5 className="font-bold ">Navigate Your Campus in 3D</h5>
          <p className="text-slate-500">
            No more 'asking around'. Explore buildings, find your next class,
            and discover hidden spots in stunning 3D Space.
          </p>
          <Link
            href={"/map"}
            className="bg-primary text-white py-2 px-3 font-semibold rounded-3xl w-fit"
          >
            View Map
          </Link>
        </div>
      </div>

      <div className="">
        <div className="relative  max-w-md h-60 w-full rounded-xl overflow-hidden bg-black shadow-lg mt-10">
          <video
            src={"current.src"}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-white/80 px-3 py-1 text-sm font-semibold rounded">
            Your Campus Marketplace, Reimagined
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <h5 className="font-bold ">Navigate Your Campus in 3D</h5>
          <p className="text-slate-500">
            Pitch your virtual shop, browse student-made products, and support
            local campus businesses — all in an immersive 3D environment.
          </p>
          <Link
            href={"/map"}
            className="bg-primary text-white py-2 px-3 font-semibold rounded-3xl w-fit"
          >
            Explore the Marketplace
          </Link>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center gap-2 w-full bg-slate-200 p-4 mt-20 rounded-lg">
        <h5 className="text-2xl font-bold text-center">
          Ready to Experience Your Campus like Never Before ?
        </h5>
        <p className="text-slate-600 text-center">
          Create and account or Join the Moving Community
        </p>
        {/* <button className="bg-primary text-white py-2 px-3 font-semibold text-sm rounded-3xl w-fit">
          Sign up for free
        </button> */}
        <Link
          href={"https://chat.whatsapp.com/DyXwnogPabiLaUwgaT8L22"}
          className="bg-primary border border-white text-white py-2 px-3 font-semibold rounded-3xl w-fit"
        >
          Join our out Whatsapp Community
        </Link>
      </div>

      <hr className="my-5" />

      <div className="font-bold text-lg">
        <div className="flex gap-2 items-center">
          <Image src={"/icons/logo.png"} width={20} height={20} alt="logo" />
          <h6 className="text-primary">FUTO-VERSE</h6>
        </div>

        <div className="flex flex-col gap-1">
          <Link href={"/sign-up"} className="text-slate-500">
            Sign Up
          </Link>
          <Link href={"https://wa.me/2348163810804"} className="text-slate-500">
            Contact Us
          </Link>
          <Link href={"https://wa.me/2348163810804"} className="text-slate-500">
            Join our Team
          </Link>
          {/* <Link href={"/sign-up"} className="text-slate-500">
            Sign Up
          </Link> */}
        </div>
      </div>

      {/* <div className="bg-slate-300 text-slate-600">
        Built by students, for students.
      </div> */}
    </div>
  );
};

export default page;
