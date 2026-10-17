import type { StepDefinition } from "./multi-step-form";

// Markup theo "Responsive stepper" của Preline (https://preline.co/docs/components/stepper.html).
// Không dùng plugin data-hs-stepper: bước hiện tại do React quản lý, class
// trạng thái hs-stepper-active / hs-stepper-success được áp trực tiếp.
export function PrelineStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: StepDefinition[];
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <ul className="relative flex flex-col gap-2 md:flex-row">
      {steps.map((step) => {
        const isSuccess = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <li className="group/item flex-1 md:shrink md:basis-0" key={step.id}>
            <button
              aria-current={isActive ? "step" : undefined}
              className="group/btn flex w-full gap-x-2 text-start focus:outline-hidden md:block"
              onClick={() => onStepClick(step.id)}
              type="button"
            >
              <div className="flex min-h-7 min-w-7 flex-col items-center align-middle text-xs md:inline-flex md:w-full md:flex-row md:flex-wrap">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full font-medium ${
                    isActive || isSuccess
                      ? "bg-primary-active text-primary-foreground"
                      : "bg-surface text-surface-foreground group-focus/btn:bg-surface-focus"
                  }`}
                >
                  {isSuccess ? (
                    <svg
                      aria-hidden="true"
                      className="size-3 shrink-0"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </span>
                <div
                  className={`mt-2 h-full w-px group-last/item:hidden md:ms-2 md:mt-0 md:h-px md:w-full md:flex-1 ${
                    isSuccess ? "bg-primary" : "bg-surface-1"
                  }`}
                />
              </div>
              <div className="grow pb-5 md:mt-3 md:grow-0">
                <span className="block text-sm font-medium text-foreground">
                  {step.title}
                </span>
                {step.subtitle ? (
                  <p className="text-sm text-muted-foreground-1">
                    {step.subtitle}
                  </p>
                ) : null}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
