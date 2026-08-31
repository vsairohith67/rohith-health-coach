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

const completeNavigation = [
  "Today",
  "Trends",
  "Sleep",
  "Heart",
  "Activity",
  "Wellbeing",
  "Coach",
  "Ask my data",
  "Experiments",
  "Reports",
  "Data sources",
  "Imports",
  "iPhone ingestion",
  "Settings",
  "AI controls",
  "Privacy",
  "Methodology",
  "Data dictionary",
  "Welcome",
] as const;

test("complete desktop navigation scrolls and can collapse", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.goto("/today");

  const sidebar = page.getByRole("complementary", { name: "Primary" });
  const navigation = sidebar.getByRole("navigation", {
    name: "All features",
  });
  for (const label of completeNavigation) {
    await expect(navigation.getByRole("link", { name: label })).toHaveCount(1);
  }

  expect(
    await sidebar.locator(".desktop-nav-scroll").evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        scrollable: element.scrollHeight > element.clientHeight,
        overflowY: styles.overflowY,
      };
    }),
  ).toEqual({ scrollable: true, overflowY: "auto" });

  const collapse = page.getByRole("button", { name: "Collapse sidebar" });
  await expect(collapse).toHaveAttribute("aria-expanded", "true");
  await collapse.click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await expect
    .poll(() =>
      sidebar.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBe(84);

  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.locator(".app-shell")).not.toHaveClass(/sidebar-collapsed/);
});

test("mobile menu exposes every feature and closes safely", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/today");
  const menuButton = page.getByRole("button", {
    name: "Open all navigation",
  });
  await menuButton.click();

  const drawer = page.getByRole("dialog", { name: "All features" });
  await expect(drawer).toBeVisible();
  const closeButton = drawer.getByRole("button", {
    name: "Close navigation",
  });
  await expect(closeButton).toBeFocused();
  await expect(page.getByRole("main")).toHaveAttribute("inert", "");
  const navigation = drawer.getByRole("navigation", { name: "All features" });
  for (const label of completeNavigation) {
    await expect(navigation.getByRole("link", { name: label })).toHaveCount(1);
  }
  const accessibility = await new AxeBuilder({ page })
    .include(".mobile-navigation-drawer")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);

  await page.keyboard.press("Shift+Tab");
  expect(
    await drawer.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(menuButton).toBeFocused();
  await expect(page.getByRole("main")).not.toHaveAttribute("inert", "");

  await menuButton.click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("main")).not.toHaveAttribute("inert", "");
  await expect(
    page.getByRole("link", { name: "Rohith Health Coach home" }),
  ).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");

  await page.setViewportSize({ width: 390, height: 844 });
  await menuButton.click();

  const ingestionLink = navigation.getByRole("link", {
    name: "iPhone ingestion",
  });
  await ingestionLink.scrollIntoViewIfNeeded();
  expect(
    await drawer
      .locator(".mobile-navigation-scroll")
      .evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0);
  await ingestionLink.click();
  await expect(
    page.getByRole("heading", { name: "iPhone ingestion" }),
  ).toBeVisible();
  await expect(drawer).toBeHidden();
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

test("Demo Mode cannot issue a Production ingestion credential", async ({
  page,
}) => {
  await page.goto("/settings/ingestion");
  await expect(
    page.getByRole("heading", { name: "iPhone ingestion" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "No Production credential can be created here",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create one-time credential" }),
  ).toHaveCount(0);
});

test("RC5 synthetic source diagnostics fail closed", async ({ page }) => {
  await page.goto("/data-sources");
  await expect(
    page.getByRole("heading", { name: "Source arbitration diagnostic" }),
  ).toBeVisible();
  await expect(page.getByText("4,861 steps")).toHaveCount(2);
  await expect(page.getByText("8,148 steps")).toBeVisible();
  await expect(
    page.getByText(/13,009-step total was not produced/),
  ).toBeVisible();
  await expect(page.getByText("Loading source coverage…")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  for (const state of [
    "No synthetic records yet",
    "partial day",
    "stale",
    "Body Battery unavailable",
    "No total · source conflict",
  ]) {
    await expect(page.getByText(new RegExp(state))).toBeVisible();
  }
  expect(
    await page.evaluate(() => document.body.scrollWidth <= window.innerWidth),
  ).toBe(true);
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
    await page.waitForLoadState("networkidle");
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

    await page.goto("/data-sources");
    await expect(
      page.getByRole("heading", { name: "Source arbitration diagnostic" }),
    ).toBeVisible();
    await expect(
      page.getByText(/13,009-step total was not produced/),
    ).toBeVisible();
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
