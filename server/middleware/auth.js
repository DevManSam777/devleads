const admin = require('firebase-admin');

// initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // build service account object from your existing environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

const auth = async (req, res, next) => {
  try {
    // check if authorization header exists
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    
    // get the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      // verify token
      console.log('Verifying token...');
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // add user information to request
      req.user = decodedToken;
      console.log(`Authenticated user: ${decodedToken.email || decodedToken.uid}`);
      
      // continue with the request
      return next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(403).json({ message: 'Authentication failed: Invalid token' });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = auth;