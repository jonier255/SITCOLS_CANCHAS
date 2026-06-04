// src/modules/venues/venues.routes.ts

import { Router, type Router as ExpressRouter } from 'express'
import { venuesController } from './venues.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware.js'
import { requireRole } from '../../shared/middlewares/role.middleware.js'

const router: ExpressRouter = Router()

/**
 * @swagger
 * tags:
 *   - name: Venues
 *     description: Gestion de establecimientos
 *
 * components:
 *   schemas:
 *     VenueCreate:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *         - department
 *         - city
 *         - address
 *       properties:
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         department:
 *           type: string
 *         city:
 *           type: string
 *         address:
 *           type: string
 *         latitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         longitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
 *         website:
 *           type: string
 *           nullable: true
 *         instagram:
 *           type: string
 *           nullable: true
 *         facebook:
 *           type: string
 *           nullable: true
 *         whatsapp:
 *           type: string
 *           nullable: true
 *     Venue:
 *       allOf:
 *         - $ref: '#/components/schemas/VenueCreate'
 *         - type: object
 *           required:
 *             - id
 *             - ownerId
 *             - isActive
 *             - isVerified
 *             - createdAt
 *             - updatedAt
 *           properties:
 *             id:
 *               type: string
 *             ownerId:
 *               type: string
 *             isActive:
 *               type: boolean
 *             isVerified:
 *               type: boolean
 *             cancellationHoursLimit:
 *               type: integer
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *     VenueScheduleInput:
 *       type: object
 *       required:
 *         - schedules
 *       properties:
 *         schedules:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - dayOfWeek
 *               - openTime
 *               - closeTime
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               openTime:
 *                 type: string
 *                 example: '08:00'
 *               closeTime:
 *                 type: string
 *                 example: '22:00'
 *               isClosed:
 *                 type: boolean
 *                 default: false
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */

/**
 * @swagger
 * /venues:
 *   get:
 *     tags: [Venues]
 *     summary: Lista publica de establecimientos
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de venues
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: venue_1
 *                   slug: canchas-norte-cali
 *                   name: Canchas Norte Cali
 *                   description: Complejo deportivo con 4 canchas
 *                   ownerId: owner_1
 *                   department: Valle del Cauca
 *                   city: Cali
 *                   address: Calle 34 # 2N-45
 *                   latitude: 3.4516
 *                   longitude: -76.5319
 *                   phone: 3109876543
 *                   email: info@canchasnorte.com
 *                   website: null
 *                   instagram: canchasnortecali
 *                   facebook: null
 *                   whatsapp: 3109876543
 *                   isActive: true
 *                   isVerified: false
 *                   cancellationHoursLimit: 24
 *                   createdAt: 2026-06-04T12:00:00.000Z
 *                   updatedAt: 2026-06-04T12:00:00.000Z
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 1
 *                 totalPages: 1
 */
router.get('/', venuesController.getPublicList)

/**
 * @swagger
 * /venues/slug/{slug}:
 *   get:
 *     tags: [Venues]
 *     summary: Obtener venue por slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: venue_1
 *                 slug: canchas-norte-cali
 *                 name: Canchas Norte Cali
 *                 description: Complejo deportivo con 4 canchas
 *                 ownerId: owner_1
 *                 department: Valle del Cauca
 *                 city: Cali
 *                 address: Calle 34 # 2N-45
 *                 latitude: 3.4516
 *                 longitude: -76.5319
 *                 phone: 3109876543
 *                 email: info@canchasnorte.com
 *                 website: null
 *                 instagram: canchasnortecali
 *                 facebook: null
 *                 whatsapp: 3109876543
 *                 isActive: true
 *                 isVerified: false
 *                 cancellationHoursLimit: 24
 *                 createdAt: 2026-06-04T12:00:00.000Z
 *                 updatedAt: 2026-06-04T12:00:00.000Z
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/slug/:slug', venuesController.getBySlug)


router.get(
  '/mine',
  authMiddleware,
  requireRole('OWNER'),
  venuesController.getMyVenues,
)

/**
 * @swagger
 * /venues:
 *   post:
 *     tags: [Venues]
 *     summary: Crear un venue (OWNER)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VenueCreate'
 *           example:
 *             name: Canchas Norte Cali
 *             slug: canchas-norte-cali
 *             description: Complejo deportivo con 4 canchas
 *             department: Valle del Cauca
 *             city: Cali
 *             address: Calle 34 # 2N-45
 *             latitude: 3.4516
 *             longitude: -76.5319
 *             phone: 3109876543
 *             email: info@canchasnorte.com
 *             instagram: canchasnortecali
 *             whatsapp: 3109876543
 *     responses:
 *       201:
 *         description: Venue creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Venue'
 *             example:
 *               success: true
 *               data:
 *                 id: venue_1
 *                 slug: canchas-norte-cali
 *                 name: Canchas Norte Cali
 *                 description: Complejo deportivo con 4 canchas
 *                 ownerId: owner_1
 *                 department: Valle del Cauca
 *                 city: Cali
 *                 address: Calle 34 # 2N-45
 *                 latitude: 3.4516
 *                 longitude: -76.5319
 *                 phone: 3109876543
 *                 email: info@canchasnorte.com
 *                 website: null
 *                 instagram: canchasnortecali
 *                 facebook: null
 *                 whatsapp: 3109876543
 *                 isActive: true
 *                 isVerified: false
 *                 cancellationHoursLimit: 24
 *                 createdAt: 2026-06-04T12:00:00.000Z
 *                 updatedAt: 2026-06-04T12:00:00.000Z
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authMiddleware,
  requireRole('OWNER'),
  venuesController.create,
)

router.get(
  '/:venueId',
  authMiddleware,
  requireRole('OWNER', 'STAFF', 'SUPER_ADMIN'),
  tenantMiddleware,
  venuesController.getById,
)

router.patch(
  '/:venueId',
  authMiddleware,
  requireRole('OWNER', 'SUPER_ADMIN'),
  tenantMiddleware,
  venuesController.update,
)

router.patch(
  '/:venueId/status',
  authMiddleware,
  requireRole('SUPER_ADMIN'),
  venuesController.toggleActive,
)


/**
 * @swagger
 * /venues/{venueId}/schedules:
 *   put:
 *     tags: [Venues]
 *     summary: Reemplazar horarios del venue
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
 *             $ref: '#/components/schemas/VenueScheduleInput'
 *           example:
 *             schedules:
 *               - dayOfWeek: 1
 *                 openTime: '08:00'
 *                 closeTime: '22:00'
 *                 isClosed: false
 *               - dayOfWeek: 0
 *                 openTime: '09:00'
 *                 closeTime: '14:00'
 *                 isClosed: false
 *     responses:
 *       200:
 *         description: Horarios actualizados
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: schedule_1
 *                   venueId: venue_1
 *                   dayOfWeek: 1
 *                   openTime: '08:00'
 *                   closeTime: '22:00'
 *                   isClosed: false
 *       403:
 *         description: No permitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:venueId/schedules',
  authMiddleware,
  requireRole('OWNER', 'STAFF'),
  tenantMiddleware,
  venuesController.setSchedules,
)

router.get(
  '/:venueId/schedules',
  authMiddleware,
  requireRole('OWNER', 'STAFF', 'SUPER_ADMIN'),
  tenantMiddleware,
  venuesController.getSchedules,
)


router.get(
  '/:venueId/staff',
  authMiddleware,
  requireRole('OWNER', 'SUPER_ADMIN'),
  tenantMiddleware,
  venuesController.getStaff,
)

router.post(
  '/:venueId/staff',
  authMiddleware,
  requireRole('OWNER'),
  tenantMiddleware,
  venuesController.addStaff,
)

router.delete(
  '/:venueId/staff/:userId',
  authMiddleware,
  requireRole('OWNER'),
  tenantMiddleware,
  venuesController.removeStaff,
)

router.get(
  '/admin/all',
  authMiddleware,
  requireRole('SUPER_ADMIN'),
  venuesController.getAll,
)

export default router