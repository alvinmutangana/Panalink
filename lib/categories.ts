export const CATEGORIES = ["agriculture", "crafts", "food", "other"] as const;
export type Category = (typeof CATEGORIES)[number];
