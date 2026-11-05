export type CatPose = "sleeping" | "awake" | "attacking";
export function catPose(interested: boolean, attacking: boolean): CatPose {
  return attacking ? "attacking" : interested ? "awake" : "sleeping";
}