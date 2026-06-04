
import { Router, type Router as ExpressRouter } from 'express'
import { authController } from './auth.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'
import { requireRole } from '../../shared/middlewares/role.middleware.js'

const router: ExpressRouter = Router()

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticacion y gestion de usuarios
 *
 * components:
 *   schemas:
 *     AuthRegister:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         fullName:
 *           type: string
 *         phone:
 *           type: string
 *     AuthLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     RefreshToken:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         fullName:
 *           type: string
 *         role:
 *           type: string
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *         tokens:
 *           $ref: '#/components/schemas/AuthTokens'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar usuario cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegister'
 *           example:
 *             email: cliente@example.com
 *             password: Passw0rdA
 *             fullName: Juan Perez
 *             phone: 3001234567
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               user:
 *                 id: user_123
 *                 email: cliente@example.com
 *                 fullName: Juan Perez
 *                 role: CLIENT
 *                 avatarUrl: null
 *               tokens:
 *                 accessToken: eyJhbGciOi...
 *                 refreshToken: eyJhbGciOi...
 */
router.post('/register', authController.register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLogin'
 *           example:
 *             email: cliente@example.com
 *             password: Passw0rdA
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               user:
 *                 id: user_123
 *                 email: cliente@example.com
 *                 fullName: Juan Perez
 *                 role: CLIENT
 *                 avatarUrl: null
 *               tokens:
 *                 accessToken: eyJhbGciOi...
 *                 refreshToken: eyJhbGciOi...
 */
router.post('/login', authController.login)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *           example:
 *             refreshToken: eyJhbGciOi...
 *     responses:
 *       200:
 *         description: Tokens renovados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *             example:
 *               accessToken: eyJhbGciOi...
 *               refreshToken: eyJhbGciOi...
 */
router.post('/refresh', authController.refresh)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesion con refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *           example:
 *             refreshToken: eyJhbGciOi...
 *     responses:
 *       204:
 *         description: Logout exitoso
 */
router.post('/logout', authController.logout)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: user_123
 *                 email: cliente@example.com
 *                 fullName: Juan Perez
 *                 phone: 3001234567
 *                 avatarUrl: null
 *                 role: CLIENT
 *                 createdAt: 2026-06-04T12:00:00.000Z
 */
router.get('/me', authMiddleware, authController.me)

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar todas las sesiones
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Sesiones cerradas
 */
router.post('/logout-all', authMiddleware, authController.logoutAll)

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Cambiar contrasena
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *           example:
 *             currentPassword: Passw0rdA
 *             newPassword: NewPassw0rdA
 *     responses:
 *       204:
 *         description: Contrasena cambiada
 */
router.patch('/change-password', authMiddleware, authController.changePassword)
/**
 * @swagger
 * /auth/set-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Establecer contrasena temporal
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - temporaryPassword
 *               - newPassword
 *             properties:
 *               temporaryPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *           example:
 *             temporaryPassword: TempPass1A
 *             newPassword: NewPassw0rdA
 *     responses:
 *       204:
 *         description: Contrasena establecida
 */
router.patch('/set-password', authMiddleware, authController.setPassword)

/**
 * @swagger
 * /auth/admin/owners:
 *   post:
 *     tags: [Auth]
 *     summary: Crear owner (SUPER_ADMIN)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               temporaryPassword:
 *                 type: string
 *           example:
 *             email: owner@example.com
 *             fullName: Maria Owner
 *             phone: 3001231234
 *             temporaryPassword: TempPass1A
 *     responses:
 *       201:
 *         description: Owner creado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: user_owner_1
 *                   email: owner@example.com
 *                   fullName: Maria Owner
 *                   role: OWNER
 *                 temporaryPassword: TempPass1A
 */
router.post(
  '/admin/owners',
  authMiddleware,
  requireRole('SUPER_ADMIN'),
  authController.createOwner,
)

/**
 * @swagger
 * /auth/admin/owners:
 *   get:
 *     tags: [Auth]
 *     summary: Listar owners (SUPER_ADMIN)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de owners
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: user_owner_1
 *                   email: owner@example.com
 *                   fullName: Maria Owner
 *                   phone: 3001231234
 *                   isActive: true
 *                   createdAt: 2026-06-04T12:00:00.000Z
 */
router.get(
  '/admin/owners',
  authMiddleware,
  requireRole('SUPER_ADMIN'),
  authController.getAllOwners,
)

/**
 * @swagger
 * /auth/admin/owners/{ownerId}/status:
 *   patch:
 *     tags: [Auth]
 *     summary: Activar o desactivar owner (SUPER_ADMIN)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *           example:
 *             isActive: true
 *     responses:
 *       200:
 *         description: Owner actualizado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: user_owner_1
 *                 email: owner@example.com
 *                 fullName: Maria Owner
 *                 isActive: true
 */
router.patch(
  '/admin/owners/:ownerId/status',
  authMiddleware,
  requireRole('SUPER_ADMIN'),
  authController.toggleOwnerActive,
)

// pa tener en cuenta: cuando el modulo venues se haga, tenantMiddleware se agrega 
/**
 * @swagger
 * /auth/venues/{venueId}/staff:
 *   post:
 *     tags: [Auth]
 *     summary: Crear staff para un venue (OWNER)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: venueId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               temporaryPassword:
 *                 type: string
 *           example:
 *             email: staff@example.com
 *             fullName: Pedro Staff
 *             phone: 3001112233
 *             temporaryPassword: TempPass1A
 *     responses:
 *       201:
 *         description: Staff creado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: user_staff_1
 *                   email: staff@example.com
 *                   fullName: Pedro Staff
 *                   role: STAFF
 *                 temporaryPassword: TempPass1A
 */
router.post(
  '/venues/:venueId/staff',
  authMiddleware,
  requireRole('OWNER'),
  authController.createStaff,
)

export default router