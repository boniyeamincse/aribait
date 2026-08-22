import { Ticket, Percent, Calendar, CheckCircle2, XCircle } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { deactivateCoupon } from "@/lib/discounts/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { DiscountForm } from "./discount-form";

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: { events: { include: { event: true } }, _count: { select: { redemptions: true } } },
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader 
        title="Discounts & Coupons" 
        description="Create promotional codes, manage discount tiers, and track coupon usage." 
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Create Coupon Sidebar */}
        <Card className="w-full lg:w-[420px] shrink-0 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket size={18} className="text-indigo-600" />
              Create New Coupon
            </CardTitle>
            <CardDescription className="text-xs">
              Generate a new discount code with specific usage limits and expiration dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <DiscountForm />
          </CardContent>
        </Card>

        {/* Coupons List */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900 px-1">Active & Past Coupons</h2>
          
          <AdminTable
            rowKey={(d) => d.id}
            rows={discounts}
            emptyMessage="No discount coupons have been created yet."
            columns={[
              {
                key: "code",
                label: "Coupon Code",
                render: (d) => (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Percent size={14} />
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider">{d.code}</span>
                  </div>
                ),
              },
              {
                key: "details",
                label: "Discount Value",
                render: (d) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-900">
                      {d.type === "PERCENTAGE" ? `${d.amount}% OFF` : `${formatBdt(d.amount)} OFF`}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      {d.events.length === 0 ? "Sitewide" : "Specific Events"}
                    </span>
                  </div>
                ),
              },
              {
                key: "usage",
                label: "Usage Stats",
                render: (d) => (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-700">
                      {d._count.redemptions} <span className="text-slate-400 text-xs">redeemed</span>
                    </span>
                    {(d.maxTotalUsage || d.maxPerUserUsage) && (
                      <span className="text-[10px] text-slate-400">
                        {d.maxTotalUsage && `Max: ${d.maxTotalUsage} `}
                        {d.maxPerUserUsage && `(Limit ${d.maxPerUserUsage}/user)`}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (d) => (
                  <div className="flex items-center gap-2">
                    {d.active ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 uppercase text-[10px] tracking-wider px-2 shadow-none">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100 uppercase text-[10px] tracking-wider px-2 shadow-none">
                        Inactive
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                key: "actions",
                label: "",
                render: (d) => (
                  <div className="flex justify-end">
                    {d.active ? (
                      <form action={deactivateCoupon.bind(null, d.id)}>
                        <Button type="submit" size="sm" variant="outline" className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1.5 w-full sm:w-auto">
                          <XCircle size={14} /> Deactivate
                        </Button>
                      </form>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs h-8 text-slate-400 border-slate-200 gap-1.5" disabled>
                        <CheckCircle2 size={14} /> Ended
                      </Button>
                    )}
                  </div>
                ),
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
