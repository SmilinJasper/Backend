import type { Request, Response } from 'express'

export const unknownEndpointHandler = (request: Request, response: Response) => {
    response.status(404).json({'error': 'API Endopoint does not exist!'})
}