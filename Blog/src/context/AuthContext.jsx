import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Cookies from 'js-cookie';

// Create a Context for Authentication
const AuthContext = createContext();

// AuthProvider to wrap around your app and share the authentication state
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);




  // Login function to set the user
  const signin = (username) => {
    setUser(username);
    Cookies.set("user", username, {
      secure: true,
      sameSite: "None", // or "None" if cross-origin
    });
  };

  

  useEffect(()=>{
    const storedUser = Cookies.get("user")
    if(storedUser){
      setUser(storedUser)
    }

  },[])

  // Login function to set the user
  // Logout function to clear the user state
  const signout = () => {
    setUser(null); // Clear user when logged out
    Cookies.remove("user");
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout}}>
      {children}
    </AuthContext.Provider>
  );
}

// PropTypes declaration moved here
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext, AuthProvider };