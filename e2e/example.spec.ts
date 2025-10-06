/* eslint-disable testing-library/prefer-screen-queries */

import { test, expect } from "@playwright/test"

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080")
  })

  test("should have correct metadata and elements", async ({ page }) => {
    await expect(page).toHaveTitle("Tank Adiban")
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible()
  })

  test("should redirect to Kanban page on click", async ({ page }) => {
    await page.getByRole("button", { name: /sign up/i }).click()

    await page.getByPlaceholder("Username").fill("zahra")
    await page.getByPlaceholder("Password").fill("123")

    await page.getByRole("button", { name: /^sign up$/i }).click()

    await expect(page).toHaveURL(/\/kanbanBoard$/)
  })
})

test.describe("Kanban Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("session", "test-user")
      localStorage.removeItem("kanban")
    })

    await page.goto("http://localhost:8080/kanbanBoard")
  })

  test("should have correct elements", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "React Kanban Board" })).toBeVisible()
    await expect(page.getByPlaceholder("New board title")).toBeVisible()
    await expect(page.getByRole("button", { name: "Add Board" })).toBeVisible()
  })

  // test("should add a new board and display it", async ({ page }) => {
  //   await expect(page.getByPlaceholder("New board title")).toBeVisible()

  //   const input = page.getByPlaceholder("New board title")
  //   await input.fill("My First Board")

  //   await page.getByRole("button", { name: "Add Board" }).click()

  //   const boards = page.getByTestId("board")
  //   await expect(boards).toHaveCount(1)

  //   const lastBoard = boards.last()
  //   await expect(lastBoard).toBeVisible()

  //   const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("kanban") || "{}"))
  //   expect(stored.boards.length).toBe(1)
  //   expect(stored.boards[0].title).toBe("My First Board")
  // })
})
