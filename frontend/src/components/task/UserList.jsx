import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import clsx from "clsx";
import { getInitials } from "../../utils";
import { MdCheck } from "react-icons/md";
import api from "../../utils/api";

/**
 * UserList
 *
 * Props:
 *  - setTeam: (ids: string[]) => void   — called whenever selection changes
 *  - team:    string[]                  — currently assigned user IDs
 *
 * In CREATE mode: team is []  → no pre-selection
 * In EDIT mode:   team is string[] of IDs → pre-selects the matching users
 */
const UserList = ({ setTeam, team = [] }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  // When users load OR team IDs change, sync the selected list
  useEffect(() => {
    if (users.length === 0) return;
    if (team.length === 0) {
      setSelectedUsers([]);
      return;
    }
    // team can be: string[] of IDs  OR  object[] (user objects from edit task)
    const ids = team.map((t) => (typeof t === "object" ? t._id : t));
    const matched = users.filter((u) => ids.includes(u._id));
    setSelectedUsers(matched);
  }, [users, team]);

  const handleChange = (selected) => {
    setSelectedUsers(selected);
    setTeam(selected.map((u) => u._id));
  };

  return (
    <div>
      <p className="text-gray-700 text-sm font-medium mb-1">Assign Task To:</p>
      <Listbox value={selectedUsers} onChange={handleChange} multiple>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded bg-white pl-3 pr-10 text-left py-2.5 border border-gray-300 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <span className="block truncate text-gray-700">
              {selectedUsers.length > 0
                ? selectedUsers.map((u) => u.username || u.name).join(", ")
                : "Select team members..."}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <BsChevronExpand className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {users.length === 0 ? (
                <li className="py-3 px-4 text-gray-400 text-sm">
                  Loading users...
                </li>
              ) : (
                users.map((user) => (
                  <Listbox.Option
                    key={user._id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-blue-50 text-blue-900" : "text-gray-900"
                      }`
                    }
                    value={user}
                  >
                    {({ selected }) => (
                      <>
                        <div
                          className={clsx(
                            "flex items-center gap-2 truncate",
                            selected ? "font-semibold" : "font-normal"
                          )}
                        >
                          <div className="w-6 h-6 rounded-full text-white flex items-center justify-center bg-violet-600 shrink-0">
                            <span className="text-center text-[10px]">
                              {getInitials(user.username || user.name)}
                            </span>
                          </div>
                          <span>{user.username || user.name}</span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <MdCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {selectedUsers.length > 0 && (
        <p className="text-xs text-gray-400 mt-1">
          {selectedUsers.length} member{selectedUsers.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};

export default UserList;
