import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        country: { type: String },
        balance: { type: Number, default: 100000 },
    },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
