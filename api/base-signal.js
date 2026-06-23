import express from 'express'
import { HTTPFacilitatorClient } from '@x402/core/server'
import { ExactEvmScheme } from '@x402/evm/exact/server'
import { paymentMiddleware, x402ResourceServer } from '@x402/express'
import {
  createBaseSignalPaymentRoute,
  createBaseSignalPayload,
  getX402Settings,
} from '../server/x402-config.js'

const app = express()
const settings = getX402Settings()

app.set('trust proxy', true)
app.use(express.json())

const facilitatorClient = new HTTPFacilitatorClient({
  url: settings.facilitatorUrl,
})

const resourceServer = new x402ResourceServer(facilitatorClient).register(
  settings.network,
  new ExactEvmScheme(),
)

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

export default app
