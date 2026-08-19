import { prisma } from "@/lib/db/client";

import { CategoryForm } from "./category-form";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { events: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <CategoryForm />
      <div className="max-w-md divide-y rounded-lg border">
        {categories.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No categories yet.
          </p>
        )}
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 text-sm"
          >
            <span>{category.name}</span>
            <span className="text-muted-foreground">
              {category._count.events} Event
              {category._count.events === 1 ? "" : "s"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
