const { User, Role } = require('../models/relationals');

// list
async function list(req, res, next) {
  try {
    const users = await User.findAll({ include: { model: Role, as: 'role' } });
    res.json({ message: 'GET users', data: users });
  } catch (err) {
    next(err);
  }
}

// find
async function find(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      include: { model: Role, as: 'role' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'GET user by id', data: user });
  } catch (err) {
    next(err);
  }
}

// create
async function create(req, res, next) {
  try {
    const { first_name, last_name, email, roleId } = req.body;
    const user = await User.create({
      first_name,
      last_name,
      email,
      role_id: roleId
    });
    res.status(201).json({ message: 'User created', data: user });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { first_name, last_name, email, active, roleId } = req.body;
    await user.update({
      first_name: first_name ?? user.first_name,
      last_name: last_name ?? user.last_name,
      email: email ?? user.email,
      active: active ?? user.active,
      role_id: roleId ?? user.role_id
    });

    res.json({ message: 'User updated', data: user });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted', data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };