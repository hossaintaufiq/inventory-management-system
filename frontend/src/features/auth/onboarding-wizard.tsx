"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/shared/simple-select";
import { plans } from "@/lib/plans";
import { cn } from "@/lib/utils";

const steps = ["Business", "Location", "Plan"];
const industries = ["Retail", "Wholesale & distribution", "E-commerce", "Manufacturing", "Food & beverage", "Healthcare", "Other"];
const sizes = ["Just me", "2–10", "11–50", "51–200", "200+"];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    company: "",
    industry: "Retail",
    size: "2–10",
    warehouse: "Main Warehouse",
    city: "",
    currency: "USD",
    plan: "starter",
  });
  const set = (k: keyof typeof data) => (v: string) => setData((d) => ({ ...d, [k]: v }));

  const canNext = step === 0 ? data.company.trim().length > 1 : step === 1 ? data.warehouse.trim() && data.city.trim() : true;

  const finish = () => {
    toast.success("Your workspace is ready");
    router.push("/dashboard");
  };

  return (
    <div className="space-y-8">
      <ol className="flex items-center gap-2" aria-label="Setup progress">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                i < step && "border-primary bg-primary text-primary-foreground",
                i === step && "border-primary text-primary",
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("text-sm", i === step ? "font-medium" : "text-muted-foreground")}>{s}</span>
            {i < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Tell us about your business</h1>
            <p className="text-sm text-muted-foreground">We&apos;ll tailor defaults like categories and reports.</p>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ob-company">Company name</FieldLabel>
              <Input id="ob-company" className="h-9" value={data.company} onChange={(e) => set("company")(e.target.value)} placeholder="Acme Retail" autoFocus />
            </Field>
            <Field>
              <FieldLabel htmlFor="ob-industry">Industry</FieldLabel>
              <SimpleSelect id="ob-industry" value={data.industry} onValueChange={set("industry")} options={industries.map((i) => ({ value: i, label: i }))} />
            </Field>
            <Field>
              <FieldLabel>Team size</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("size")(s)}
                    aria-pressed={data.size === s}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                      data.size === s && "border-primary bg-primary/5 font-medium text-primary",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </FieldGroup>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Add your first location</h1>
            <p className="text-sm text-muted-foreground">Where do you keep your stock? You can add more later.</p>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ob-wh">Warehouse or store name</FieldLabel>
              <Input id="ob-wh" className="h-9" value={data.warehouse} onChange={(e) => set("warehouse")(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ob-city">City</FieldLabel>
                <Input id="ob-city" className="h-9" value={data.city} onChange={(e) => set("city")(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ob-currency">Currency</FieldLabel>
                <SimpleSelect id="ob-currency" value={data.currency} onValueChange={set("currency")} options={["USD", "EUR", "GBP", "CAD", "AUD", "INR", "BDT"].map((c) => ({ value: c, label: c }))} />
              </Field>
            </div>
          </FieldGroup>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Choose a plan</h1>
            <p className="text-sm text-muted-foreground">Every paid plan starts with a 14-day free trial.</p>
          </div>
          <div className="space-y-2" role="radiogroup" aria-label="Plan">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={data.plan === p.id}
                onClick={() => set("plan")(p.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                  data.plan === p.id && "border-primary ring-3 ring-primary/15",
                )}
              >
                <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border", data.plan === p.id && "border-primary")}>
                  {data.plan === p.id ? <span className="size-2 rounded-full bg-primary" /> : null}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.limits.skus} · {p.limits.warehouses} · {p.limits.users}
                  </span>
                </span>
                <span className="text-sm font-medium">{p.price === null ? "Custom" : p.price === 0 ? "Free" : `$${p.price}/mo`}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Continue
          </Button>
        ) : (
          <Button onClick={finish}>Finish setup</Button>
        )}
      </div>
    </div>
  );
}
