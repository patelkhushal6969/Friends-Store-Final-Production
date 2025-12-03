import React, { useState } from "react";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyOrderStatusChange } from "@/lib/notify";

type OrderStatus = "received" | "dispatched" | "completed" | "returned" | "cancelled";

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries(["admin_orders"]);
      // trigger notification if email exists
      try { notifyOrderStatusChange(data.id, data.status); } catch (e) { console.warn(e); }
    },
  });

  const createOrder = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("orders").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["admin_orders"]),
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSettled: () => {
      setDeletingId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin_orders"]);
    },
  });

  const grouped = (ordersQuery.data || []).reduce((acc: Record<string, any[]>, o: any) => {
    acc[o.status] = acc[o.status] || [];
    acc[o.status].push(o);
    return acc;
  }, {} as Record<string, any[]>);

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    notes: "",
    items: [{ product_name: "", quantity: 1, price: 0 }],
  });

  const addItem = () => setForm((s) => ({ ...s, items: [...s.items, { product_name: "", quantity: 1, price: 0 }] }));

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = form.items.reduce((s, it) => s + (it.quantity || 0) * (it.price || 0), 0);
    try {
      const order = await createOrder.mutateAsync({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        delivery_address: form.delivery_address,
        notes: form.notes,
        total,
        status: "received",
      });
      // insert items
      await Promise.all(form.items.map((it) => supabase.from("order_items").insert({
        order_id: order.id,
        product_name: it.product_name,
        quantity: it.quantity,
        price: it.price,
      })));
      // send confirmation email
      try {
        await notifyOrderStatusChange(order.id, "received");
      } catch (err) {
        console.warn("Failed to send order created email", err);
      }
      setForm({ customer_name: "", customer_email: "", customer_phone: "", delivery_address: "", notes: "", items: [{ product_name: "", quantity: 1, price: 0 }] });
      alert("Order created");
    } catch (err: any) {
      console.error(err);
      alert(err.message || String(err));
    }
  };

  const openOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setOrderItems([]);

    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setDetailsError(error.message);
    } else {
      setOrderItems(data || []);
    }

    setDetailsLoading(false);
  };

  const renderStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, string> = {
      received: "bg-blue-100 text-blue-700 border-blue-200",
      dispatched: "bg-amber-100 text-amber-700 border-amber-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      returned: "bg-purple-100 text-purple-700 border-purple-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${variants[status]}`}
      >
        {status}
      </span>
    );
  };

  const visibleStatuses = (statusFilter === "all"
    ? Object.keys(grouped)
    : [statusFilter]
  ) as OrderStatus[];

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container px-4 md:px-8 py-4 flex items-center justify-between">
            <h1 className="font-display text-xl font-semibold text-foreground">Orders</h1>
          </div>
        </header>

        <main className="container px-4 md:px-8 py-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Manage orders</h2>
                <p className="text-sm text-muted-foreground">
                  View incoming orders and update their status in real time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="status-filter" className="sr-only">
                  Filter by status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as OrderStatus | "all")
                  }
                >
                  <SelectTrigger
                    id="status-filter"
                    className="w-[160px] bg-card"
                  >
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ordersQuery.isLoading && (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Loading orders...
                </CardContent>
              </Card>
            )}

            {ordersQuery.isError && (
              <Card>
                <CardContent className="py-6 text-sm text-destructive">
                  Failed to load orders. Please try again.
                </CardContent>
              </Card>
            )}

            {!ordersQuery.isLoading && !ordersQuery.isError && visibleStatuses.length === 0 && (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  No orders found yet.
                </CardContent>
              </Card>
            )}

            <ScrollArea className="h-[540px] rounded-lg border border-border bg-card">
              <div className="p-4 space-y-5">
                {visibleStatuses.map((status) => (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(status)}
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          {status}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(grouped[status] || []).length} orders
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(grouped[status] || []).map((o: any) => (
                        <Card key={o.id} className="border-border/80">
                          <CardContent className="py-3 px-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div
                              className="space-y-1.5 cursor-pointer rounded-md transition hover:bg-muted/70 p-1 -m-1"
                              onClick={() => openOrderDetails(o)}
                              role="button"
                              aria-label="View order details"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground">
                                  {o.order_number}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  · {new Date(o.created_at).toLocaleString()}
                                </span>
                              </div>

                              <div className="text-sm font-medium">
                                {o.customer_name}{" "}
                                <span className="text-muted-foreground">
                                  — {o.customer_phone}
                                </span>
                              </div>

                              <div className="text-xs text-muted-foreground max-w-xl">
                                {o.delivery_address}
                              </div>

                              {o.notes && (
                                <p className="text-xs text-muted-foreground/90">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {o.notes}
                                </p>
                              )}

                              <div className="text-sm font-semibold">
                                Total:{" "}
                                <span className="font-mono">
                                  ₹{o.total?.toLocaleString?.() ?? o.total}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[180px]">
                              <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">
                                Update status
                              </Label>
                              <Select
                                defaultValue={o.status}
                                onValueChange={(value) =>
                                  updateStatus.mutate({
                                    id: o.id,
                                    status: value as OrderStatus,
                                  })
                                }
                                disabled={updateStatus.isLoading}
                              >
                                <SelectTrigger className="w-[160px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  <SelectItem value="received">
                                    Received
                                  </SelectItem>
                                  <SelectItem value="dispatched">
                                    Dispatched
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="returned">
                                    Returned
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-1 text-xs"
                                  >
                                    Delete order
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete this order?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently remove the order and
                                      its items from the system. This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteOrder.mutate(o.id)}
                                      disabled={false}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                  ))}
                </div>
              </div>
            ))}
              </div>
            </ScrollArea>
          </section>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create manual order</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">Customer name</Label>
                    <Input
                      id="customer_name"
                      value={form.customer_name}
                      onChange={(e) =>
                        setForm({ ...form, customer_name: e.target.value })
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={form.customer_email}
                      onChange={(e) =>
                        setForm({ ...form, customer_email: e.target.value })
                      }
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">Phone</Label>
                    <Input
                      id="customer_phone"
                      value={form.customer_phone}
                      onChange={(e) =>
                        setForm({ ...form, customer_phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery_address">Delivery address</Label>
                    <Textarea
                      id="delivery_address"
                      value={form.delivery_address}
                      onChange={(e) =>
                        setForm({ ...form, delivery_address: e.target.value })
                      }
                      placeholder="Street, city, pincode"
                      rows={2}
                    />
                  </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Items</Label>
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={addItem}
                      >
                        Add item
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        <span>Product</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Price</span>
                      </div>
                      {form.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2"
                        >
                          <Input
                            value={it.product_name}
                            onChange={(e) => {
                              const items = [...form.items];
                              items[idx].product_name = e.target.value;
                              setForm({ ...form, items });
                            }}
                            placeholder="Product name"
                          />
                          <Input
                            type="number"
                            value={it.quantity}
                            min={1}
                            onChange={(e) => {
                              const items = [...form.items];
                              items[idx].quantity = Number(e.target.value);
                              setForm({ ...form, items });
                            }}
                            className="text-right"
                          />
                          <Input
                            type="number"
                            value={it.price}
                            min={0}
                            onChange={(e) => {
                              const items = [...form.items];
                              items[idx].price = Number(e.target.value);
                              setForm({ ...form, items });
                            }}
                            className="text-right"
                          />
                    </div>
                  ))}
                </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Delivery instructions, custom requests, etc."
                      rows={2}
                    />
              </div>

              <div className="flex justify-end">
                    <Button type="submit" disabled={createOrder.isLoading}>
                      {createOrder.isLoading ? "Creating..." : "Create order"}
                    </Button>
              </div>
            </form>
              </CardContent>
            </Card>
          </aside>
        </main>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Order details</DialogTitle>
              <DialogDescription className="space-y-1">
                {selectedOrder && (
                  <>
                    <div className="text-xs font-mono text-muted-foreground">
                      {selectedOrder.order_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Placed on{" "}
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </div>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {selectedOrder.customer_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedOrder.customer_email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedOrder.customer_phone}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Delivery address
                  </div>
                  <div className="text-sm">{selectedOrder.delivery_address}</div>
                </div>

                {selectedOrder.notes && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                      Notes
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                      Items
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {orderItems.length} line item
                      {orderItems.length === 1 ? "" : "s"}
                    </div>
                  </div>

                    <div className="rounded-md border border-border/80 bg-muted/40">
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,1fr)] gap-2 border-b px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      <span>Product</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Price</span>
                      <span className="text-right">Total</span>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {detailsLoading && (
                        <div className="px-3 py-3 text-xs text-muted-foreground">
                          Loading items...
                        </div>
                      )}

                      {detailsError && !detailsLoading && (
                        <div className="px-3 py-3 text-xs text-destructive">
                          Failed to load items: {detailsError}
                        </div>
                      )}

                      {!detailsLoading && !detailsError && orderItems.length === 0 && (
                        <div className="px-3 py-3 text-xs text-muted-foreground">
                          No items recorded for this order.
                        </div>
                      )}

                      {!detailsLoading &&
                        !detailsError &&
                        orderItems.map((it) => (
                          <div
                            key={it.id}
                            className="grid grid-cols-[minmax(0,2fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,1fr)] gap-2 border-t px-3 py-2 text-xs"
                          >
                            <span className="truncate">{it.product_name}</span>
                            <span className="text-right">{it.quantity}</span>
                            <span className="text-right font-mono">
                              ₹{it.price.toLocaleString()}
                            </span>
                            <span className="text-right font-mono">
                              ₹{(it.price * it.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Total
                  </span>
                  <span className="text-base font-semibold font-mono">
                    ₹
                    {selectedOrder.total?.toLocaleString?.() ??
                      selectedOrder.total}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminOrders;
