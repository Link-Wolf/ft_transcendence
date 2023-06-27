import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = `ws://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}`;
const socket = io(URL);

export default socket;
