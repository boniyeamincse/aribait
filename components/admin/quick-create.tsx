"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QuickCreate() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="hidden gap-1 sm:flex">
          <Plus className="h-4 w-4" />
          <span>Quick Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Create New</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/events/new">Event</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/instructors/new">Instructor</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/categories/new">Category</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/discounts/new">Coupon</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
