import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";


class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, confirm_password, tc } = req.body;
        const user = await userModel.findOne({ email: email });
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        } else {

            if (name && email && password && confirm_password && tc) {
                if (password == confirm_password) {
                    try {
                        // const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(password, 10);
                        const newUser = new userModel({
                            name,
                            email,
                            password: hashedPassword,
                            tc: tc
                        });
                        await newUser.save();

                        //GENERATE TOKEN
                        // const token = jwt.sign({ userID: newUser._id }, process.env.JWT_SECRET, { expiresIn: "5D" });
                        return res.status(201).json({ message: "User created successfully" });
                    } catch (error) {
                        console.log('eroor', error);
                        res.status(500).json({ message: "unable to register" });
                    }
                    return res.status(400).json({ message: "Passwords do not match" });
                } else {
                    return res.status(400).json({ message: "Passwords do not match" });
                }
            } else {
                return res.status(400).json({ message: "All fields are required" });
            }

        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await userModel.findOne({ email: email });
                if (user) {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if ((user.email === email) && isMatch) {
                        //GENERATE TOKEN
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: "5D" });
                        return res.status(200).json({ message: "Login successful", token: token });
                    } else {
                        return res.status(400).json({ message: "Invalid credentials" });
                    }

                } else {
                    return res.status(400).json({ message: "User does not exist" });
                }
            } else {
                return res.status(400).json({ message: "All fields are required" });
            }

        } catch (error) {

        }
    }

    static changeUserPassword = async (req, res) => {
        const { password, cofirmation_password } = req.body;
        if (password && cofirmation_password) {
            if (password !== cofirmation_password) {
                return res.status(400).json({ message: "New Password and Confirm Password don't match" });
            } else {
                const newHashPassword = await bcrypt.hash(password, 10);
                console.log("REQ USER DATA", req.user)
                await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } });
                return res.status(200).json({ message: "Password Change SuccessFully" });

            }
        } else {
            return res.status(400).json({ message: "All Field Are Required" });
        }
    }

    static loggedUser = async (req, res) => {
        res.status(200).json({ user: req.user });
    }

    static forgetPassword = async (req, res) => {
        const { email } = req.body;
        if (email) {
            try {
                const user = await userModel.findOne({ email: email });
                console.log("user", user);
                if (user) {
                    const secret = user._id + process.env.JWT_SECRET;
                    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
                    const link = `http://localhost:3000/api/user/resetpassword/${user._id}/${token}`;
                    console.log("LINK", link);

                    // SEND EMAIL
                    let info = await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: "Password Reset Link",
                        text: `Click on this link ${link} to reset your password`,
                    });
                    return res.status(200).json({ message: "Reset Password Link has been sent to your email", "info": info });

                } else {
                    return res.status(400).json({ message: "User does not exist" });
                }
            } catch (error) {
                console.error("Email sending error:", error);
                return res.status(500).json({ message: "Error sending email", error: error.message });
            }
        } else {
            return res.status(400).json({ message: "Email is required" });
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, confirmation_password } = req.body;
        const { id, token } = req.params;
        const user = await userModel.findById(id);
        try {
            const newSecret = user._id + process.env.JWT_SECRET;
            jwt.verify(token, newSecret);
            if (password && confirmation_password) {
                if (password !== confirmation_password) {
                    return res.status(400).json({ message: "Passwords do not match" })
                } else {
                    const newHashPassword = await bcrypt.hash(password, 10);
                    await userModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });
                    return res.status(200).json({ message: "Password Reset SuccessFully" });

                }
            } else {
                return res.status(400).json({ message: "All fields are required" });
            }
        } catch (error) {

        }
    }
}

export default UserController;