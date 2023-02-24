import io from "socket.io-client"; // Add this
import { BASE_URL } from "./config";

let socket = io(BASE_URL, {
  query: `user_id=${window.localStorage.getItem("user_id")}`,
}); // Add this -- our server will run on port 4000, so we connect to it from here

export default socket;
