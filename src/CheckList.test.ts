import { CheckList } from "./CheckList";

it("create CheckList without crash", () => {
  const v = new CheckList("name");
  expect(v.name).toEqual("name")
})
