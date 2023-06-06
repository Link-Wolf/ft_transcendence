import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div>
            <h1>Home</h1>
            <p>Home page body content</p>
            <Link to="/profile">Profile</Link>
        </div>
    );
}

export default Home;        