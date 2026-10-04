import {describe, expect, it, vi, beforeEach, afterEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {NextIntlClientProvider} from "next-intl";
import type {Roadmap} from "@waylo/shared";
import {RoadmapView} from "@/components/learner/roadmap-view";
import idMessages from "../messages/id.json";

const roadmapFixture: Roadmap = {
  id: "rm-1",
  trackTitle: "Web Development",
  progressPercent: 65,
  stats: {totalModules: 5, completed: 2, inProgress: 1, notStarted: 2},
  modules: [
    {id: "m1", order: 1, title: "HTML Dasar", summary: "Struktur dasar", status: "completed"},
    {id: "m3", order: 3, title: "JavaScript Fundamentals", summary: "Dasar JS", status: "in_progress"},
  ],
  rewards: [{id: "r1", label: "Sertifikasi Penyelesaian", kind: "certificate"}],
};

function renderWithProviders(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  });
  return render(
    <NextIntlClientProvider locale="id" messages={idMessages}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("RoadmapView (client data path)", () => {
  beforeEach(() => {
    window.localStorage.setItem(
      "waylo.session",
      JSON.stringify({
        accessToken: "test-token",
        user: {id: "u1", email: "a@b.test", fullName: "Kalandra", role: "learner", avatarInitials: "KA"},
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    try {
      window.localStorage.removeItem("waylo.session");
    } catch {
      // localStorage may be unavailable in some jsdom setups; ignore.
    }
  });

  it("renders the seeded modules returned by the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({data: roadmapFixture, error: null}),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<RoadmapView />);

    await waitFor(() => {
      expect(screen.getByText("HTML Dasar")).toBeInTheDocument();
    });
    expect(screen.getByText("JavaScript Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("Web Development")).toBeInTheDocument();

    // The request must carry the bearer token.
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-token",
    );
  });

  it("shows the error state when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({data: null, error: {code: "internal_error", message: "boom"}}),
      }),
    );

    renderWithProviders(<RoadmapView />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});