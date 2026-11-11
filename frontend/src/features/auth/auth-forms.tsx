"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className="pr-9" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function Heading({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="space-y-1.5 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ------------------------------------------------------------------ login

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "alex@acmeretail.example", password: "", remember: true },
  });
  const err = form.formState.errors;

  const onSubmit = form.handleSubmit(async () => {
    await wait(600);
    toast.success("Welcome back, Alex");
    router.push("/dashboard");
  });

  return (
    <div className="space-y-6">
      <Heading title="Welcome back" description="Sign in to your Stockly account" />
      <Button variant="outline" className="h-9 w-full" type="button" onClick={() => router.push("/dashboard")}>
        <GoogleIcon /> Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!err.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" className="h-9" {...form.register("email")} />
            <FieldError errors={[err.email]} />
          </Field>
          <Field data-invalid={!!err.password}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput id="password" autoComplete="current-password" className="h-9 pr-9" {...form.register("password")} />
            <FieldError errors={[err.password]} />
          </Field>
          <Controller
            control={form.control}
            name="remember"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                <FieldLabel htmlFor="remember" className="font-normal">
                  Keep me signed in
                </FieldLabel>
              </Field>
            )}
          />
          <Button type="submit" className="h-9 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Start free trial
        </Link>
      </p>
    </div>
  );
}

// --------------------------------------------------------------- register

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  company: z.string().trim().min(2, "Enter your company name"),
  email: z.email("Enter a valid work email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
  terms: z.literal(true, { error: "You must accept the terms" }),
});

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<z.input<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", company: "", email: "", password: "", terms: false as unknown as true },
  });
  const err = form.formState.errors;
  const pw = useWatch({ control: form.control, name: "password" }) ?? "";
  const strength = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;

  const onSubmit = form.handleSubmit(async () => {
    await wait(700);
    toast.success("Account created");
    router.push("/onboarding");
  });

  return (
    <div className="space-y-6">
      <Heading title="Create your account" description="Free for 14 days. No credit card required." />
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!err.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" autoComplete="name" className="h-9" {...form.register("name")} />
              <FieldError errors={[err.name]} />
            </Field>
            <Field data-invalid={!!err.company}>
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <Input id="company" autoComplete="organization" className="h-9" {...form.register("company")} />
              <FieldError errors={[err.company]} />
            </Field>
          </div>
          <Field data-invalid={!!err.email}>
            <FieldLabel htmlFor="email">Work email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" className="h-9" {...form.register("email")} />
            <FieldError errors={[err.email]} />
          </Field>
          <Field data-invalid={!!err.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput id="password" autoComplete="new-password" className="h-9 pr-9" {...form.register("password")} />
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-muted",
                    i < strength && (strength <= 1 ? "bg-critical" : strength <= 2 ? "bg-warning" : "bg-success"),
                  )}
                />
              ))}
            </div>
            <FieldError errors={[err.password]} />
          </Field>
          <Controller
            control={form.control}
            name="terms"
            render={({ field }) => (
              <Field orientation="horizontal" data-invalid={!!err.terms}>
                <Checkbox id="terms" checked={!!field.value} onCheckedChange={field.onChange} />
                <FieldLabel htmlFor="terms" className="font-normal">
                  I agree to the Terms of Service and Privacy Policy
                </FieldLabel>
              </Field>
            )}
          />
          <FieldError errors={[err.terms]} />
          <Button type="submit" className="h-9 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

// -------------------------------------------------------- forgot password

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.email("Enter a valid email") })),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    await wait(600);
    setSentTo(email);
  });

  if (sentTo) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted">
          <MailCheck className="size-5 text-primary" />
        </div>
        <Heading title="Check your email" description={<>We sent a reset link to <span className="font-medium text-foreground">{sentTo}</span>. It expires in 30 minutes.</>} />
        <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full")}>
          <ArrowLeft /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Heading title="Reset your password" description="Enter your email and we'll send you a reset link." />
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" className="h-9" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Button type="submit" className="h-9 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </FieldGroup>
      </form>
      <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  );
}
