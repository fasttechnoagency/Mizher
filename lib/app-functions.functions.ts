import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InvokeInput = z.object({
  name: z.string().min(1).max(64).regex(/^[A-Za-z]+$/),
  payload: z.record(z.string(), z.unknown()).default({}),
});

// Single entry point for the app's backend actions (provider logins, payments,
// console updates, admin actions). Each action checks the caller itself.
export const invokeAppFunction = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InvokeInput.parse(input))
  .handler(async ({ data }): Promise<{ status: number; data: any }> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { runAppFunction } = await import("@/server/runtime.server");
    return runAppFunction(data.name, data.payload, getRequest());
  });
