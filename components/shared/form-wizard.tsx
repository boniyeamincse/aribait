"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = { label: string; content: ReactNode };
type ValidatableElement = HTMLElement & { reportValidity: () => boolean };

/** Multi-step wrapper around a single <form> — every step's fields stay
 * mounted the whole time (only the current one is visually hidden), so one
 * useActionState/action still receives the complete FormData on final
 * submit. No server-side changes needed to adopt this.
 *
 * Validation is scoped explicitly per step, not left to the browser's
 * whole-form check: contrary to what you'd expect, an element under a
 * `hidden` ancestor is NOT exempt from constraint validation (only
 * `disabled`/`type=hidden` elements are) — confirmed live, form.checkValidity()
 * returns false because of *other, not-yet-visited* steps' empty required
 * fields. So "Next" only looks for :invalid inside the current step's
 * container, and the final Submit checks the whole form but, if it finds an
 * invalid field on a step that isn't current, navigates there first so the
 * native validation bubble has something visible to attach to. */
export function FormWizard({
  action,
  steps,
  submitLabel,
  pending,
  submitError,
}: {
  action: (formData: FormData) => void;
  steps: Step[];
  submitLabel: string;
  pending: boolean;
  submitError?: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isLast = currentStep === steps.length - 1;

  function stepIndexOf(el: Element): number {
    return stepRefs.current.findIndex((container) => container?.contains(el));
  }

  function goNext() {
    const invalid = stepRefs.current[currentStep]?.querySelector<ValidatableElement>(":invalid");
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    const next = Math.min(currentStep + 1, steps.length - 1);
    setCurrentStep(next);
    setMaxReached((m) => Math.max(m, next));
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function goTo(index: number) {
    if (index <= maxReached) setCurrentStep(index);
  }

  function handleSubmitClick() {
    const invalid = formRef.current?.querySelector<ValidatableElement>(":invalid");
    if (invalid) {
      const stepIndex = stepIndexOf(invalid);
      if (stepIndex !== -1 && stepIndex !== currentStep) {
        setCurrentStep(stepIndex);
        setMaxReached((m) => Math.max(m, stepIndex));
        requestAnimationFrame(() => invalid.reportValidity());
      } else {
        invalid.reportValidity();
      }
      return;
    }
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={action} className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-start gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-2">
        {steps.map((step, i) => {
          const isCurrent = i === currentStep;
          const isDone = i < currentStep;
          const reachable = i <= maxReached;
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => goTo(i)}
              disabled={!reachable}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 border-b-2 pb-2 text-xs font-medium transition-colors",
                isCurrent
                  ? "border-indigo-500 text-indigo-600"
                  : reachable
                    ? "border-slate-200 text-slate-500 hover:text-slate-700"
                    : "cursor-not-allowed border-slate-100 text-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                  isCurrent
                    ? "bg-indigo-500 text-white"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {isDone ? <Check size={12} /> : i + 1}
              </span>
              <span className="hidden sm:block">{step.label}</span>
            </button>
          );
        })}
      </div>

      {steps.map((step, i) => (
        <div
          key={step.label}
          hidden={i !== currentStep}
          ref={(el) => {
            stepRefs.current[i] = el;
          }}
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {step.content}
          </div>
        </div>
      ))}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={goBack} disabled={currentStep === 0}>
          Back
        </Button>
        {isLast ? (
          <Button type="button" onClick={handleSubmitClick} disabled={pending}>
            {pending ? "Saving…" : submitLabel}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </form>
  );
}
