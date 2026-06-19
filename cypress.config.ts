import { defineConfig } from "cypress";
import { prisma } from "./lib/prisma";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    // Pages take 25-35s to compile with Turbopack on first load
    defaultCommandTimeout: 30000,   // 30s for element assertions (cy.contains, cy.get, etc.)
    pageLoadTimeout: 120000,        // 120s for page navigation (cy.visit)
    requestTimeout: 30000,          // 30s for network requests
    responseTimeout: 60000,         // 60s for server responses
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,       // Allow cross-origin requests in tests
    setupNodeEvents(on, config) {
      on('task', {
        async getActivityIdByTitle(title: string) {
          try {
            const activity = await prisma.activities.findFirst({
              where: { title },
              select: { id: true }
            });
            return activity ? activity.id : null;
          } catch (error) {
            console.error("Error in getActivityIdByTitle task:", error);
            return null;
          }
        }
      });
    },
    supportFile: "cypress/support/e2e.ts",
  },
});
