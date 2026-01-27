import { NextResponse } from 'next/server'
import { compareWithFriend } from '@/app/actions/friends'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const friendId = searchParams.get('friendId')

    if (!userId || !friendId) {
      return NextResponse.json({ error: 'Missing userId or friendId' }, { status: 400 })
    }

    const comparison = await compareWithFriend(userId, friendId)
    return NextResponse.json(comparison)
  } catch (error) {
    console.error('Error comparing friends:', error)
    return NextResponse.json({ error: 'Failed to compare friends' }, { status: 500 })
  }
}
