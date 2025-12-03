import { supabase } from "@/integrations/supabase/client";

/**
 * Notify the customer about an order status change by calling the Supabase edge function.
 * This will:
 * - Fetch the order and its items from Supabase
 * - Call the `send-order-email` edge function with full details
 */
export async function notifyOrderStatusChange(orderId: string, status: string) {
  try {
    // Load order + items so the email has full context
    const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
      await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase
          .from("order_items")
          .select("product_name, quantity, price")
          .eq("order_id", orderId),
      ]);

    if (orderError) throw orderError;
    if (itemsError) throw itemsError;
    if (!order) throw new Error("Order not found for notification");

    const customUrl = import.meta.env.VITE_SEND_ORDER_EMAIL_URL as
      | string
      | undefined;
    let endpoint = customUrl;

    if (!endpoint) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as
        | string
        | undefined;
      if (!supabaseUrl) {
        console.warn(
          "VITE_SUPABASE_URL is not defined; cannot call edge function"
        );
        return;
      }
      const functionsBase = supabaseUrl.replace(
        ".supabase.co",
        ".functions.supabase.co"
      );
      endpoint = `${functionsBase}/send-order-email`;
    }

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        status,
        items: items || [],
        total: order.total,
      }),
    });
  } catch (err) {
    console.warn("notifyOrderStatusChange failed", err);
  }
}

export default notifyOrderStatusChange;
