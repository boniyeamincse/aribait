import { Folder, Layers, BookOpen } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { CategoryForm } from "./category-form";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { events: true } } },
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <AdminPageHeader 
        title="Categories Management" 
        description="Organize your courses and events into categories for better navigation." 
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Create Category Sidebar */}
        <Card className="w-full lg:w-[380px] shrink-0 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Folder size={18} className="text-indigo-600" />
              Add New Category
            </CardTitle>
            <CardDescription className="text-xs">
              Create a new category to group related events together.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CategoryForm />
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="flex-1 w-full">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-white pb-4 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers size={20} className="text-slate-700" />
                Active Categories ({categories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x border-b border-slate-100 [&>*:nth-child(n)]:border-slate-100">
                {categories.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500">
                    <Folder size={32} className="mb-3 text-slate-300" />
                    <p className="font-medium text-slate-700">No categories found</p>
                    <p className="text-sm">Add your first category using the form.</p>
                  </div>
                )}
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-col p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 md:border-b-0 group"
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <BookOpen size={14} className="text-slate-400" />
                      <span>
                        {category._count.events} Event{category._count.events === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
