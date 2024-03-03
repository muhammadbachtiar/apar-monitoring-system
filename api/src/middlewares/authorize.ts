import { UserModel } from '../models/user'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import type express from 'express'

type Request = express.Request
type Response = express.Response
type NextFunction = express.NextFunction

async function isTokenAuthorized (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<any> {
  try {
    const currentTimestamp = Date.now()
    const bearerToken = req.headers.authorization
    const token = bearerToken?.split('Bearer ')?.[1] ?? ''
    const tokenPayload = jwt.verify(token, process.env.SIGNATURE_KEY ?? 'Rahasia') as JwtPayload

    const expirationTime = new Date(tokenPayload.expirationTime as string).getTime()
    if (currentTimestamp > expirationTime) {
      return res.status(400).json({
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired. You are Unauthorized'
      })
    }

    req.user = await UserModel.query().findById(tokenPayload.id as string)
    next()
  } catch (error) {
    return res.status(400).json({
      error: 'INVALID_TOKEN',
      message: 'Token is not recognized. You are Unauthorized'
    })
  }
}

export default isTokenAuthorized
