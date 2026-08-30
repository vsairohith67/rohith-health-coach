import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Today dashboard is deterministic, complete, and responsive", async ({
  page,
}) => {
  await page.goto("/today");
  await expect(page.getByRole("status")).toContainText("Demo data");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A steadier day starts with a lighter plan.",
  );
  await expect(page.getByText("1 action", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Sleep duration across 14 synthetic days/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.body.scrollWidth <= window.innerWidth),
  ).toBe(true);
});

test("Ask My Data handles a bounded missing-data question", async ({
  page,
}) => {
  await page.goto("/ask");
  await page
    .getByRole("button", { name: "Which days have missing data?" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Missing sleep data in the last 14 days",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Missing values were not converted to zero."),
  ).toBeVisible();
  await expect(page.getByText("Raw heart samples")).toBeVisible();
  expect(
    await page.evaluate(() => document.body.scrollWidth <= window.innerWidth),
  ).toBe(true);
});

test("@a11y Today and Ask have no serious Axe violations", async ({ page }) => {
  for (const route of ["/today", "/ask"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
    ).toEqual([]);
  }
});

test("@visual layout tokens and mobile navigation remain stable", async ({
  page,
}, testInfo) => {
  await page.goto("/today");
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      background: root.getPropertyValue("--background").trim(),
      teal: root.getPropertyValue("--teal").trim(),
      radius: root.getPropertyValue("--radius").trim(),
    };
  });
  expect(tokens).toMatchObject({ radius: "12px" });
  expect(["#f8f6ef", "#101a20"]).toContain(tokens.background);
  expect(["#0c6765", "#62bbb5"]).toContain(tokens.teal);
  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach("today-viewport", {
    body: screenshot,
    contentType: "image/png",
  });
});

test("PWA manifest and offline shell assets are present", async ({
  request,
}) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  await expect(manifest.json()).resolves.toMatchObject({
    name: "Rohith Health Coach",
    display: "standalone",
    start_url: "/today",
  });
  const serviceWorker = await request.get("/sw.js");
  expect(serviceWorker.ok()).toBe(true);
  const source = await serviceWorker.text();
  expect(source).toContain("/manifest.webmanifest");
  expect(source).toContain('request.url.includes("/api/")');
  expect(source).toContain('request.destination === "document"');
  expect(source).toContain("CLEAR_PRIVATE_CACHE");
});

const exactViewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

test("@visual exact viewport matrix keeps core flows usable", async ({
  page,
}) => {
  for (const viewport of exactViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/today");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Demo data");
    expect(
      await page.evaluate(() => document.body.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (viewport.width <= 820) {
      await expect(
        page.getByRole("navigation", { name: "Primary mobile navigation" }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("complementary", { name: "Primary" }),
      ).toBeVisible();
    }

    await page.goto("/ask");
    await page
      .getByRole("button", { name: "Which days have missing data?" })
      .click();
    await expect(
      page.getByText("Missing values were not converted to zero."),
    ).toBeVisible();
    await expect(page.getByText("Provider:")).toContainText(
      "Deterministic only",
    );
    expect(
      await page.evaluate(() => document.body.scrollWidth <= window.innerWidth),
    ).toBe(true);

    await page.goto("/settings/ai");
    await expect(
      page.getByRole("heading", { name: "Deterministic by default" }),
    ).toBeVisible();
    await expect(page.getByText("Consent state: not granted.")).toBeVisible();
    expect(
      await page.evaluate(() => document.body.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

test("@visual dark and reduced-motion preferences preserve the privacy state", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/settings/ai");
  const state = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      background: root.getPropertyValue("--background").trim(),
      motion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
  });
  expect(state).toEqual({ background: "#101a20", motion: true });
  await expect(page.getByText("External providers disabled")).toBeDisabled();
  await expect(page.getByText("Consent state: not granted.")).toBeVisible();
});
