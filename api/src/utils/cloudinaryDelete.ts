import cloudinary from '../config/cloudinaryConfig'

async function cloudinaryDelete (id: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(id)
    if (result.result === 'ok') {
      return { success: true, message: 'File berhasil dihapus dari Cloudinary.' }
    } else {
      return { success: false, error: 'Gagal menghapus file dari Cloudinary.' }
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Terjadi kesalahan dalam penghapusan file.' }
  }
}

export default cloudinaryDelete
