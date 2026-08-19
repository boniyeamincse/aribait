"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QuickCreate() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" className="hidden gap-1 sm:flex">
            <Plus className="h-4 w-4" />
            <span>Quick Create</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Create New</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/admin/events/new">Event</Link>} />
          <DropdownMenuItem render={<Link href="/admin/instructors/new">Instructor</Link>} />
          <DropdownMenuItem render={<Link href="/admin/categories/new">Category</Link>} />
          <DropdownMenuItem render={<Link href="/admin/discounts/new">Coupon</Link>} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
