import morgan from 'morgan'
import type { Request, Response } from 'express'

morgan.token('body', (request: Request, respone: Response) => {
    const requestBody = request.body 
    if(!requestBody || Object.keys(requestBody).length == 0) return ' '
    return JSON.stringify(requestBody)
})

export const requestLogger = morgan(':url :method :status :res[content-length] - :response-time ms Body: :body')