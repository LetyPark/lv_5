import express from "express";
import {prisma} from '../utils/prisma/index.js'
import { createCustomError } from "../utils/errorUtils.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. 메뉴 등록 API
router.post("/categories/:categoryId/menus", authMiddleware, async (req, res, next) => {
try{
  const { categoryId } = req.params;
  const { name, description, image, price } = req.body;
  const {role} =req.user;

    if (!categoryId || !name || !description || !image || !price){
      throw createCustomError('Invalid Data Format', 'InvalidDataFormatError');
  };

  if (role !== 'OWNER') {
    throw createCustomError('Not Owner','NotOwnerError');
};

  const category = await prisma.categories.findFirst({
    where: { id: +categoryId },
  });

  if (!category){
    throw createCustomError('Category Not Found','CategoryNotFoundError');
  };

  if (price < 0) {
    throw createCustomError('Invalid Menu Price','InvalidMenuPriceError');
};

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
    return next(error);
}
});

// 2. 카테고리별 메뉴 조회 API
router.get("/categories/:categoryId/menus", async (req, res, next) => {
try{
    const { categoryId } = req.params;

    if (!categoryId)
    throw new Error('InvalidDataFormatError');

  const category = await prisma.categories.findFirst({
    where: { id: +categoryId },
  });

  if (!category){
    throw createCustomError('Category Not Found', 'CategoryNotFoundError');
  }

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
    return next(error);
}
});

// 3. 메뉴 상세 조회 api
router.get("/categories/:categoryId/menus/:menuId", async (req, res, next) => {
try{
  const { categoryId, menuId } = req.params;
  if (!categoryId || !menuId) {
    throw createCustomError('Invalid Data Format', 'InvalidDataFormatError');
    }

  const category = await prisma.menus.findFirst({
    where: { categoryId: +categoryId },
  });
  
  if (!category){
    throw createCustomError('Category Not Found', 'CategoryNotFoundError');
  }

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

  if (!menu){
    throw createCustomError('Menu Not Found', 'MenuNotFoundError');
  }
  
  return res.status(200).json({ data: menu });
} catch (error) {
    return next(error);
}
});

// 4. 메뉴 수정 API
router.patch("/categories/:categoryId/menus/:menuId", authMiddleware, async (req, res, next) => {
try{
    const { categoryId, menuId } = req.params;
    const { name, description, price, order, status } = req.body;
    const {role} = req.user;

    if (!categoryId ||!menuId ||!name ||!description ||!price ||!order ||!status){
      throw createCustomError('Invalid Data Format', 'InvalidDataFormatError');
    }
    
    if (role !== 'OWNER') {
      throw createCustomError('Not Owner','NotOwnerError');
  }
      const category = await prisma.menus.findFirst({
      where: { categoryId: +categoryId },
    });

    if (!category){
      throw createCustomError('Category Not Found','CategoryNotFoundError');
    }

    const menu = await prisma.menus.findFirst({
      where: { id: +menuId },
    });

    if (!menu){
      throw createCustomError('Menu Not Found', 'MenuNotFoundError');
    }

    if (price < 0) {
      throw createCustomError('Invalid Menu Price', 'InvalidMenuPriceError');
}

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
    return next(error);
}
});

// 5. 메뉴 삭제 API
router.delete(
  "/categories/:categoryId/menus/:menuId", authMiddleware, async (req, res, next) => {
try {
    const { categoryId, menuId } = req.params;
    const {role} = req.user;

    if (!categoryId || !menuId){
      throw createCustomError('Invalid Data Format', 'InvalidDataFormatError');
    }

    if (role !== 'OWNER') {
      throw createCustomError('Not Owner', 'NotOwnerError');
  }

    const category = await prisma.menus.findFirst({
      where: { categoryId: +categoryId },
    });
    
    if (!category){
      throw createCustomError('Category Not Found', 'CategoryNotFoundError');
    }

    const menu = await prisma.menus.findFirst({
      where: { id: +menuId },
    });

    if (!menu) {
      throw createCustomError('Menu Not Found', 'MenuNotFoundError');
    }
    
      await prisma.menus.delete({
      where: { id: +menuId, categoryId: +categoryId },
    });
    return res.status(200).json({ message: "메뉴를 삭제하였습니다" });
} catch (error) {
    return next(error);
}
});

export default router;
