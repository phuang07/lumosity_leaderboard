/// <reference types="cypress" />

describe('User Management with Roles', () => {
  const runId = Date.now()

  const adminUser = {
    username: `admin_${runId}`,
    email: `admin_${runId}@example.com`,
    password: 'testpassword123',
  }

  const memberUser = {
    username: `member_${runId}`,
    email: `member_${runId}@example.com`,
    password: 'testpassword123',
  }

  let memberId = ''

  before(() => {
    cy.register(adminUser.username, adminUser.email, adminUser.password)
    cy.url().should('include', '/dashboard')
    cy.clearCookies()

    cy.register(memberUser.username, memberUser.email, memberUser.password)
    cy.url().should('include', '/dashboard')
    cy.request('/api/auth/current').then((response) => {
      memberId = response.body.id as string
    })
    cy.clearCookies()
  })

  it('allows members to update only their own profile', () => {
    const updatedMemberUsername = `${memberUser.username}_self`

    cy.login(memberUser.email, memberUser.password)
    cy.url().should('include', '/dashboard')

    cy.visit('/user-management')
    cy.url().should('include', '/user-management')
    cy.get('[data-cy="admin-user-management-section"]').should('not.exist')

    cy.get('[data-cy="profile-username-input"]').clear().type(updatedMemberUsername)
    cy.get('[data-cy="profile-save-button"]').click()
    cy.get('[data-cy="profile-message"]').should('contain', 'updated successfully')

    cy.visit('/dashboard')
    cy.contains(updatedMemberUsername).should('be.visible')
  })

  it('allows admins to update any user and change their role', () => {
    const promotedUsername = `${memberUser.username}_promoted`

    cy.login(adminUser.email, adminUser.password)
    cy.url().should('include', '/dashboard')

    cy.visit('/user-management')
    cy.get('[data-cy="admin-user-management-section"]').should('be.visible')

    cy.get(`[data-cy="admin-username-input-${memberId}"]`).clear().type(promotedUsername)
    cy.get(`[data-cy="admin-role-select-${memberId}"]`).select('Admin')
    cy.get(`[data-cy="admin-save-button-${memberId}"]`).click()
    cy.get(`[data-cy="admin-message-${memberId}"]`).should('contain', 'updated successfully')

    cy.clearCookies()
    cy.login(memberUser.email, memberUser.password)
    cy.url().should('include', '/dashboard')
    cy.visit('/user-management')

    cy.get('[data-cy="profile-role-input"]').should('have.value', 'Admin')
    cy.get('[data-cy="admin-user-management-section"]').should('be.visible')
    cy.get('[data-cy="profile-username-input"]').should('have.value', promotedUsername)
  })
})
