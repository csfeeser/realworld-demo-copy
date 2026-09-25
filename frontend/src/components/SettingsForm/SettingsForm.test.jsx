import { fireEvent, render, screen } from "@testing-library/react";
import userUpdate from "../../services/userUpdate";
import { useAuth } from "../../context/AuthContext";
import SettingsForm from "./SettingsForm";

vi.mock("../../services/userUpdate");
vi.mock("../../context/AuthContext");
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));

beforeEach(() => {
  userUpdate.mockReset();
  userUpdate.mockResolvedValue({});
  useAuth.mockReturnValue({
    headers: {},
    isAuth: true,
    loggedUser: {
      bio: "",
      email: "jane@x.com",
      image: "",
      password: "",
      socialLinks: [],
      username: "jane",
    },
    setAuthState: vi.fn(),
  });
});

it("submits an added social link", () => {
  render(<SettingsForm />);

  fireEvent.click(screen.getByText("Add link"));
  fireEvent.change(screen.getByPlaceholderText("Label (e.g. GitHub)"), {
    target: { value: "GitHub" },
  });
  fireEvent.change(screen.getByPlaceholderText("https://..."), {
    target: { value: "https://github.com/jane" },
  });
  fireEvent.click(screen.getByText("Update Settings"));

  expect(userUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      socialLinks: [{ label: "GitHub", url: "https://github.com/jane" }],
    }),
  );
});

it("drops a fully blank link row on submit", () => {
  render(<SettingsForm />);

  fireEvent.click(screen.getByText("Add link"));
  fireEvent.click(screen.getByText("Update Settings"));

  expect(userUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ socialLinks: [] }),
  );
});

it("blocks the save when a link has no URL", () => {
  render(<SettingsForm />);

  fireEvent.click(screen.getByText("Add link"));
  fireEvent.change(screen.getByPlaceholderText("Label (e.g. GitHub)"), {
    target: { value: "GitHub" },
  });
  fireEvent.click(screen.getByText("Update Settings"));

  expect(userUpdate).not.toHaveBeenCalled();
  expect(screen.getByText(/needs a URL/i)).toBeInTheDocument();
});

it("blocks the save when a link has no label", () => {
  render(<SettingsForm />);

  fireEvent.click(screen.getByText("Add link"));
  fireEvent.change(screen.getByPlaceholderText("https://..."), {
    target: { value: "https://github.com/jane" },
  });
  fireEvent.click(screen.getByText("Update Settings"));

  expect(userUpdate).not.toHaveBeenCalled();
});

it("blocks the save when a label exceeds 50 characters", () => {
  render(<SettingsForm />);

  fireEvent.click(screen.getByText("Add link"));
  fireEvent.change(screen.getByPlaceholderText("Label (e.g. GitHub)"), {
    target: { value: "x".repeat(51) },
  });
  fireEvent.change(screen.getByPlaceholderText("https://..."), {
    target: { value: "https://github.com/jane" },
  });
  fireEvent.click(screen.getByText("Update Settings"));

  expect(userUpdate).not.toHaveBeenCalled();
});
