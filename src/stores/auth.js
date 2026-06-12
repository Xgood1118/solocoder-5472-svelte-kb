import { writable, derived } from 'svelte/store'

function createAuthStore() {
  const token = localStorage.getItem('kb_token') || ''
  const userInfo = JSON.parse(localStorage.getItem('kb_user') || 'null')

  const { subscribe, set, update } = writable({
    token,
    user: userInfo,
    isLoggedIn: !!token
  })

  return {
    subscribe,
    login: (token, user) => {
      localStorage.setItem('kb_token', token)
      localStorage.setItem('kb_user', JSON.stringify(user))
      set({ token, user, isLoggedIn: true })
    },
    logout: () => {
      localStorage.removeItem('kb_token')
      localStorage.removeItem('kb_user')
      set({ token: '', user: null, isLoggedIn: false })
    }
  }
}

export const auth = createAuthStore()

export const currentUser = derived(auth, $auth => $auth.user)
export const isLoggedIn = derived(auth, $auth => $auth.isLoggedIn)
