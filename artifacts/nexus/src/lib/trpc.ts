/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTRPCReact } from "@trpc/react-query";

// The AppRouter type lives in the api-server package. To avoid cross-package type issues,
// we use a loose typing approach. The actual tRPC client will work correctly at runtime.
export const trpc: ReturnType<typeof createTRPCReact<any>> = createTRPCReact();
