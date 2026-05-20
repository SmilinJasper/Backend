// const mongoose = require('mongoose')
const dns = require('node:dns')

dns.setServers(['8.8.8.8', '8.8.4.4'])

if(process.argv.length < 3){
    console.log('Please enter password')
    process.exit(1)
} 

const password = process.argv[2]

const connectionUrl = `mongodb+srv://notesUser:${password}@notes.qcdamrh.mongodb.net/noteApp?appName=Notes`

mongoose.set('strictQuery', false)

mongoose.connect(connectionUrl, {family: 4})

interface INote {
    content: string,
    important: boolean
}

const noteSchema = new mongoose.Schema<INote>({
    content: { 
        type: String, 
        required: true 
    },
    important: { 
        type: Boolean, 
        required: true 
    }
})

const Note = mongoose.model<INote>('Note', noteSchema)

const newNote = new Note({
    content: 'testy',
    important: true
}) 

newNote.save().then((result) => {
    console.log('saved')
    mongoose.connection.close()
})
