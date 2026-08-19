"use client";

import { useTransition } from "react";

import { moderateReview } from "@/lib/reviews/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ReviewModerationRow({
  reviewId,
  published,
}: {
  reviewId: string;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={published ? "secondary" : "outline"}>
        {published ? "Published" : "Hidden"}
      </Badge>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await moderateReview(reviewId, !published);
          })
        }
      >
        {published ? "Unpublish" : "Publish"}
      </Button>
    </div>
  );
}
