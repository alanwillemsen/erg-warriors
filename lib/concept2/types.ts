import { z } from "zod";

// OAuth Token Response
export const Concept2TokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string().optional(),
});

export type Concept2Token = z.infer<typeof Concept2TokenSchema>;

// User Profile
export const Concept2UserSchema = z.object({
  user_id: z.union([z.string(), z.number()]).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  gender: z.string().optional(),
}).transform((data) => {
  // Handle both user_id and id fields, convert to string
  const userId = data.user_id || data.id;
  if (!userId) {
    throw new Error("Missing user ID in Concept2 response");
  }
  return {
    user_id: String(userId),
    username: data.username || "",
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    gender: data.gender,
  };
});

export type Concept2User = z.infer<typeof Concept2UserSchema>;

// Workout Result
export const Concept2ResultSchema = z.object({
  id: z.union([z.string(), z.number()]),
  user_id: z.union([z.string(), z.number()]),
  date: z.string(),
  distance: z.number(),
  type: z.string(),
  time: z.number().optional(),
  calories_total: z.number().optional(),
  workout_type: z.string().optional(),
  source: z.string().optional(),
  weight_class: z.string().optional(),
  verified: z.boolean().optional(),
}).transform((data) => ({
  ...data,
  id: String(data.id),
  user_id: String(data.user_id),
}));

export type Concept2Result = z.infer<typeof Concept2ResultSchema>;

// Results Response with Pagination
export const Concept2ResultsResponseSchema = z.object({
  data: z.array(Concept2ResultSchema),
  meta: z.object({
    pagination: z.object({
      total: z.number(),
      count: z.number(),
      per_page: z.number(),
      current_page: z.number(),
      total_pages: z.number(),
    }),
  }),
});

export type Concept2ResultsResponse = z.infer<typeof Concept2ResultsResponseSchema>;

// Leaderboard Entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  discordId: string;
  discordName: string;
  discordAvatar?: string;
  gender?: string;
  totalMeters: number;
  workoutCount: number;
  totalHours: number;
  totalCalories: number;
  lastWorkout?: string;
}

// Time Period Types
export type TimePeriod = "week" | "month" | "year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}
