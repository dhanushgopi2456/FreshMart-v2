import mongoose from 'mongoose'

export interface INotification {
  user: mongoose.Types.ObjectId
  type: 'ORDER' | 'PROMO' | 'SYSTEM' | 'AI'
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['ORDER', 'PROMO', 'SYSTEM', 'AI'], default: 'SYSTEM' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, trim: true, maxlength: 1000 },
    link: { type: String, maxlength: 300 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Notification = mongoose.model<INotification>('Notification', notificationSchema)