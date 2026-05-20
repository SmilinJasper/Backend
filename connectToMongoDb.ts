import mongoose from "mongoose"
import dns from 'node:dns'

dns.setServers(['8.8.8.8', '8.8.4.4'])

export const connectToMongoDb = async (mongoPassword: string) => {

  if(!mongoPassword) {
    console.error('Enter MongoDB password')
    process.exit(1);
  }

  const mongoConnectionUrl = `mongodb+srv://notesUser:${mongoPassword}@notes.qcdamrh.mongodb.net/noteApp?appName=Notes`

  try {
    await mongoose.connect(mongoConnectionUrl, {family: 4})
    console.log('Successfully connected to MongoDB')
  } catch(error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1)
  }

}