const jwt = require("jsonwebtoken");

const secret = "mysecretsshhhhh"; // Your secret key
const expiration = "2h";

module.exports = {
  authMiddleware: function ({ req }) {
    // Get the token from the headers, body, or query
    let token = req.body.token || req.query.token || req.headers.authorization;

    // If the token is in the authorization header, remove the "Bearer " prefix
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return req; // Return the request object without modifying it if no token
    }

    try {
      // Verify the token and extract the user data
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data; // Attach the user to the request
      console.log("Token verified. User:", req.user);
    } catch {
      console.log("Invalid token");
    }

    return req; // Return the modified request object
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
