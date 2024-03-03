// multerConfig.ts
import multer from 'multer'

const storage = multer.memoryStorage()

const multerConfig = multer({ storage })

export default multerConfig.array('files', 5)
