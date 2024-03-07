import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

export default async function (req, res, next) {
    try {
        // 1. 클라이언트로부터 쿠키를 전달받는다
        const { authorization } = req.cookies;
        // 쿠키가 존재하지 않으면, 인증된 사용자가 아님
        if (!authorization)
            throw new Error('로그인이 필요한 서비스입니다');
        // 2. 쿠키가 Bearer 형식인지 확인
        const [tokenType, token] = authorization.split(" ");
        // 만약 토큰 타입이 Bearer가 아닐때 오류
        if (tokenType !== 'Bearer')
            throw new Error('토큰 타입이 Bearer 형식이 아닙니다');

        let decodedToken;
        try {
            // JWT를 사용하여 서버에서 발급한 토큰이 유효한지 검증
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            // 토큰이 만료된 경우
            if (error.name === "TokenExpiredError") {
                // 리프레시 토큰 검증
                const refreshToken = req.cookies.refreshToken;
                const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

                // 새로운 액세스 토큰 발급
                const newAccessToken = jwt.sign({ id: decodedRefreshToken.id, role: decodedRefreshToken.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

                // 클라이언트에게 새로운 액세스 토큰을 전달
                res.cookie('authorization', `Bearer ${newAccessToken}`);
                return next(); // 다음 미들웨어로 진행
            } else {
                throw error; // 다른 JWT 에러는 그대로 throw
            }
        }

        // JWT의 userId를 사용하여 사용자 조회
        const userId = decodedToken.id;
        const user = await prisma.users.findUnique({
            where: { id: +userId }
        });

        // 사용자가 존재하지 않으면 에러
        if (!user) throw new Error('토큰 사용자가 존재하지 않습니다');

        // req.user에 조회된 사용자 정보 할당
        req.user = user;

        // 토큰에 있는 역할 정보를 가져옴
        const role = decodedToken.role;

        // req.user에 역할 정보 할당
        req.user.role = role;
        next();

    } catch (error) {
        next(error); 
    }
}