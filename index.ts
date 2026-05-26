import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import { connectToMongoDb } from './connectToMongoDb.ts';
import { Note, type INote} from './models/note.ts'
import { type INewNoteBody } from './types.ts';
import { requestLogger } from './middlewares/logger.ts'; 
import { unknownEndpointHandler } from './middlewares/unknownEndpointHandler.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

connectToMongoDb()

const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

app.get('/', (request: Request, response: Response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', async (request: Request, response: Response, next: NextFunction) => {

  try {
    const notes: INote[] = await Note.find({})
    response.json(notes)
  } catch(error) {
    next(error)
  }

})

app.get('/api/notes/:id', async (request: Request, response: Response, next: NextFunction) => {
  
  const id = request.params.id

  try {
    const note = await Note.findById(id)
    if(!note) return response.status(404).json({'error': 'Note not found!'})
    response.json(note)
  } catch(error) {
    next(error)
  }

})

app.delete('/api/notes/:id', async (request: Request, response: Response, next: NextFunction) => {
  
  const id = request.params.id

  try {
    
    const deletedNote = await Note.findByIdAndDelete(id)
    if(!deletedNote) return response.status(404).json({'error': 'Note not found!'})
    
      response.status(200).json({
      'Message': 'Note deleted successfully!',
      'data': deletedNote
    })

  } catch(error) {
    next(error)
  }

})

app.post('/api/notes', async (request: Request<{}, {}, INewNoteBody>, response: Response, next:NextFunction) => {

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
    next(error)
  }

})

app.put('/api/notes/:id', async (request: Request, response: Response, next: NextFunction) => {
  const requestItemId = request.params.id
  const {content, important} = request.body

  try {

    const updatedNote = await Note.findByIdAndUpdate(requestItemId, {
    content: content,
    important: important
    }, {new: true, runValidators: true})

  console.log(`Edited data at ${requestItemId}`)
  response.status(201).json(updatedNote)

  } catch(error) {
    next(error)
  }

})

app.use(unknownEndpointHandler)
app.use(errorHandler)

const PORT: number = Number(process.env.PORT)
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
