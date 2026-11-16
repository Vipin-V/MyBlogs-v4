import { describe, expect, it } from "vitest";
import { groupImages } from "./gallery";

const img = (n: number) => `<p><img src="https://x/${n}.jpg"></p>`;
describe("groupImages", () => {
  it("groups consecutive images into one gallery", () => {
    const out = groupImages(`<p>Hi</p>${img(1)}${img(2)}${img(3)}<p>Bye</p>`);
    expect(out.match(/class="post-gallery"/g)).toHaveLength(1);
    expect(out.match(/post-gallery-slide/g)).toHaveLength(3);
  });
  it("leaves images separated by text alone", () => {
    const html = `${img(1)}<p>Some text</p>${img(2)}`;
    expect(groupImages(html)).toBe(html);
  });
  it("leaves a single image alone", () => {
    expect(groupImages(img(1))).toBe(img(1));
  });
});
