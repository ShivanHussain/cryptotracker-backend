import jwt from "jsonwebtoken";
import User from "../models/user.js"; 
import catchAsync from "./catchAsync.js";

export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "User Not Authenticated"
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
});

// Optional authentication (user can be logged in or not)
// This middleware allows access to routes even if the user is not authenticated
// It will attach the user to the request object if a valid token is provided
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      console.error("Invalid token:", error.message);
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
  }

  next();
});