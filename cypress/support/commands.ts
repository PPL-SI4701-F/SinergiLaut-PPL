/// <reference types="cypress" />

const SUPABASE_URL      = 'https://vgjqnmoydwhyryihttys.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnanFubW95ZHdoeXJ5aWh0dHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzA1MDYsImV4cCI6MjA5MTgwNjUwNn0.MII_hVvQd_Ukda-xz0d11mVtoDzSCh3GJwS0tipTKRM'
const COOKIE_NAME       = 'sb-vgjqnmoydwhyryihttys-auth-token'

/**
 * Login ke Supabase via REST API (bukan UI).
 * Menghasilkan token nyata sehingga Next.js middleware menerimanya.
 */
Cypress.Commands.add('loginViaApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(
        `Login gagal (${response.status}): ${response.body?.error_description ?? 'Unknown error'}`
      )
    }
    // Set cookie dengan session nyata — middleware Next.js akan menerimanya
    cy.setCookie(COOKIE_NAME, JSON.stringify(response.body), {
      path: '/',
      sameSite: 'lax',
    })
  })
})

// TypeScript declaration
declare global {
  namespace Cypress {
    interface Chainable {
      loginViaApi(email: string, password: string): Chainable<void>
    }
  }
}
