import { UserModel } from '../models/user'
import { type Request, type Response } from 'express'
import checkPassword from '../utils/checkPassword'
import createToken from '../utils/createToken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const login = async (req: Request, res: Response): Promise<void> => {
  const username: string = String(req.body.username).toLowerCase()
  const password: string = req.body.password
  const currentTime = new Date()
  const expirationTime = new Date(currentTime.getTime() + 10 * 60 * 60 * 1000)

  const userLogin = await UserModel.query().findOne({ username })

  if (!userLogin) {
    res.status(404).json({
      error: 'INVALID_USERNAME',
      message: 'username is not found on the database'
    })
    return
  }

  const isPasswordCorrect = await checkPassword(
    userLogin.password,
    password
  )

  if (!isPasswordCorrect) {
    res.status(401).json({
      error: 'INVALID_PASSWORD',
      message: 'password inserted is not correct with the record on database'
    })
    return
  }

  const token = createToken({
    id: userLogin.id,
    email: userLogin.email,
    role: userLogin.role,
    name: userLogin.name,
    username: userLogin.username,
    expirationTime: expirationTime.toISOString()
  })

  res.status(200).json({
    message: 'user verified, login successful',
    token
  })
}

const register = async (req: Request, res: Response): Promise<void> => {
  const username: string = String(req.body.username).toLowerCase()
  const password: string = req.body.password
  const email: string = req.body.email
  const name: string = req.body.name
  const role: Enumerator = req.body.role

  const existingUser = await UserModel.query().findOne({ username })

  if (existingUser) {
    res.status(400).json({
      error: 'INVALID_USERNAME',
      message: 'Username is already exists. Please use a different email.'
    })
    return
  }
  const existingEmail = await UserModel.query().findOne({ email })

  if (existingEmail) {
    res.status(400).json({
      error: 'INVALID_EMAIL',
      message: 'Email is already exists. Please use a different email.'
    })
    return
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const uniqueId = uuidv4()

    const registeredUser = await UserModel.query().insert({
      id: uniqueId,
      username,
      email,
      password: hashedPassword,
      role,
      name,
      registered_time: new Date()
    }).returning('*')

    res.status(201).json({
      message: 'Register Success, New Account Created',
      userInfromation: registeredUser
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const authUserInfo = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  res.status(200).json(req.user)
}

const getUserById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id
  const filterById = await UserModel.query().findById(userId)

  if (filterById === null || filterById === undefined) {
    res.status(404).json({
      error: 'INVALID_ID',
      message: 'No user data found by that id'
    })
    return
  }

  res.status(201).json({
    message: 'Success Get user Data by ID',
    data: filterById
  })
}

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const allUsers = await UserModel.query()

  res.status(201).json({
    message: 'Succsesfully get all users data',
    data: allUsers
  })
}

const updateUser = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  interface RequestBodyType {
    email: string
    password: string
    role: Enumerator<['Admin', 'Viewer', 'Checker']>
    name: string
  }
  const userIdToUpdate = req.params.id
  try {
    const userToUpdate = await UserModel.query().findById(userIdToUpdate)
    const { email, password, name, role }: RequestBodyType = req.body

    if (userToUpdate === null || userToUpdate === undefined) {
      res.status(404).json({ error: 'INVALID_ID', message: 'No user data found by that id' })
      return
    }

    if (email && email !== userToUpdate.email) {
      const existingEmail = await UserModel.query().findOne({ email })
      if (existingEmail) {
        res.status(400).json({
          error: 'INVALID_EMAIL',
          message: 'Email already used. Please use a different email.'
        })
        return
      }
      await UserModel.query().patchAndFetchById(userIdToUpdate, { email })
    }

    if (password) {
      const isPasswordCorrect = await checkPassword(
        userToUpdate.password,
        password
      )

      if (isPasswordCorrect) {
        res.status(401).json({
          error: 'INVALID_PASSWORD',
          message: 'The new password should diffrent from old password'
        })
        return
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      await UserModel.query().patchAndFetchById(userIdToUpdate, { password: hashedPassword })
    }
    if (name && name !== userToUpdate.name) {
      if (name.length < 3 || name.length > 25) {
        res.status(400).json({
          error: 'INVALID_NEW_NAME',
          message: 'The name must consist of between 3 to 25 characters'
        })
        return
      }
      await UserModel.query().patchAndFetchById(userIdToUpdate, { name })
    }
    if (role && role !== userToUpdate.role) {
      await UserModel.query().patchAndFetchById(userIdToUpdate, { role })
    }

    res.status(200).json({
      message: 'Success Update User Data'
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const updateProfile = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const userIdToUpdate: string = req.user.id
  const userPasswordToUpdate: string = req.user.password

  interface RequestBodyType {
    email: string
    oldPassword: string
    newPassword: string
    name: string
  }

  try {
    const userToUpdate = await UserModel.query().findById(userIdToUpdate)
    const { email, oldPassword, newPassword, name }: RequestBodyType = req.body

    if (userToUpdate === null || userToUpdate === undefined) {
      res.status(404).json({ error: 'INVALID_ID', message: 'No user data found by that id' })
      return
    }

    if (email) {
      const existingEmail = await UserModel.query().findOne({ email })
      if (existingEmail) {
        res.status(400).json({
          error: 'INVALID_EMAIL',
          message: 'Email already used. Please use a different email.'
        })
        return
      }
      await UserModel.query().patchAndFetchById(userIdToUpdate, { email })
      res.status(200).json({
        message: 'Success Update Email Data'
      })
    }

    if (newPassword || oldPassword) {
      if (!newPassword || !oldPassword) {
        res.status(401).json({
          error: 'INVALID_INPUT',
          message: 'input data is not complete'
        })
        return
      }
      const isPasswordCorrect = await checkPassword(
        userPasswordToUpdate,
        oldPassword
      )

      if (!isPasswordCorrect) {
        res.status(401).json({
          error: 'INVALID_PASSWORD',
          message: 'The old password inserted is not correct with the record on database'
        })
        return
      }
      if (oldPassword === newPassword) {
        res.status(400).json({
          error: 'INVALID_NEW_PASSWORD',
          message: 'New password should be different from old password'
        })
        return
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await UserModel.query().patchAndFetchById(userIdToUpdate, { password: hashedPassword })
      res.status(200).json({
        message: 'Success Update Password Data'
      })
    }
    if (name) {
      if (name.length < 3 || name.length > 25) {
        res.status(400).json({
          error: 'INVALID_NEW_NAME',
          message: 'The name must consist of between 3 to 25 characters'
        })
        return
      }
      await UserModel.query().patchAndFetchById(userIdToUpdate, { name })
      res.status(200).json({
        message: 'Success Update Name Data'
      })
    }
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const deleteUser = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    const userToDelete = await UserModel.query().findById(userId)

    if (!userToDelete) {
      res.status(404).json({
        error: 'INVALID_ID',
        message: 'No user data found by that id'
      })
      return
    }

    await UserModel.query().deleteById(userId)

    res.status(200).json({
      message: 'User deleted successfully'
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

export default {
  login,
  register,
  authUserInfo,
  getAllUsers,
  getUserById,
  updateUser,
  updateProfile,
  deleteUser
}
