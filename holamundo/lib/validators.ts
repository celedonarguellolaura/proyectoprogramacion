import { z } from 'zod';

export const HomeDataSchema = z.object({
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string(),
    description: z.string(),
    animationStyle: z.enum(['typewriter', 'fadeIn', 'slideUp']),
  }),
  meta: z.object({
    pageTitle: z.string(),
    description: z.string(),
  }),
});

export const AppConfigSchema = z.object({
  appName: z.string().min(1),
  version: z.string(),
  locale: z.string(),
  theme: z.enum(['light', 'dark']),
});

export type HomeDataZod = z.infer<typeof HomeDataSchema>;
export type AppConfigZod = z.infer<typeof AppConfigSchema>;
