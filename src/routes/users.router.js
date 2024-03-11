import express from "express";
import {prisma} from '../utils/prisma/index.js'
import CustomError from "../utils/customError.js";
import signUpSchema from "../utils/schemas/signupSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();


// 1. 회원가입 API
router.post('/sign-up', async(req, res, next)=>{
    try {
        const{error, value} = signUpSchema.validate(req.body,  { abortEarly: true });
        
        if (error) {
            // 닉네임과 비밀번호에 대한 오류 메시지 확인
            throw new CustomError('Invalid Data Format', 400); 
}

        // 유효성 검사를 통과한 데이터를 추출하여 사용
        const { nickname, password, userType } = value;
    
    if(!nickname || !password) {
        throw new CustomError('Invalid Data Format', 400); 
    }
    const userNickname = await prisma.users.findFirst({
        where : {nickname}
    });

    if(userNickname){
        throw new CustomError('Duplicated Nickname', 409); 
    }

const hashedPassword =  await bcrypt.hash(password, 10);
await prisma.users.create({
    data : {
        nickname,
        password : hashedPassword,
        userType // 사용자 타입 저장
    }
});
    return res.status(201).json({message : '회원가입이 완료되었습니다'})
} catch (error) {
    return next(error);
}
});

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET; 
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET; 


// 2. 로그인 API
router.post('/sign-in', async(req, res, next)=>{
try{
    const {nickname, password} = req.body;

    if(!nickname || !password) {
        throw new CustomError('Invalid Data Format', 400); 
    }

    const user = await prisma.users.findFirst({
    where : {nickname}
    });

    if(!user) {
        throw new CustomError('Not Found Nickname', 401); 
    }

// 비정상적인 비밀번호로 시도할 경우 
    if (!(await bcrypt.compare(password, user.password))){
        throw new CustomError('Invalid Password', 401); 
    }

    // 로그인에 성공한다면 jwt 토큰 발급
    const role = user.userType === 'OWNER' ? 'OWNER' : 'CUSTOMER'; // 사용자의 역할에 따라 역할 정보 설정
    
  // 액세스 토큰 발급
    const accessToken = jwt.sign({ id: user.id, role }, accessTokenSecret, { expiresIn: '50m' }); // 15분 유효시간
  // 리프레시 토큰 발급
    const refreshToken = jwt.sign({ id: user.id, role }, refreshTokenSecret, { expiresIn: '1d' }); // 7일 유효시간

  // 클라이언트에게 토큰을 쿠키로 전송
    res.cookie('authorization', `Bearer ${accessToken}`);
    res.cookie('refreshToken', `Bearer ${refreshToken}`);

    return res.status(200).json({ message: '로그인에 성공하였습니다' });
    } catch (error) {
    next(error);
}
});

export default router;


