import express from "express";
import {prisma} from '../utils/prisma/index.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();


// 1. 회원가입 API
router.post('/sign-up', async(req, res, next)=>{
    const {nickname, password, userType} = req.body;
    if(!nickname || !password) return res.status(400).json({errorMessage : '데이터 형식이 올바르지 않습니다'});
    //  닉네임 형식 일치 않는 경우 에러if 추가
    // 비밀번호 형식 일치 않는 경우 400 에러 
    const userNickname = await prisma.users.findFirst({
        where : {nickname}
    });
    // 중복된 닉네임으로 회원가입시도
    if(userNickname)return res.status(409).json({message : '중복된 닉네임입니다'});

const hashedPassword =  await bcrypt.hash(password, 10);
await prisma.users.create({
    data : {
        nickname,
        password : hashedPassword,
        userType // 사용자 타입 저장
    }
});

    return res.status(201).json({message : '회원가입이 완료되었습니다'})
});


// 2. 로그인 API
router.post('/sign-in', async(req, res, next)=>{
    const {nickname, password} = req.body;
    if(!nickname || !password) return res.status(400).json({errorMessage : '데이터 형식이 올바르지 않습니다'});

// 존재하지 않는 닉네임일 경우 
const user = await prisma.users.findFirst({
    where : {nickname}
});
if(!user) return res.status(401).json({message : '존재하지 않는 닉네임입니다.'});


// 비정상적인 비밀번호로 시도할 경우 
if (!(await bcrypt.compare(password, user.password)))
return res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });

    // 로그인에 성공한다면 jwt 토큰 발급
    const role = user.userType === 'OWNER' ? 'OWNER' : 'CUSTOMER'; // 사용자의 역할에 따라 역할 정보 설정

    const token = jwt.sign({ id: user.id, role }, "custom-secret-key");

    // 클라이언트에게 토큰을 쿠키로 전송
    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({message :'로그인에 성공하였습니다'})
});
// 3. 카테고리 등록 API
router.post('/categories', authMiddleware, async(req, res, next)=>{
    const {name} = req.body;
    const { role } = req.user; // 사용자의 역할 정보

    if(!name) return res.status(400).json({message : '데이터 형식이 올바르지 않습니다.'});
    
    // 만약 사용자의 역할이 사장님(OWNER)이 아니면 권한이 없음을 알림
    if (role !== 'OWNER') {
        return res.status(403).json({ message: '카테고리를 등록할 권한이 없습니다.' });
    }

    // 카테고리 순서를 정의하기 위해 현재 카테고리 개수를 가져옴
    const categoryCount = await prisma.categories.count();

    await prisma.categories.create({
        data : {
            name,
            // 새로운 카테고리의 순서를 현재 카테고리 개수보다 1 큰 값으로 설정
            order: categoryCount + 1
        }
    });
    
    return res.status(201).json({message : '카테고리를 등록하였습니다.'});
});


export default router;


