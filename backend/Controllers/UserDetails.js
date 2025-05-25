const { User,UserInfo } = require("../Models/schema");
const Cloudinary = require('../cloudinary/Cloudinary');
var Buffer = require("buffer/").Buffer;
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const UpdateDetails = async (req, res) => {
  const { username, about, skills, exps, edus} = req.body;
  console.log(username)
  console.log(about)
  const skill = JSON.parse(skills)
  const exp = JSON.parse(exps)
  const edu = JSON.parse(edus)
  const imgFile = req.file
  let img;
  try {    

    const client = await User.findOne({ username });


    const buffer = imgFile.buffer;
     
    const uploadResponse = await new Promise((resolve, reject) => {
        const stream = Cloudinary.uploader.upload_stream(
          {
            folder: "Blog/Profile_Pictures",
            upload_preset: "Blog_Profile_Images",
            resource_type: "auto",
            public_id: `${client._id}_profile`,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return reject(error);
            }
            resolve(result);
          }
        );
        stream.end(buffer);
      });

     img = uploadResponse.secure_url;
     console.log(img)
  
  } catch (error) {
    return reject(error);
  }

  try {
    if (!username) {
      return res
        .status(400)
        .json({ message: "Username are required" });
    }

    const user = await UserInfo.findOne({ username });

    if (!user) {
      const newUser = new UserInfo({
        username,
        about,
        skill,
        exp,
        edu,
        img, 
      });
      await newUser.save();
      return res.status(201).json({message: "User Details Created Successfully" });
    } else {
      // If the user exists, update the user details
      user.about = about || user.about;
      user.skill = skill || user.skill;
      user.exp = exp || user.exp;
      user.edu = edu || user.edu;
      user.img = img || user.img;

      await user.save();
      return res
        .status(200)
        .json({ message: "User Details Updated Successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};


const getUserDetails = async(req,res) =>{
    const username = req.cookies.user;
    if (!username) return res.status(401).json({ error: "No User Found" });
    try {
        const userdata = await UserInfo.findOne({ username });
        if(userdata){
          res.status(200).json({exists: true, userdata})
        }
        else{
          return res.status(404).json({ exists: false });
        }
    } catch (error) {
       return res.status(500).json({ message: "Server Error" });

    }
      
    

    
}


const getProfileImage = async(req,res) =>{
  const {username} = req.params;
  try {
    const user = await UserInfo.findOne({username});
    if(user){
      res.status(200).json({exists: true, img: user.img})
    }
    else{
      return res.status(404).json({ exists: false });
    }
}
catch (error) {
   return res.status(500).json({ message: "Server Error" });

}
}



module.exports = {UpdateDetails, getUserDetails,getProfileImage};
