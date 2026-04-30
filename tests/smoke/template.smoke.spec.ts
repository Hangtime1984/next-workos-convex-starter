import { expect, test } from "@playwright/test";

test("renders the marketing shell without browser runtime errors", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      runtimeErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    runtimeErrors.push(error.message);
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /Choose a delivery method and assemble the right procurement package faster/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Launch the workspace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore the app shell" }),
  ).toBeVisible();

  await page.waitForTimeout(250);

  expect(runtimeErrors).toEqual([]);
});

test("redirects /app to the internal sign-in route when signed out", async ({
  request,
}) => {
  const response = await request.get("/app", { maxRedirects: 0 });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/sign-in?returnTo=%2Fapp");
});

test("redirects onboarding to the internal sign-in route when signed out", async ({
  request,
}) => {
  const response = await request.get("/onboarding/workspace", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe(
    "/sign-in?returnTo=%2Fonboarding%2Fworkspace",
  );
});

test("returns 401 JSON from the widget token endpoint when signed out", async ({
  request,
}) => {
  const response = await request.get("/api/workos/widget-token/user-profile", {
    failOnStatusCode: false,
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    error: "You must be signed in to load this widget.",
  });
});
