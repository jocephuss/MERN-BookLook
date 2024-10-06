class AuthService {
  // Retrieve the token from localStorage
  getToken() {
    return localStorage.getItem("id_token");
  }

  // Check if the user is logged in (checks if there's a valid token)
  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token); // Validate token existence and expiration
  }

  // Check if the token is expired
  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      return decoded.exp < Date.now() / 1000; // Check if token expiration time has passed
    } catch (err) {
      return false;
    }
  }

  // Log in the user by saving the token to localStorage
  login(idToken) {
    localStorage.setItem("id_token", idToken); // Make sure the token is saved
    window.location.assign("/"); // Redirect user after login
  }

  // Log out the user by removing the token from localStorage
  logout() {
    localStorage.removeItem("id_token"); // Clear token
    window.location.assign("/"); // Redirect user to home
  }
}

export default new AuthService();
