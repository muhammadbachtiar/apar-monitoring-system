import bcrypt from 'bcrypt'

export async function checkPassword (encryptedPassword: string, password: string): Promise<boolean> {
  return await new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err: any, isPasswordCorrect: boolean) => {
      if (err) {
        reject(err)
        return
      }
      resolve(isPasswordCorrect)
    })
  })
}

export default checkPassword
