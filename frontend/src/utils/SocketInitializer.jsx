import { useEffect } from "react";
import { useSelector } from "react-redux";
import socket from "@/utils/socket";

const SocketInitializer = () => {
  const userId = useSelector((state) => state.auth.user);
  console.log("user", userId)

  useEffect(() => {
    if (!userId) return;
    console.log(userId)

    console.log("📢 Joining user room:", userId);
    socket.emit("joinUserRoom", userId);

  }, [userId]);

  return null;
};

export default SocketInitializer;
