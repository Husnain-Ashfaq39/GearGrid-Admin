// src/appwrite/Services/authServices.js

import { account } from "../config";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';



// Utility function to decode JWT and extract roles
const getUserRolesFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    // Assuming the role is stored as a string in the token
    return [decoded.role];
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return [];
  }
};

// Handle successful login
const handleSuccessfulLogin = async (session) => {
  localStorage.setItem("authToken", session);
  
  // Decode the JWT to get user roles
  const userRoles = getUserRolesFromToken(session);
  
  if (!userRoles || userRoles.length === 0) {
    // If no roles are found, you might want to handle it differently
    // For example, you can log out the user or assign default roles
    throw new Error("User has no roles assigned.");
  }

  // Store user roles
  localStorage.setItem("userRoles", JSON.stringify(userRoles));
};

export const signIn = async (email, password) => {
  try {
    // Clear existing session data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRoles");

    // Authenticate the user by calling the custom login API
    const { session, userId } = await axios.post('http://localhost:5001/api/auth/login', { // Replace with your actual login endpoint
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!session.ok) {
      console.log();
      
    }

    // Store the session and userId
    localStorage.setItem("authToken", session);
    localStorage.setItem("userId", userId);

    // Fetch current user data
    const userResponse = await axios.get(`http://localhost:5001/user/getUser/${userId}`, { // Replace with your actual user endpoint
      headers: {
        'Authorization': `Bearer ${session}`
      }
    });

    if (userResponse.status !== 200) {
      console.log(userResponse);
    }
    // Change _id to $id in the response
    const userResponseData = userResponse
    userResponseData.$id = userResponseData._id;
    delete userResponseData._id;

    // // Check if MFA is required but not enabled
    // if (user.prefs && user.prefs.mfaRequired && !user.prefs.mfaEnabled) {
    //   return {
    //     session,
    //     userId,
    //     requiresMfaSetup: true,
    //   };
    // }

    // Handle successful login (e.g., store roles)
    await handleSuccessfulLogin(session);

    return {
      session,
      userId,
      roles: JSON.parse(localStorage.getItem("userRoles")),
    };

  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await axios.get(`http://localhost:5001/user/getUser/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

export const checkAuth = () => {
  const userId = localStorage.getItem('userId');
  return !!userId;
};





































/**
 * Creates an MFA challenge for the user.
 * @param {string} factor - The MFA factor to use ('email', 'phone', 'totp', 'recoverycode').
 * @returns {Promise<Object>} The challenge object.
 */
export const createMfaChallenge = async (factor) => {
  try {
    const challenge = await account.createMfaChallenge(factor);
    return challenge;
  } catch (error) {
    console.error("Error creating MFA challenge:", error);
    throw error;
  }
};

/**
 * Completes the MFA challenge by verifying the code.
 * @param {string} challengeId - The challenge ID.
 * @param {string} code - The code provided by the user.
 * @returns {Promise<Object>} The user object after successful verification.
 */
export const completeMfaChallenge = async (challengeId, code) => {
  try {
    await account.updateMfaChallenge(challengeId, code);

    // Fetch user to confirm authentication
    const user = await account.get();

    // Handle successful login
    await handleSuccessfulLogin({ $id: 'current', userId: user.$id });

    return {
      userId: user.$id,
      roles: JSON.parse(localStorage.getItem("userRoles")),
    };
  } catch (error) {
    console.error("Error completing MFA challenge:", error);
    throw error;
  }
};

/**
 * Enables MFA on the user's account.
 * @returns {Promise<void>}
 */
export const enableMfa = async () => {
  try {
    await account.updateMFA(true);
  } catch (error) {
    console.error("Error enabling MFA:", error);
    throw error;
  }
};

/**
 * Generates recovery codes for the user.
 * @returns {Promise<Array>} An array of recovery codes.
 */
export const generateRecoveryCodes = async () => {
  try {
    const response = await account.createMfaRecoveryCodes();
    return response.recoveryCodes;
  } catch (error) {
    console.error("Error generating recovery codes:", error);
    throw error;
  }
};

/**
 * Updates user preferences.
 * @param {Object} prefs - The preferences to update.
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (prefs) => {
  try {
    await account.updatePrefs(prefs);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRoles");
  } catch (error) {
    throw error;
  }
};



export const sendPasswordRecoveryEmail = async (email) => {
  const resetPasswordUrl = `${window.location.origin}/reset-password`;
  try {
    await account.createRecovery(email, resetPasswordUrl);
  } catch (error) {
    throw error;
  }
};
