import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { HTTPFacilitatorClient } from '@x402/core/server'
import { ExactEvmScheme } from '@x402/evm/exact/server'
import { paymentMiddleware, x402ResourceServer } from '@x402/express'
import {
  createBaseSignalPaymentRoute,
  createBaseSignalPayload,
  getX402Settings,
} from './x402-config.js'

const app = express()
const port = Number(process.env.X402_PORT || 4021)
const settings = getX402Settings()

app.set('trust proxy', true)
app.use(cors())
app.use(express.json())

const facilitatorClient = new HTTPFacilitatorClient({
  url: settings.facilitatorUrl,
})

const resourceServer = new x402ResourceServer(facilitatorClient).register(
  settings.network,
  new ExactEvmScheme(),
)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'based-guestbook-x402',
    network: settings.network,
    builderCode: settings.builderCode,
  })
})

app.use(
  paymentMiddleware(
    {
      'GET /api/base-signal': createBaseSignalPaymentRoute(settings),
    },
    resourceServer,
  ),
)

app.get('/api/base-signal', (_req, res) => {
  res.json(createBaseSignalPayload(settings))
})

app.listen(port, () => {
  console.log(`x402 server listening at http://localhost:${port}`)
  console.log(`Protected route: http://localhost:${port}/api/base-signal`)
})
