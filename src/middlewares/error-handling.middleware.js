export default function errorHandlingMiddleware(err, req, res, next) {
    console.error(err);

    if (err.name === 'InvalidNicknameFormatError') {
        res.status(400).json({ message: '닉네임 형식이 올바르지 않습니다.'}); 
    }else if (err.name === 'InvalidPasswordFormatError') {
        res.status(400).json({ message: '비밀번호 형식이 올바르지 않습니다.'}); 
    }else if (err.name === 'DuplicatedNicknameError') {
        res.status(409).json({message : '중복된 닉네임입니다'});
    }else if (err.name === 'NotFoundNicknameError') {
        res.status(401).json({message : '존재하지 않는 닉네임입니다.'});
    }else if (err.name === 'InvalidPasswordError') {
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
    }else if (err.name === 'InvalidDataFormatError') {
        res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.'}); 
    } else if (err.name === 'NotOwnerError') {
        res.status(403).json({ message: '사장님만 사용할 수 있는 API입니다' });
    } else if (err.name === 'CategoryNotFoundError') {
        res.status(404).json({ message: '존재하지 않는 카테고리입니다' });
    } else if (err.name === 'InvalidMenuPriceError') {
        res.status(400).json({ message: '메뉴 가격은 0보다 작을 수 없습니다' });
    } else if (err.name === 'MenuNotFoundError') {
        res.status(404).json({ message: '존재하지 않는 메뉴입니다' });
    } else if (err.name === 'TokenExpiredError') {
        res.status(400).json({ message: '토큰이 만료되었습니다' });
    } else if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ message: '토큰이 조작되었습니다' });
    } else {
        res.status(500).json({ message: '서버 내부에서 에러가 발생했습니다' });
    }
}