import mongoose from "mongoose"
import dns from 'node:dns'

dns.setServers(['8.8.8.8', '8.8.4.4'])

export const connectToMongoDb = async () => {

  const mongoConnectionUrl = process.env.MONGODB_URI

  if(!mongoConnectionUrl) {
    console.error('MONGODB_URI environment variable does not exist!')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoConnectionUrl, {family: 4})
    console.log('Successfully connected to MongoDB')
  } catch(error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1)
  }

}