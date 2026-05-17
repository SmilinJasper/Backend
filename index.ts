const express = require('express')
const morgan = require('morgan')
// import {response, request, type Request, type Response} from 'express'

interface Note {
    id: string;
    content: string;
    important: boolean;
}

interface NewNoteBody {
  content: string;
  important: boolean;
}

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

const generateNewId = (notes: Note[]) => {
  const currentId = notes.length == 0 ? 0 : Math.max(...notes.map(note => Number(note.id)))
  return String(currentId + 1)
}

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

app.post('/api/notes', (request: Request<{}, {}, NewNoteBody>, response: Response) => {

  const newId: string = generateNewId(notes)

  const {content, important} = request.body

  if(!content || !important) return response.status(400).json({
    'Error': 'Missing Content'
  })

  const newNote: Note = {
    id: newId,
    content: content,
    important: important
  }

  notes = notes.concat(newNote)

  response.status(201).json(newNote)

})

const PORT: number = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
console.log(`App listening on port ${PORT}`)
})
