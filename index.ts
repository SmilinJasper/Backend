import express, {type Request, type Response} from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose';
import { connectToMongoDb } from './connectToMongoDb.ts';

connectToMongoDb()

interface INote {
    id?: string;
    content: string;
    important: boolean;
}

interface INewNoteBody {
  content: string;
  important: boolean;
}

const noteSchema = new mongoose.Schema<INote>({
  id: {
    type: String,
    required: false
  },
  content: {
    type: String,
    required: true
  },
  important: {
    type: Boolean,
    required: true
  }
}) 

noteSchema.set('toJSON', {
  transform(document, returnedObject: any) {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const NoteModel = mongoose.model('Note', noteSchema)

const app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (request: Request, response: Response) => {

  const requestBody = request.body
  if(!requestBody || Object.keys(requestBody).length <= 0) return ' '
  
  return JSON.stringify(requestBody)
  
})

app.use(morgan(':url :method :status :res[content-length] - :response-time ms Body: :body'))

app.get('/', (request: Request, response: Response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', async (request: Request, response: Response) => {
    const notes: INote[] = await NoteModel.find({})
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

app.post('/api/notes', async (request: Request<{}, {}, INewNoteBody>, response: Response) => {

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
