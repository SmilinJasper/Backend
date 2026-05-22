import mongoose from 'mongoose';

export interface INote {
    id?: string;
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

noteSchema.set('toJSON', {
  transform(document, returnedObject: any) {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

export const Note = mongoose.model<INote>('Note', noteSchema)