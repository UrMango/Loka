import {
  OAuth2Client
} from 'google-auth-library'
import jwt from 'jsonwebtoken'
import {
  getDatabase
} from '../config/database.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function verifyGoogleToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      })
    }
    const token = authHeader.substring(7)
    // Try JWT first (our own tokens)
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture || null
      }
      return next()
    } catch (jwtError) {
      // If JWT fails, try Google token
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()

        // Save or update user in DB
        try {
          const db = getDatabase && getDatabase()
          if (db) {
            const users = db.collection('users')
            const existing = await users.findOne({
              email: payload.email
            })
            if (!existing) {
              // Insert new user
              const newUser = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture || null,
                provider: 'google',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              await users.insertOne(newUser)
            } else {
              // Update name/picture if changed
              await users.updateOne({
                email: payload.email
              }, {
                $set: {
                  name: payload.name,
                  picture: payload.picture || null,
                  updatedAt: new Date().toISOString()
                }
              })
            }
          }
        } catch (dbErr) {
          console.error('Failed to upsert Google user in DB:', dbErr)
        }

        req.user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
        return next()
      } catch (googleError) {
        console.error('Both JWT and Google token verification failed')
        return res.status(401).json({
          error: 'Invalid token'
        })
      }
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return res.status(401).json({
      error: 'Invalid token'
    })
  }
}