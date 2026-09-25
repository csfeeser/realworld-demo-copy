import { render, screen, waitFor } from "@testing-library/react";
import getProfile from "../../services/getProfile";
import ProfileLinks from "./ProfileLinks";

vi.mock("../../services/getProfile");

it("renders each social link with its label and href", async () => {
  getProfile.mockResolvedValue({
    socialLinks: [
      { label: "GitHub", url: "https://github.com/eric" },
      { label: "Site", url: "https://eric.dev" },
    ],
  });

  render(<ProfileLinks headers={{}} username="eric" />);

  const github = await screen.findByText("GitHub");
  expect(github).toHaveAttribute("href", "https://github.com/eric");

  const site = screen.getByText("Site");
  expect(site).toHaveAttribute("href", "https://eric.dev");
});

it("renders nothing when socialLinks is null", async () => {
  getProfile.mockResolvedValue({ socialLinks: null });

  const { container } = render(<ProfileLinks headers={{}} username="eric" />);

  // Let the resolved fetch flush, then assert the component produced no output.
  await waitFor(() => expect(container).toBeEmptyDOMElement());
});

it("renders nothing when socialLinks is an empty array", async () => {
  getProfile.mockResolvedValue({ socialLinks: [] });

  const { container } = render(<ProfileLinks headers={{}} username="eric" />);

  await waitFor(() => expect(container).toBeEmptyDOMElement());
});
