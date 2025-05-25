import './App.css';
import Navbar from './Components/Navbar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Routes/Home';
import Projects from './Routes/Projects';
import About from './Routes/About';
import SignUp from './Routes/SignUp';
import SignIn from './Routes/SignIn';
import Blog from './Routes/Blog';
import { AuthProvider } from './context/AuthContext';
import Footer from './Components/footer';
import Users from './Routes/Users';

function App() {

  return (
    <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/user" element={<Users />} />
      </Routes>
    <Footer/>
    </Router>
    </AuthProvider>
  );
}

export default App
