import Link from "next/link";
import { Compass } from "lucide-react";

import { ButtonLink, Logo, Panel } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8">
        <Logo className="text-xl" />
      </Link>

      <Panel className="w-full max-w-md p-8 text-center">
        <div className="sunken mx-auto mb-5 flex size-12 items-center justify-center rounded-full subtle">
          <Compass className="size-5" />
        </div>

        <h1 className="text-xl font-semibold tracking-tight">This page does not exist</h1>
        <p className="muted mt-2 text-sm leading-relaxed">
          The link may be out of date, or the lesson or opportunity may have been renamed.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <ButtonLink href="/dashboard">Back to today</ButtonLink>
          <ButtonLink href="/opportunities" variant="secondary">
            Browse opportunities
          </ButtonLink>
        </div>
      </Panel>
    </div>
  );
}
