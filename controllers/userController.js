import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


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
                        const token = jwt.sign({ userID: newUser._id }, process.env.JWT_SECRET, { expiresIn: "5D" });
                        return res.status(201).json({ message: "User created successfully", token: token });
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
}

export default UserController;