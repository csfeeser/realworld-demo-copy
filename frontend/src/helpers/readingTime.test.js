import readingTime from "./readingTime";

it("should estimate 1 min for a short body", () => {
  expect(readingTime("A short article body.")).toBe("1 min read");
});

it("should estimate 1 min for an empty body", () => {
  expect(readingTime("")).toBe("1 min read");
});

it("should estimate 1 min for a missing body", () => {
  expect(readingTime(undefined)).toBe("1 min read");
});

it("should round up a long body to the next whole minute", () => {
  const body = new Array(201).fill("word").join(" ");

  expect(readingTime(body)).toBe("2 min read");
});
