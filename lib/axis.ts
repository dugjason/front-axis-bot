/** Calculate the AXIS score based on the provided formula
 * Returns a floating point number between 0 and 5 with 1 decimal place
 * @param ra - The Resolution Accuracy score
 * @param ie - The Interaction Effort score
 * @param hs - The Handoff Smoothness score
 * @returns The AXIS score
 * @see https://front.com/blog/ai-experience-impact-score-axis
 */
export const calculateAxisScore = (ra: number, ie: number, hs: number): number => {
  return Number(((ra + ie + hs) / 3).toFixed(1))
}
