import { createTRPCReact } from "@trpc/react-query";
// @ts-ignore - AppRouter lives in the api-server package; any type is fine for the migration
export const trpc = createTRPCReact<any>();
