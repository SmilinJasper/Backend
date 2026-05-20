import express, {Request, Response} from 'express'
import morgan from 'morgan'
import dns from 'node:dns'
import mongoose from "mongoose"

dns.setServers(['8.8.8.8', '8.8.4.4'])

const connectToMongoDb = async (mongoPassword: string) => {

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

connectToMongoDb(process.argv[2])

interface Note {
    id: string;
    content: string;
    important: boolean;
}

interface NewNoteBody {
  content: string;
  important: boolean;
}

const noteSchema = new mongoose.Schema<Note>({
  content: {
  type: String,
  required: true
  },
  important: {
    type: Boolean,
    required: true
  }
}) 

const NoteModel = mongoose.model('Note', noteSchema)

let notes: Note[] = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

const app = express()
app.use(express.json())

morgan.token('body', (request: Request, response: Response) => {

  const requestBody = request.body
  if(!requestBody || Object.keys(requestBody).length <= 0) return ' '
  
  return JSON.stringify(requestBody)
  
})

app.use(morgan(':url :method :status :res[content-length] - :response-time ms Body: :body'))

app.use(express.static('dist'))

app.get('/', (request: Request, response: Response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request: Request, response: Response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (request: Request, response: Response) => {
  const id = request.params.id
  const note = notes.find(note => note.id === id)
  if(note) return response.json(note)
  response.status(404).end()
})

app.delete('/api/notes/:id', (request: Request, response: Response) => {
  const id = request.params.id
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

app.post('/api/notes', async (request: Request<{}, {}, NewNoteBody>, response: Response) => {

  const {content, important} = request.body

  if(!content || important === undefined) return response.status(400).json({
    'error': 'Missing Content'
  })

  const newNote = new NoteModel({
    content: content,
    important: important
  })

  try {
    await newNote.save()
    console.log('New note saved')
    response.status(201).json(newNote)
  } catch(error) {
    console.error(error)
    response.status(500).json({
      error: 'Failed to save note to database'
    })
  }

})

const PORT: number = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
