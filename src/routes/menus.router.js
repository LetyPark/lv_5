import express from "express";
import {prisma} from '../utils/prisma/index.js'
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();


// 1. 메뉴 등록 
router.post("/categories/:categoryId/menus", authMiddleware, async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, description, image, price } = req.body;
  const {role} =req.user;

  try{
  if (!categoryId || !name || !description || !image || !price)
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });

    
    // 로그인 되어있지 않은 경우 >>auth.middleware.js 에서 이미 처리 

    // 만약 사용자의 역할이 사장님(OWNER)이 아니면 권한이 없음을 알림
    if (role !== 'OWNER') {
        return res.status(403).json({message: '사장님만 사용할 수 있는 API입니다'});
    }

  const category = await prisma.categories.findFirst({
    where: { id: +categoryId },
  });
  if (!category)
    return res.status(404).json({ message: "존재하지 않는 카테고리 입니다" });
  if (price < 0)
    return res
      .status(400)
      .json({ message: "메뉴 가격은 0보다 작을수 없습니다" });

  await prisma.menus.create({
    data: {
      name,
      description,
      image,
      price,
      order: (await prisma.menus.count()) + 1,
      categoryId: +categoryId,
    },
  });
  return res.status(201).json({ message: "메뉴를 등록하였습니다." });
} catch (error) {
    // 사용자 인증 미들웨어로 에러 전달
    return next(error);
}
});

// 카테고리별 메뉴 조회
router.get("/categories/:categoryId/menus", async (req, res, next) => {
  const { categoryId } = req.params;
  try{
  if (!categoryId)
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });

  const category = await prisma.categories.findFirst({
    where: { id: +categoryId },
  });
  if (!category)
    return res.status(404).json({ message: "존재하지 않는 카테고리입니다" });

  const menus = await prisma.menus.findMany({
    where: { categoryId: +categoryId },
    select: {
      id: true,
      name: true,
      image: true,
      price: true,
      order: true,
      status: true,
    },
    orderBy: { order: "asc" },
  });
  return res.status(200).json({ data: menus });
} catch (error) {
    // 사용자 인증 미들웨어로 에러 전달
    return next(error);
}
});

// 메뉴 상세 조회 api
router.get("/categories/:categoryId/menus/:menuId", async (req, res, next) => {
    try{
  const { categoryId, menuId } = req.params;
  if (!categoryId || !menuId)
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
  const category = await prisma.menus.findFirst({
    where: { categoryId: +categoryId },
  });
  if (!category)
    return res.status(404).json({ message: "존재하지 않는 카테고리입니다" });

  const menu = await prisma.menus.findFirst({
    where: {
      categoryId: +categoryId,
      id: +menuId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      price: true,
      order: true,
      status: true,
    },
  });
  return res.status(200).json({ data: menu });
} catch (error) {
    // 사용자 인증 미들웨어로 에러 전달
    return next(error);
}
});

// 메뉴 수정
router.patch(
  "/categories/:categoryId/menus/:menuId", authMiddleware, async (req, res, next) => {
    const { categoryId, menuId } = req.params;
    const { name, description, price, order, status } = req.body;
    const {role} = req.user;

    try{
    if (
      !categoryId ||
      !menuId ||
      !name ||
      !description ||
      !price ||
      !order ||
      !status
    )
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    
    // 로그인 되어있지 않은 경우 >>auth.middleware.js 에서 이미 처리 

    // 만약 사용자의 역할이 사장님(OWNER)이 아니면 권한이 없음을 알림
    if (role !== 'OWNER') {
        return res.status(403).json({message: '사장님만 사용할 수 있는 API입니다'});
    }

    
        const category = await prisma.menus.findFirst({
      where: { categoryId: +categoryId },
    });
    if (!category)
      return res.status(404).json({ message: "존재하지 않는 카테고리입니다" });

    const menu = await prisma.menus.findFirst({
      where: { id: +menuId },
    });
    if (!menu)
      return res.status(404).json({ message: "존재하지 않는 메뉴입니다" });

    if (price < 0)
      return res
        .status(400)
        .json({ message: "메뉴 가격은 0보다 작을수 없습니다" });
    await prisma.menus.update({
      where: { id: +menuId, categoryId: +categoryId },
      data: {
        name,
        description,
        price,
        order,
        status,
      },
    });
    return res.status(200).json({ message: "메뉴를 수정하였습니다" });
} catch (error) {
    // 사용자 인증 미들웨어로 에러 전달
    return next(error);
}
});

// 메뉴 삭제
router.delete(
  "/categories/:categoryId/menus/:menuId",
authMiddleware, async (req, res, next) => {
    const { categoryId, menuId } = req.params;
    const {role} = req.user;

    try {
    if (!categoryId || !menuId)
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });

    // 로그인 되어있지 않은 경우 >>auth.middleware.js 에서 이미 처리 

    // 만약 사용자의 역할이 사장님(OWNER)이 아니면 권한이 없음을 알림
    if (role !== 'OWNER') {
        return res.status(403).json({message: '사장님만 사용할 수 있는 API입니다'});
    }

    const category = await prisma.menus.findFirst({
      where: { categoryId: +categoryId },
    });
    if (!category)
      return res.status(404).json({ message: "존재하지 않는 카테고리입니다" });

    const menu = await prisma.menus.findFirst({
      where: { id: +menuId },
    });
    if (!menu)
      return res.status(404).json({ message: "존재하지 않는 메뉴입니다" });
    await prisma.menus.delete({
      where: { id: +menuId, categoryId: +categoryId },
    });
    return res.status(200).json({ message: "메뉴를 삭제하였습니다" });
} catch (error) {
    // 사용자 인증 미들웨어로 에러 전달
    return next(error);
}
});

export default router;
