const { User, Role } = require('../models/relationals');
const { hashPassword } = require('../utils/password');


// list
async function list(req, res, next) {
  try {
    const users = await User.findAll({ attributes: ['first_name', 'last_name', 'email'], include: { model: Role, as: 'role' } });
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
    const name = req.body.name;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const roleId = req.body.roleId;
    const password = req.body.password;
    const passwordData = await hashPassword(password);
    const user = await User.create({
      first_name: name,
      last_name: lastName,
      email,
      role_id: roleId,
      password: passwordData.securePassword,
      salt_key: passwordData.saltKey
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

    const { first_name, last_name, email, active, roleId, password, passwordConfirmation } = req.body;
    const changes = {
      first_name: first_name ?? user.first_name,
      last_name: last_name ?? user.last_name,
      email: email ?? user.email,
      active: active ?? user.active,
      role_id: roleId ?? user.role_id
    };

    // Solo si quiere cambiar la contraseña
    if (password !== undefined || passwordConfirmation !== undefined) {
      if (!password || !passwordConfirmation) {
        return res.status(400).json({
          message: 'Password and passwordConfirmation are both required'
        });
      }
      if (password !== passwordConfirmation) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      const passwordData = await hashPassword(password);
      changes.password = passwordData.securePassword;
      changes.salt_key = passwordData.saltKey;
    }

    await user.update(changes);

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