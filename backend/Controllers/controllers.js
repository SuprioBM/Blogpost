const { User } = require("../Models/schema");
const bcrypt= require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

//SignUp
const SignUp = async(req,res) =>{
    const {username, password} = req.body;
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt);
    

    try {
        const user = await User.findOne({username});
        if(!user){
            const user = new User({username, password: hash});
            await user.save();
            res.status(201).json({message: "User Successfully Registered"})
        }
        else{
            res.status(400).json({message: "User Already Exists"})
        }
        
    } catch (error) {

        res.status(500).json({message: "Server Error"});

    }
}

//SignIn
const SignIn = async(req,res) =>{
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      // Generate Access Token
      const accessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { username: user.username },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        }
      );

      // Save Refresh Token in MongoDB
      user.tokens = refreshToken;
      await user.save();

      // Store Tokens in Cookies
      res.cookie("accessToken", accessToken, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({userid: user._id, message: "Logged in successfully" });
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Server Error" });
    }
}

//SignOut
const SignOut = async(req,res) =>{

    const user = await User.findOne({ tokens: req.cookies.refreshToken });
    if (user) {
      user.tokens = null;
      await user.save();
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });

}


//RefreshToken

const RefreshToken = async(req,res) =>{

    const refreshToken = req.cookies.refreshToken;
     if (!refreshToken) return res.status(401).json({ error: "Access Denied" });

     const user = await User.findOne({tokens: refreshToken });
     if (!user) return res.status(403).json({ error: "Invalid Refresh Token" });

     try {
       const verified = jwt.verify(
         refreshToken,
         process.env.JWT_REFRESH_SECRET
       );
       if(!verified) return res.status(404).json({error: "Refresh Token Expired" })
       const newAccessToken = jwt.sign(
         { username: verified.username },
         process.env.JWT_SECRET,
         {
           expiresIn: process.env.JWT_EXPIRES_IN,
         }
       );

       res.cookie("accessToken", newAccessToken, {
         path: '/',
         httpOnly: true,
         secure: true,
         SameSite: "None",
         maxAge: 15 * 60 * 1000,
       });

       res.status(200).json({ message: "Access Token Refreshed" });
     } catch (err) {
         if (err.name === "TokenExpiredError") {
           return res.status(403).json({ error: "Refresh Token Expired" });
         }
       res.status(403).json({ error: "Refresh Token Failed" });
     }
}


const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid Token" });
  }
};




module.exports = {SignUp,SignIn,SignOut,RefreshToken, authenticateToken}