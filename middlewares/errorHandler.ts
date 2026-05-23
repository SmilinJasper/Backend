import type { Request, Response, NextFunction } from "express"

export const errorHandler = (error: any, request: Request, response: Response, next: NextFunction) => {
    
    console.error(error)

    if(error.name === 'CastError') {
        response.status(400).json({'Error': 'Request contains malformatted ID!'})
    }

    if(error.name === 'ValidationError') {
        response.status(400).json({'Error': error.message})
    }

    next(error)
}