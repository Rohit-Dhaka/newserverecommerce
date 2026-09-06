
import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    const token_decode = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    
    if (token_decode.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Admin Access Required",
      });
    }

    
    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    next();
  } catch (error) {
    console.log("ADMIN AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Admin Token",
    });
  }
};

export default adminAuth;
