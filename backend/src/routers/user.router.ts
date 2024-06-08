import { Router } from "express";
import { sample_users } from "../data";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User, UserModel } from "../models/user.model";
import { HTTP_BAD_REQUEST } from "../constans/http_status";
import bcrypt from 'bcryptjs';

const router = Router();

router.get(
  "/seed",
  asyncHandler(async (req, res) => {
    const usersCount = await UserModel.countDocuments();
    if (usersCount > 0) {
      res.send("Seed is already done!");
      return;
    }

    await UserModel.create(sample_users);
    res.send("Seed Is Done!");
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({email,password});
    if (user) {
      res.send(generatedTokenResponse(user));
    } else {
      res.status(400).send("El nombre o contraseña son invalidos.");
    }
  })
);

router.post('/register', asyncHandler(
    async (req, res) => {
      const {name, email, password, address} = req.body;
      const user = await UserModel.findOne({email});
      if(user){
        res.status(HTTP_BAD_REQUEST)
        .send('User is already exist, please login!');
        return;
      }
  
      const encryptedPassword = await bcrypt.hash(password, 10);
  
      const newUser:User = {
        id:'',
        name,
        email: email.toLowerCase(),
        password: encryptedPassword,
        address,
        isAdmin: false
      }
  
      const dbUser = await UserModel.create(newUser);
      res.send(generatedTokenResponse(dbUser));
    }
  ))

const generatedTokenResponse = (user: any) => {
  const token = jwt.sign(
    {
      email: user.email,
      isAdmin: user.isAdmin,
    },
    "algoxd",
    {
      expiresIn: "30d",
    }
  );

  user.token = token;
  return user;
};

export default router;
