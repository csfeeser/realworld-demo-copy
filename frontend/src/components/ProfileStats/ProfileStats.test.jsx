import { render, screen } from "@testing-library/react";
import dateFormatter from "../../helpers/dateFormatter";
import getProfile from "../../services/getProfile";
import ProfileStats from "./ProfileStats";

vi.mock("../../services/getProfile");

it("renders article count, favorites received, and member-since", async () => {
  const memberSince = "2026-09-25T00:00:00.000Z";
  getProfile.mockResolvedValue({
    articlesCount: 3,
    favoritesReceived: 12,
    memberSince,
  });

  render(<ProfileStats headers={{}} username="eric" />);

  expect(await screen.findByText("3 articles")).toBeInTheDocument();
  expect(screen.getByText("12 favorites")).toBeInTheDocument();
  expect(
    screen.getByText(`Member since ${dateFormatter(memberSince)}`),
  ).toBeInTheDocument();
});
