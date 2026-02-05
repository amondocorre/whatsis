const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3 })
    .withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
];

const registerValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
];

const senderValidation = [
  body('alias')
    .trim()
    .notEmpty()
    .withMessage('El alias es requerido')
    .isLength({ max: 100 })
    .withMessage('El alias no puede exceder 100 caracteres'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('El número de teléfono es requerido')
    .isNumeric()
    .withMessage('El número de teléfono debe contener solo dígitos')
    .isLength({ min: 10, max: 20 })
    .withMessage('El número de teléfono debe tener entre 10 y 20 dígitos'),
  validate
];

module.exports = {
  validate,
  loginValidation,
  registerValidation,
  senderValidation
};
