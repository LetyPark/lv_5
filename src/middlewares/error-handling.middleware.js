import CustomError from "../utils/customError.js";
const errorMessages = {
    'Invalid Nickname Format': '닉네임 형식이 올바르지 않습니다.',
    'Invalid Password Format' :'비밀번호 형식이 올바르지 않습니다.',
    'Duplicated Nickname' : '중복된 닉네임입니다',
    'Not Found Nickname' : '존재하지 않는 닉네임입니다.',
    'Invalid Password' :  '비밀번호가 일치하지 않습니다' ,
    'Invalid Data Format': '데이터 형식이 올바르지 않습니다.',
    'Not Owner': '사장님만 사용할 수 있는 API입니다' ,
    'Not Customer' : '소비자만 사용할 수 있는 API입니다' ,
    'Category Not Found': '존재하지 않는 카테고리입니다' ,
    'Order Not Found' : '존재하지 않는 주문 내역입니다',
    'Invalid Menu Price': '메뉴 가격은 0보다 작을 수 없습니다' ,
    'Menu Not Found':  '존재하지 않는 메뉴입니다',
    'Token Expired': '토큰이 만료되었습니다',
    'Json Web Token': '토큰이 조작되었습니다' ,
};

export default function errorHandlingMiddleware(err, req, res, next) {
    console.error(err);

    const status = err instanceof CustomError ? err.status : 500;
    const message = err.message || errorMessages[err.name] || '서버 내부에서 에러가 발생했습니다';

    res.status(status).json({ error: message });
}