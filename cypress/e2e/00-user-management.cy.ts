/// <reference types="cypress" />

describe('User Management with Roles', () => {
  const runId = Date.now().toString().slice(-6)
  const memberSelfUpdatedPassword = 'testpassword123_self'
  const memberAdminUpdatedPassword = 'testpassword123_admin'

  const adminUser = {
    username: `adm_${runId}`,
    email: `admin_${runId}@example.com`,
    password: 'testpassword123',
  }

  const memberUser = {
    username: `mem_${runId}`,
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

  it('allows members to update only their own profile and password', () => {
    const updatedMemberUsername = `${memberUser.username}_self`

    cy.login(memberUser.email, memberUser.password)
    cy.url().should('include', '/dashboard')

    cy.visit('/user-management')
    cy.url().should('include', '/user-management')
    cy.get('[data-cy="admin-user-management-section"]').should('not.exist')

    cy.get('[data-cy="profile-username-input"]').clear().type(updatedMemberUsername)
    cy.get('[data-cy="profile-password-input"]').clear().type(memberSelfUpdatedPassword)
    cy.get('[data-cy="profile-save-button"]').click()
    cy.get('[data-cy="profile-message"]').should('contain', 'updated successfully')

    cy.visit('/dashboard')
    cy.contains(updatedMemberUsername).should('be.visible')

    cy.clearCookies()
    cy.login(memberUser.email, memberUser.password)
    cy.url().should('include', '/login')
    cy.contains('Invalid username/email or password').should('be.visible')

    cy.login(memberUser.email, memberSelfUpdatedPassword)
    cy.url().should('include', '/dashboard')
  })

  it('allows admins to update any user role and password', () => {
    const promotedUsername = `${memberUser.username}_promoted`

    cy.login(adminUser.email, adminUser.password)
    cy.url().should('include', '/dashboard')

    cy.visit('/user-management')
    cy.get('[data-cy="admin-user-management-section"]').should('be.visible')

    cy.get(`[data-cy="admin-username-input-${memberId}"]`).clear().type(promotedUsername)
    cy.get(`[data-cy="admin-role-select-${memberId}"]`).select('Admin')
    cy.get(`[data-cy="admin-password-input-${memberId}"]`).clear().type(memberAdminUpdatedPassword)
    cy.get(`[data-cy="admin-save-button-${memberId}"]`).click()
    cy.get(`[data-cy="admin-message-${memberId}"]`).should('contain', 'updated successfully')

    cy.clearCookies()
    cy.login(memberUser.email, memberSelfUpdatedPassword)
    cy.url().should('include', '/login')
    cy.contains('Invalid username/email or password').should('be.visible')

    cy.login(memberUser.email, memberAdminUpdatedPassword)
    cy.url().should('include', '/dashboard')
    cy.visit('/user-management')

    cy.get('[data-cy="profile-role-input"]').should('have.value', 'Admin')
    cy.get('[data-cy="admin-user-management-section"]').should('be.visible')
    cy.get('[data-cy="profile-username-input"]').should('have.value', promotedUsername)
  })
})
