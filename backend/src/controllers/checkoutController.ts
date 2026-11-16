import type { Request, Response, NextFunction } from "express";
import z from "zod";
import { getAuth } from "../middleware/auth.js";
import { getLocalUser } from "../lib/users.js";
import { db } from "../db/index.js";
import { orderItems, orders, products, type CheckoutSessionLine } from "../db/schema.js";
import { and, eq, inArray } from "drizzle-orm";

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Cart cannot be empty"),
  paymentMethod: z.enum(["card", "upi", "cod"]).default("card"),
  paymentDetails: z
    .object({
      cardNumber: z.string().optional(),
      upiId: z.string().optional(),
    })
    .optional(),
});

export async function createCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    // only signed-in users can place an order
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = cartSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid cart data", details: parsed.error.flatten() });
      return;
    }

    const localUser = await getLocalUser(userId);
    if (!localUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const ids = parsed.data.items.map((i) => i.productId);

    // load every cart product that exists and is active
    const prodRows = await db
      .select()
      .from(products)
      .where(and(inArray(products.id, ids), eq(products.active, true)));

    if (prodRows.length !== ids.length) {
      res.status(400).json({ error: "One or more products in your cart are no longer available" });
      return;
    }

    const byId = new Map(prodRows.map((p) => [p.id, p]));
    let totalCents = 0;
    const lines: CheckoutSessionLine[] = [];

    for (const line of parsed.data.items) {
      const p = byId.get(line.productId)!;
      totalCents += p.priceCents * line.quantity;
      lines.push({
        productId: p.id,
        quantity: line.quantity,
        unitPriceCents: p.priceCents,
      });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const demoCheckoutId = `demo_chk_${timestamp}_${randomSuffix}`;
    const demoOrderId = `demo_ord_${timestamp}_${randomSuffix}`;

    // Create the order directly as "paid"
    const [order] = await db
      .insert(orders)
      .values({
        userId: localUser.id,
        status: "paid",
        totalCents,
        polarCheckoutId: demoCheckoutId,
        polarOrderId: demoOrderId,
      })
      .returning();

    // Insert order line items
    if (lines.length > 0) {
      await db.insert(orderItems).values(
        lines.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
        })),
      );
    }

    res.status(201).json({
      ok: true,
      orderId: order.id,
      totalCents,
      paymentMethod: parsed.data.paymentMethod,
      message: "Order placed and payment processed successfully",
      returnUrl: `/checkout/return?checkout_id=${order.id}`,
    });
  } catch (e) {
    next(e);
  }
}
