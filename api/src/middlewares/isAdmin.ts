import { type Request, type Response, type NextFunction } from 'express'

async function isAdmin (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<any> {
  try {
    const userRole = req.user.role

    if (userRole === 'Admin') {
      next()
    } else {
      res.status(405).json({
        message: 'Forbidden. Only Admins are allowed.'
      })
    }
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized'
    })
  }
}

export default isAdmin
