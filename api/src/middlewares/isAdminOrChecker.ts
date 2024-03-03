import { type Request, type Response, type NextFunction } from 'express'

async function isAdminOrChecker (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<any> {
  try {
    const userRole = req.user.role

    if (userRole === 'Admin' || userRole === 'Checker') {
      next()
    } else {
      res.status(405).json({
        message: 'Forbidden. Only Admins or Checkers are allowed.'
      })
    }
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized'
    })
  }
}

export default isAdminOrChecker
