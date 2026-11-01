const { User, Role } = require('../models/relationals');
const { hashPassword } = require('../utils/password');
const { parseId } = require('../utils/http');

const MIN_PASSWORD_LENGTH = 8;
const validPassword = (password) => typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;

// list
async function list(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'active', 'role_id'],
      include: { model: Role, as: 'role' },
      order: [['id', 'ASC']]
    });
    res.json({ message: req.__('users.list'), data: users });
  } catch (err) {
    next(err);
  }
}

// find
async function find(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const user = await User.findByPk(id, {
      include: { model: Role, as: 'role' }
    });
    if (!user) return res.status(404).json({ message: req.__('users.notFound') });
    res.json({ message: req.__('users.found'), data: user });
  } catch (err) {
    next(err);
  }
}

// create
async function create(req, res, next) {
  try {
    const { name, lastName, email, roleId, password } = req.body;
    if (!validPassword(password)) {
      return res.status(400).json({ message: req.__('users.invalidPassword') });
    }
    const passwordData = await hashPassword(password);
    const user = await User.create({
      first_name: name,
      last_name: lastName,
      email,
      role_id: roleId,
      password: passwordData.securePassword,
      salt_key: passwordData.saltKey
    });
    res.status(201).json({ message: req.__('users.created'), data: user });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: req.__('users.notFound') });

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
        return res.status(400).json({ message: req.__('users.passwordConfirmationRequired') });
      }
      if (password !== passwordConfirmation) {
        return res.status(400).json({ message: req.__('users.passwordsDoNotMatch') });
      }
      if (!validPassword(password)) {
        return res.status(400).json({ message: req.__('users.invalidPassword') });
      }

      const passwordData = await hashPassword(password);
      changes.password = passwordData.securePassword;
      changes.salt_key = passwordData.saltKey;
    }

    await user.update(changes);

    res.json({ message: req.__('users.updated'), data: user });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: req.__('users.notFound') });
    await user.destroy();
    res.json({ message: req.__('users.deleted'), data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };