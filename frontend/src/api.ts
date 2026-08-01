export const API_BASE = '/api';

export function getOwnerToken(): string {
  let token = localStorage.getItem('pastebin_owner_token');
  if (!token) {
    token = 'ot_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('pastebin_owner_token', token);
  }
  return token;
}

export function getGuestUser(): { username: string; id: string } {
  let guestId = localStorage.getItem('pastebin_guest_id');
  if (!guestId) {
    guestId = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem('pastebin_guest_id', guestId);
  }
  return {
    id: getOwnerToken(),
    username: `Guest_${guestId}`,
  };
}

export function getAuthToken(): string | null {
  return localStorage.getItem('pastebin_jwt');
}

export function setAuthToken(token: string) {
  localStorage.setItem('pastebin_jwt', token);
}

export function removeAuthToken() {
  localStorage.removeItem('pastebin_jwt');
}
