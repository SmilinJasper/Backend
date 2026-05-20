import express, {Request, Response} from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose';
import { connectToMongoDb } from './connectToMongoDb';

const mongoPassword: string = process.argv[2]
connectToMongoDb(mongoPassword)

interface INote {
    id?: string;
    content: string;
    important: boolean;
}

interface NewNoteBody {
  content: string;
  important: boolean;
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

const NoteModel = mongoose.model('INote', noteSchema)

let notes: INote[] = [
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
    content,
    important
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
