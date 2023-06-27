import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = `ws://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}`; // TODO: better env var

const socket = io(URL);

export default socket;
