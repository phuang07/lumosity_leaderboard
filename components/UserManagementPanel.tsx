'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateUser } from '@/app/actions/users'

type Role = 'ADMIN' | 'MEMBER'

type ManagedUser = {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  role: Role
}

type EditableManagedUser = {
  id: string
  username: string
  email: string
  avatarUrl: string
  role: Role
  newPassword: string
}

type MessageState = {
  type: 'success' | 'error'
  text: string
} | null

interface UserManagementPanelProps {
  currentUser: ManagedUser
  users: ManagedUser[]
}

function normalizeUserForForm(user: ManagedUser): EditableManagedUser {
  return {
    ...user,
    avatarUrl: user.avatarUrl || '',
    newPassword: '',
  }
}

export default function UserManagementPanel({ currentUser, users }: UserManagementPanelProps) {
  const router = useRouter()
  const isAdmin = currentUser.role === 'ADMIN'

  const [profileForm, setProfileForm] = useState<EditableManagedUser>(() => normalizeUserForForm(currentUser))
  const [profileMessage, setProfileMessage] = useState<MessageState>(null)
  const [isProfilePending, startProfileTransition] = useTransition()

  const [adminUsers, setAdminUsers] = useState<EditableManagedUser[]>(() => users.map(normalizeUserForForm))
  const [adminMessages, setAdminMessages] = useState<Record<string, MessageState>>({})
  const [savingAdminUserId, setSavingAdminUserId] = useState<string | null>(null)
  const [isAdminPending, startAdminTransition] = useTransition()

  const sortedAdminUsers = useMemo(
    () => [...adminUsers].sort((a, b) => a.username.localeCompare(b.username)),
    [adminUsers]
  )

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage(null)

    startProfileTransition(async () => {
      const result = await updateUser({
        userId: profileForm.id,
        username: profileForm.username,
        email: profileForm.email,
        avatarUrl: profileForm.avatarUrl,
        ...(profileForm.newPassword.length > 0 ? { password: profileForm.newPassword } : {}),
      })

      if (!result.success || !result.updatedUser) {
        setProfileMessage({
          type: 'error',
          text: result.message,
        })
        return
      }

      const updatedFormUser = normalizeUserForForm(result.updatedUser)
      setProfileForm(updatedFormUser)
      setAdminUsers((prev) => prev.map((user) => (user.id === updatedFormUser.id ? updatedFormUser : user)))
      setProfileMessage({
        type: 'success',
        text: result.message,
      })

      router.refresh()
    })
  }

  const handleAdminFieldChange = (
    userId: string,
    field: 'username' | 'email' | 'avatarUrl' | 'role' | 'newPassword',
    value: string
  ) => {
    setAdminUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user

        if (field === 'role') {
          return { ...user, role: value as Role }
        }

        return { ...user, [field]: value }
      })
    )
  }

  const handleAdminSave = (userId: string) => {
    if (!isAdmin) return

    const targetUser = adminUsers.find((user) => user.id === userId)
    if (!targetUser) return

    setAdminMessages((prev) => ({
      ...prev,
      [userId]: null,
    }))

    setSavingAdminUserId(userId)
    startAdminTransition(async () => {
      const result = await updateUser({
        userId: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        avatarUrl: targetUser.avatarUrl,
        role: targetUser.role,
        ...(targetUser.newPassword.length > 0 ? { password: targetUser.newPassword } : {}),
      })

      if (!result.success || !result.updatedUser) {
        setAdminMessages((prev) => ({
          ...prev,
          [userId]: {
            type: 'error',
            text: result.message,
          },
        }))
        setSavingAdminUserId(null)
        return
      }

      const updatedFormUser = normalizeUserForForm(result.updatedUser)
      setAdminUsers((prev) => prev.map((user) => (user.id === updatedFormUser.id ? updatedFormUser : user)))

      if (updatedFormUser.id === profileForm.id) {
        setProfileForm(updatedFormUser)
      }

      setAdminMessages((prev) => ({
        ...prev,
        [userId]: {
          type: 'success',
          text: result.message,
        },
      }))

      setSavingAdminUserId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-xl shadow-sm p-6" data-cy="profile-form-section">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your account information, including password changes.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4" data-cy="profile-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              data-cy="profile-username-input"
              type="text"
              value={profileForm.username}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              minLength={3}
              maxLength={20}
              required
              disabled={isProfilePending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              data-cy="profile-email-input"
              type="email"
              value={profileForm.email}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              required
              disabled={isProfilePending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL (optional)</label>
            <input
              data-cy="profile-avatar-input"
              type="url"
              value={profileForm.avatarUrl}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              placeholder="https://example.com/avatar.png"
              disabled={isProfilePending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password (optional)</label>
            <input
              data-cy="profile-password-input"
              type="password"
              value={profileForm.newPassword}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter a new password"
              minLength={6}
              autoComplete="new-password"
              disabled={isProfilePending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              data-cy="profile-role-input"
              type="text"
              value={profileForm.role === 'ADMIN' ? 'Admin' : 'Member'}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              readOnly
            />
          </div>

          {profileMessage && (
            <div
              data-cy="profile-message"
              className={`p-3 rounded-lg text-sm ${
                profileMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <button
            data-cy="profile-save-button"
            type="submit"
            disabled={isProfilePending}
            className="bg-primary text-white py-2.5 px-5 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isProfilePending ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {isAdmin && (
        <section className="bg-white rounded-xl shadow-sm p-6" data-cy="admin-user-management-section">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Admin User Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              As an admin, you can edit any user profile, update roles, and change passwords.
            </p>
          </div>

          <div className="space-y-4">
            {sortedAdminUsers.map((user) => {
              const message = adminMessages[user.id]
              const isSavingThisUser = isAdminPending && savingAdminUserId === user.id

              return (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4"
                  data-cy={`admin-user-card-${user.id}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        data-cy={`admin-username-input-${user.id}`}
                        type="text"
                        value={user.username}
                        onChange={(event) => handleAdminFieldChange(user.id, 'username', event.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        minLength={3}
                        maxLength={20}
                        required
                        disabled={isSavingThisUser}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        data-cy={`admin-email-input-${user.id}`}
                        type="email"
                        value={user.email}
                        onChange={(event) => handleAdminFieldChange(user.id, 'email', event.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        required
                        disabled={isSavingThisUser}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                      <input
                        data-cy={`admin-avatar-input-${user.id}`}
                        type="url"
                        value={user.avatarUrl}
                        onChange={(event) => handleAdminFieldChange(user.id, 'avatarUrl', event.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        placeholder="https://example.com/avatar.png"
                        disabled={isSavingThisUser}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        data-cy={`admin-password-input-${user.id}`}
                        type="password"
                        value={user.newPassword}
                        onChange={(event) => handleAdminFieldChange(user.id, 'newPassword', event.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        placeholder="Leave blank to keep current password"
                        minLength={6}
                        autoComplete="new-password"
                        disabled={isSavingThisUser}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        data-cy={`admin-role-select-${user.id}`}
                        value={user.role}
                        onChange={(event) => handleAdminFieldChange(user.id, 'role', event.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        disabled={isSavingThisUser}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-500">
                      User ID: <span className="font-mono">{user.id}</span>
                    </p>
                    <button
                      data-cy={`admin-save-button-${user.id}`}
                      type="button"
                      onClick={() => handleAdminSave(user.id)}
                      disabled={isSavingThisUser}
                      className="bg-primary text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {isSavingThisUser ? 'Saving...' : 'Save User'}
                    </button>
                  </div>

                  {message && (
                    <div
                      data-cy={`admin-message-${user.id}`}
                      className={`mt-3 p-2 rounded text-sm ${
                        message.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
