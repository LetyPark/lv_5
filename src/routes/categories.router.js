import express from "express";
import {prisma} from '../utils/prisma/index.js'
import authMiddleware from "../middlewares/auth.middleware.js";
import { createCustomError } from "../utils/errorUtils.js";
const router = express.Router();


// 1. 카테고리 등록 API
router.post('/categories', authMiddleware, async (req, res, next) => {
  try {
    const {name} = req.body;
    const {role} = req.user; // 사용자의 역할 정보

    if (!name) {
      throw createCustomError('Invalid Data Format', 'InvalidDataFormatError');
  }

  if (role !== 'OWNER') {
    throw createCustomError('Not Owner', 'NotOwnerError');
}

    const categoryCount = await prisma.categories.count();
        await prisma.categories.create({
            data: {
                name,
                order: categoryCount + 1
            }
        });
        return res.status(201).json({message: '카테고리를 등록하였습니다.'});
    } catch (error) {
        return next(error);
    }
});


// 2. 카테고리 조회 API
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await prisma.categories.findMany({
            select: {
                id : true,
                name: true,
                order: true
            }
        });
        return res.status(200).json({data : categories});
    } catch (error) {
        return next(error);
    }
});


// 3. 카테고리 정보 변경 API
router.patch("/categories/:categoryId",authMiddleware, async (req, res, next) => {
    try{
      const { categoryId } = req.params;
      const { name, order } = req.body;
      const {role} = req.user;
      
    if (!categoryId || !name || !order) {
      throw createCustomError('Invalid Data Format', 'InvalidDataFormatError');
    }

    if (role !== 'OWNER') {
      throw createCustomError('Not Owner', 'NotOwnerError');
  }

    const category = await prisma.categories.findUnique({
      where: { id: +categoryId },
    });

    if (!category){
      throw createCustomError('Category Not Found', 'CategoryNotFoundError');
    }
      
    await prisma.categories.update({
      where: { id: +categoryId },
      data: {
        name,
        order,
      },
    });
    return res.status(200).json({ message: "카테고리 정보를 수정했습니다" });
} catch (error) {
    return next(error);
}
});

  
  // 4. 카테고리 삭제 api
  router.delete("/categories/:categoryId",authMiddleware, async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const {role} = req.user; 
    
    if (!categoryId){
      throw createCustomError('Invalid Data Format', 'InvalidDataFormatError');
    }

    if (role !== 'OWNER') {
      throw createCustomError('Not Owner', 'NotOwnerError');
  }
  
    const category = await prisma.categories.findFirst({
      where: { id: +categoryId },
    });

    if (!category){
      throw createCustomError('Category Not Found', 'CategoryNotFoundError');
    }

    await prisma.categories.delete({
      where: { id: +categoryId },
    });

    return res.status(200).json({ message: "카테고리 정보를 삭제하였습니다" });
} catch (error) {
    return next(error);
}});

export default router;