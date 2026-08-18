export const BCS_SCORE_VALUES = [
  '1.0-2.1',
  '2.2-2.9',
  '3.0-3.7',
  '3.8-5.0',
] as const;

export type BcsScore = (typeof BCS_SCORE_VALUES)[number];
