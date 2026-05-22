import express, {type Request, type Response} from 'express'
import morgan from 'morgan'
import { connectToMongoDb } from './connectToMongoDb.ts';
import { Note, type INote} from './models/note.ts'
import { INewNoteBody } from './types.ts';

connectToMongoDb()

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

  try {
    const notes: INote[] = await Note.find({})
    response.json(notes)
  } catch {
    response.status(500).json({'error': 'Failed to fetch notes from database'})
  }

})

app.get('/api/notes/:id', async (request: Request, response: Response) => {
  
  const id = request.params.id

  try {
    const note = await Note.findById(id)
    if(!note) return response.status(404).json({'error': 'Note not found!'})
    response.json(note)
  } catch {
    response.status(400).json({'error': 'Malformatted ID!'})
  }

})

app.delete('/api/notes/:id', async (request: Request, response: Response) => {
  
  const id = request.params.id

  try {
    
    const deletedNote = await Note.findByIdAndDelete(id)
    if(!deletedNote) return response.status(404).json({'error': 'Note not found!'})
    
      response.status(200).json({
      'Message': 'Note deleted successfully!',
      'data': deletedNote
    })

  } catch {
    response.status(400).json({'error': 'Malformatted ID!'})
  }

})

app.post('/api/notes', async (request: Request<{}, {}, INewNoteBody>, response: Response) => {

  const {content, important} = request.body

  if(!content || important === undefined) return response.status(400).json({
    'error': 'Missing Content'
  })

  const newNote = new Note({
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
