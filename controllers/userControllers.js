import userModel from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const creatToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}



const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;        
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success: false, message: "User already exists"});
        }

     
        if(password.length < 8){
            return res.json({success: false, message: "please enter a strong password"});
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save();
        

        res.json({success:true , user})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;



    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

  

    const normalizedEmail = email.trim().toLowerCase();



    const user = await userModel.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

   

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    const token = creatToken(user._id);



    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    
    const token = jwt.sign(
      {
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "Admin Login Successful",
      token,
    });
  } catch (error) {
    console.log("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export { loginUser, registerUser, adminLogin};