import type { Request, Response, NextFunction } from "express"

export const errorHandler = (error: any, request: Request, response: Response, next: NextFunction) => {
    
    console.error(error)

    if(error.name === 'CastError') {
        return response.status(400).json({'error': 'Request contains malformatted ID!'})
    }

    if(error.name === 'ValidationError') {
        return response.status(400).json({'error': error.message})
    }

    next(error)
}