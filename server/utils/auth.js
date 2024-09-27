const jwt = require("jsonwebtoken");

// set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  // Function to extract the token from the request (for GraphQL)
  authMiddleware: function ({ req }) {
    // Token can come from the request headers, authorization, or body
    let token = req.body.token || req.query.token || req.headers.authorization;

    // If the token comes from authorization header, remove "Bearer" if present
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    // If no token, return the request without modifying it (no user attached)
    if (!token) {
      return req;
    }

    try {
      // Verify the token and extract user data
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      // Attach the user to the request
      req.user = data;
    } catch (err) {
      console.log("Invalid token");
    }

    // Return the request with or without the user attached
    return req;
  },

  // Function to sign a token (used for login and user creation)
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
