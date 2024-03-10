import express from "express";
import { prisma } from "../utils/prisma/index.js";
import CustomError from "../utils/customError.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. 메뉴 주문 API

router.post("/orders", authMiddleware, async (req, res, next) => {
  try {
    const { menuId, quantity } = req.body;
    const { id: userId, role } = req.user;

    if (!menuId || !quantity) {
      throw new CustomError("Invalid Data Format", 400);
    }
    if (role !== "CUSTOMER") {
      throw new CustomError("Not Customer", 401);
    }

    const menu = await prisma.menus.findUnique({
      where: { id: +menuId },
    });

    if (!menu) {
      throw new CustomError("Menu Not Found", 404);
    }

    // Calculate totalPrice based on menu price and quantity
    const totalPrice = menu.price * quantity;

    await prisma.customerOrders.create({
      data: {
        menuId: +menuId,
        userId,
        quantity,
        totalPrice, // Include totalPrice in the data object
      },

      include: {
        menu: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    return res.status(201).json({ message: "메뉴 주문에 성공하였습니다" });
  } catch (error) {
    return next(error);
  }
});

// 2. 주문 내역 조회(소비자) API
router.get("/orders/customer", authMiddleware, async (req, res, next) => {
  try {
    const { role } = req.user;

    if (role !== "CUSTOMER") {
      throw new CustomError("Not Customer", 401);
    }

    const menus = await prisma.customerOrders.findMany({
      select: {
        id: true,
        menu: {
          select: {
            name: true,
            price: true,
          },
        },
        orderType: true,
        quantity: true,
        createdAt: true,
        // totalPrice : true
      },
    });

    return res.status(200).json({ data: menus });
  } catch (error) {
    return next(error);
  }
});

// 3. 주문 내역 조회(사장님) API
router.get("/orders/owner", authMiddleware, async (req, res, next) => {
  try {
    const { role } = req.user;

    if (role !== "OWNER") {
      throw new CustomError("Not Owner", 403);
    }

    const orders = await prisma.customerOrders.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        menu: {
          select: {
            name: true,
            price: true,
          },
        },
        quantity: true,
        orderType: true,
        createdAt: true,
        totalPrice: true,
      },
    });

    // Calculate totalPrice based on fetched data
    orders.forEach((order) => {
      order.totalPrice = order.menu.price * order.quantity;
    });

    return res.status(200).json({ data: orders });
  } catch (error) {
    return next(error);
  }
});


// 4. 주문 내역 상태 변경 API
router.patch('/orders/:orderId/status', authMiddleware, async (req, res, next) => {
    try {
        const { status } = req.body;
        const { orderId } = req.params;
        const { role } = req.user;

        // 요청 데이터가 올바른지 확인합니다.
        if (!status || !orderId) {
            throw new CustomError('Invalid Data Format', 400); 
        }

        // 사용자 역할이 OWNER인지 확인합니다.
        if (role !== 'OWNER') {
            throw new CustomError('Not Owner', 403);
        }

        // 주문을 조회합니다.
        const order = await prisma.customerOrders.findUnique({
            where: { id: parseInt(orderId) }
        });

        // 요청된 주문이 존재하지 않으면 404 에러를 반환합니다.
        if (!order) {
            throw new CustomError('Order Not Found', 404); 
        }

        // 주문 상태를 업데이트하고 결과를 반환합니다.
        const updatedOrder = await prisma.customerOrders.update({
            where: { id: parseInt(orderId) },
            data: { orderType : status }
        });

        return res.status(200).json({ updatedOrder });
    } catch (error) {
        return next(error);
    }
});

export default router;
