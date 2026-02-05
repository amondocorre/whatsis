const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

const authController = {
  async register(req, res, next) {
    try {
      const { username, email, password, role, companyId } = req.body;

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El usuario o email ya existe'
        });
      }

      const user = await User.create({
        username,
        email,
        password,
        role: role || 'operador',
        companyId: companyId || null
      });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Usuario inactivo. Contacte al administrador'
        });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      res.json({
        success: true,
        data: req.user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { username, email, password, role, companyId } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (role) updateData.role = role;
      if (companyId !== undefined) updateData.companyId = companyId;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await user.update({ isActive: false });

      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
