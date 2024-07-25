import jwt from 'jsonwebtoken';
import UserModel from "../models/User.js"

var checkUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            //GET TOKEN FROM HEADER
            token = authorization.split(' ')[1];

            //VERIFY TOKEN
            const { userID } = jwt.verify(token, process.env.JWT_SECRET);

            //GET USER FROM TOKEM
            req.user = await UserModel.findById(userID).select('-password');
            // console.log("req.user", req.user)

            next();

        } catch (error) {
            return res.status(401).json({ message: "Unauthorize User" });

        }
    }
    if (!token) {
        return res.status(401).json({ message: "Unauthorize User,No Token" });
    }
}

export default checkUserAuth;