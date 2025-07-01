import User from "../models/user.js";
import Portfolio from "../models/portfolio.js";
import jwt from "jsonwebtoken";
import catchAsync from "../middlewares/catchAsync.js";
import cloudinary from "cloudinary";

// JWT token generation helper function
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });
};

// Function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user._id);

    // Cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };

    // Remove sensitive data from user object
    user.password = undefined;

    res.status(statusCode)
        .cookie("token", token, cookieOptions)
        .json({
            success: true,
            message,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.getFullName(),
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            }
        });
};

// Register new user
export const registerUser = catchAsync(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        if (existingUser.email === email) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        if (existingUser.username === username) {
            return res.status(400).json({
                success: false,
                message: "Username already taken"
            });
        }
    }

    // Validate profile picture upload
    if (!req.files || !req.files.profilePicture) {
        return res.status(400).json({
            success: false,
            message: "Profile picture is required"
        });
    }

    
    const profilePictureUpload = await cloudinary.uploader.upload(req.files.profilePicture.tempFilePath, {
        folder: "Profile_Pictures",
    });


    // Check if profile picture upload was successful
    if (!profilePictureUpload) {
        return res.status(500).json({
            success: false,
            message: "Failed to upload profile picture"
        });
    }

    const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        profilePicture: {
            public_id: profilePictureUpload.public_id,
            url: profilePictureUpload.secure_url
        }
    });

    // Create an empty portfolio for the user
    await Portfolio.create({
        user: user._id,
        assets: []
    });

    sendTokenResponse(user, 201, res, "User registered successfully");
});


// Login user
export const loginUser = catchAsync(async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email/username and password"
        });
    }

    // Find user by email or username
    const user = await User.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier }
        ]
    }).select("+password");

    // If user not found or password doesn't match
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: "Account is deactivated"
        });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, "Login successful");
});



// Logout user
export const logoutUser = (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

// Get current user profile
export const getCurrentUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.getFullName(),
            profilePicture: user.profilePicture,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        }
    });
});


// Update user profile
export const updateProfile = catchAsync(async (req, res) => {
  const updates = {};

  if (req.body.firstName) updates.firstName = req.body.firstName;
  if (req.body.lastName) updates.lastName = req.body.lastName;

  if (req.files && req.files.profilePicture) {
    
    //Get the current user to delete old image from cloudinary
    const currentUser = await User.findById(req.user.id);

    if (currentUser.profilePicture?.public_id) {
      await cloudinary.v2.uploader.destroy(currentUser.profilePicture.public_id);
    }

    const result = await cloudinary.v2.uploader.upload(req.files.profilePicture.tempFilePath, {
      folder: "Profile_Pictures",
    });


    updates.profilePicture = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicture: updatedUser.profilePicture,
    },
  });
});

// Change password
export const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Please provide current password and new password"
        });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
        return res.status(400).json({
            success: false,
            message: "Current password is incorrect"
        });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
});

