import User from '../models/user.js';

const toDTO = (user) => {
  if (!user) return null;
  const { _id: id, name, email } = user;
  return { id: String(id), name, email };
};

export const findUsers = async () => {
  const users = await User.find().select('-password').lean();
  return users.map((u) => toDTO(u));
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email }).lean();
};

export const createUser = async ({ name, email, password }) => {
  const user = new User({ name, email, password });
  await user.save();
  return toDTO(user);
};

export default { findUsers, findUserByEmail, createUser };
