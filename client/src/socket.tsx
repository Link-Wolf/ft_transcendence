import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = `${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}`;
const socket = io(URL);

export default socket;

// import { io } from "socket.io-client";

// // "undefined" means the URL will be computed from the `window.location` object
// const URL = "http://k1r2p9:4242";
// const socket = io(URL);

// export default socket;
