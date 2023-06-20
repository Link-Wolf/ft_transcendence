import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = String(process.env.REACT_APP_BACKEND_URL);

const socket = io(URL);

export default socket;
