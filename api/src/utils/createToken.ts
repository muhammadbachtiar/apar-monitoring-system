import jwt from 'jsonwebtoken'

interface UserPayload {
  id: string
  email: string
  role: Enumerator
  name: string
  username: string
  expirationTime: string
}

function createToken (payLoad: UserPayload): string {
  const token = jwt.sign(payLoad, process.env.SIGNATURE_KEY ?? 'Rahasia')
  return token
}

export default createToken
