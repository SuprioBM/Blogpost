import axios from "axios";
import Cookies from "js-cookie";



const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Backend URL
  withCredentials: true,
});

const refreshTokens = async() =>{

  try{
    const response = await api.post('/refresh',{
      credentials:"include"  })
  } catch(error){
    console.error("Failed to refresh token:", error);
    Cookies.remove("user")
    return null
  }
}



export { api, refreshTokens };