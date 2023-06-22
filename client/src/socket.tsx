import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "ws://k0r2p10:4242"; // TODO: better env var

const socket = io(URL);

export default socket;
