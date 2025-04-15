"use client";
import { departments } from "@constants/arrays";
import { fetchAllUsersForListing } from "@lib/actions/user.prisma";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";

const levels = ["100", "200", "300", "400", "500"];

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [users, setUsers] = useState([]);
  const [errorMessage, seterrorMessage] = useState("");

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearchTerm =
      (user.name &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      !selectedDepartment || user.department?.name === selectedDepartment;

    const matchesLevel = !selectedLevel || user.level?.name === selectedLevel;

    return matchesSearchTerm && matchesDepartment && matchesLevel;
  });

  useEffect(() => {
    const fetchALlUsers = async () => {
      try {
        const users = await fetchAllUsersForListing();
        console.log("Userssss", users);
        setUsers(users);
      } catch (error) {
        seterrorMessage("Error fetching Users");
        console.log("Error");
      }
    };

    fetchALlUsers();
    console.log("Users ---->", users);
  }, []);

  return (
    <div className="p-3 mb-14">
      <div className="flex gap-2 mb-3">
        <div className="flex gap-1 items-center border">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-1 text-sm"
          >
            <option value="">Department</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1 items-center border">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-1 text-sm"
          >
            <option value="">Level</option>
            {levels.map((level, index) => (
              <option key={index} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center bg-slate-200 rounded-2xl w-full p-1 px-3 mb-4">
        <input
          type="text"
          placeholder="Search Users"
          className="outline-none w-full bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FiSearch className="font-bold text-xl" />
      </div>

      <h5 className="font-semibold text-2xl mb-4">Users </h5>

      <div className="flex flex-col gap-3">
        {filteredUsers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredUsers.map((user) => (
              <Link
                href={`/profile/${user.username}`}
                key={user.id}
                className="flex items-center gap-1 hover:bg-slate-100 focus:bg-slate-50 cursor-pointer"
              >
                <div className="w-20 h-20">
                  <Image
                    src={
                      user.picture ||
                      "https://randomuser.me/api/portraits/men/1.jpg"
                    }
                    alt="Profile Picture"
                    width={50}
                    height={50}
                    className="rounded-full w-16 h-16 object-cover"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <h5>{user.name}</h5>
                  <h5 className="text-slate-400 text-sm">@{user.username}</h5>
                  <h6 className="text-slate-500">
                    {user.department && user.department?.initial}{" "}
                    {user.level && `${user.level.name}lvl`}
                  </h6>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-12 text-center text-slate-500">
            <Image
              src="/assets/search.svg" // Replace with your own image or illustration path
              alt="No users found"
              width={180}
              height={180}
              className="mb-4"
            />
            <h4 className="font-semibold text-lg">No user found</h4>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your filters or search again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
