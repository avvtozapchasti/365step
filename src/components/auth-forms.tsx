"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2 } from "lucide-react";

import { signInAction, signUpAction, type FormState } from "@/actions/auth";
import { Button, ErrorNote, Field, Input } from "./ui";

const EMPTY: FormState = {};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending ? "One moment…" : children}
      {pending ? null : <ArrowRight className="size-4" />}
    </Button>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, EMPTY);

  return (
    <form action={action} className="space-y-4">
      <Field label="Your name">
        <Input
          name="name"
          autoComplete="name"
          required
          minLength={2}
          placeholder="Alex"
          aria-describedby={state.error ? "auth-error" : undefined}
        />
      </Field>

      <Field label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password" hint="At least 8 characters.">
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </Field>

      {state.error ? (
        <div id="auth-error">
          <ErrorNote>{state.error}</ErrorNote>
        </div>
      ) : null}

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

export function SignInForm() {
  const [state, action] = useActionState(signInAction, EMPTY);

  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-describedby={state.error ? "auth-error" : undefined}
        />
      </Field>

      <Field label="Password">
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>

      {state.error ? (
        <div id="auth-error">
          <ErrorNote>{state.error}</ErrorNote>
        </div>
      ) : null}

      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
